import type {
  Citation,
  KnowledgeAnswer,
  KnowledgeDocument,
  MeetingBrief,
  MeetingContext,
  TranscriptTurn,
  UserProfile,
} from "./types.js";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "before",
  "can",
  "do",
  "for",
  "from",
  "have",
  "i",
  "is",
  "it",
  "of",
  "on",
  "the",
  "to",
  "today",
  "we",
  "what",
]);

export function createDelegateOpening(user: UserProfile, meeting: MeetingContext): string {
  const agenda = meeting.agenda.length > 0 ? ` The agenda I have is: ${meeting.agenda.join("; ")}.` : "";

  return `Hi, I'm ${user.delegateName}, attending as ${user.displayName}'s delegate for ${meeting.title}. I can capture decisions, answer from approved knowledge, and flag anything ${user.displayName} should review.${agenda}`;
}

export function answerFromKnowledge(
  question: string,
  documents: KnowledgeDocument[],
  user: UserProfile,
): KnowledgeAnswer {
  const queryTerms = tokenize(question);
  const matches = documents
    .map((document) => ({
      document,
      score: scoreDocument(queryTerms, document),
    }))
    .filter((match) => match.score >= 2)
    .sort((left, right) => right.score - left.score);

  const bestMatch = matches[0];

  if (!bestMatch) {
    return {
      status: "needs_review",
      message: `I do not have approved knowledge to answer that confidently. ${user.displayName} should review before anyone treats this as a commitment.`,
      citations: [],
    };
  }

  const citedSentence = selectRelevantSentence(bestMatch.document.body, queryTerms);

  return {
    status: "answered",
    message: `From ${bestMatch.document.title}: ${citedSentence}`,
    citations: [toCitation(bestMatch.document)],
  };
}

export function buildMeetingBrief(
  user: UserProfile,
  meeting: MeetingContext,
  transcript: TranscriptTurn[],
): MeetingBrief {
  const decisions = extractLabeledItems(transcript, "Decision");
  const actionItems = extractLabeledItems(transcript, "Action");
  const risks = extractLabeledItems(transcript, "Risk");
  const mentionsForUser = transcript.filter((turn) =>
    turn.text.toLowerCase().includes(user.displayName.toLowerCase()),
  );

  return {
    meetingTitle: meeting.title,
    summary: `${meeting.title} covered ${meeting.agenda.join(", ")}. ${decisions.length} decision(s), ${actionItems.length} action item(s), and ${risks.length} risk(s) were captured for ${user.displayName}.`,
    decisions,
    actionItems,
    risks,
    mentionsForUser,
  };
}

export function suggestFollowUp(user: UserProfile, brief: MeetingBrief): string {
  const actionLine =
    brief.actionItems.length > 0
      ? `I will review: ${brief.actionItems.join(" ")}`
      : "I reviewed the notes and do not see a pending action for me.";

  return `Draft for ${user.displayName} to review: Thanks for the discussion. ${actionLine} This is review-only until ${user.displayName} approves it.`;
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function scoreDocument(queryTerms: string[], document: KnowledgeDocument): number {
  const documentTerms = new Set(tokenize(`${document.title} ${document.body}`));

  return queryTerms.reduce((score, term) => {
    if (documentTerms.has(term)) {
      return score + 1;
    }

    return score;
  }, 0);
}

function selectRelevantSentence(body: string, queryTerms: string[]): string {
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const ranked = sentences
    .map((sentence) => ({
      sentence,
      score: scoreText(queryTerms, sentence),
    }))
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.sentence ?? body;
}

function scoreText(queryTerms: string[], text: string): number {
  const textTerms = new Set(tokenize(text));

  return queryTerms.reduce((score, term) => score + (textTerms.has(term) ? 1 : 0), 0);
}

function toCitation(document: KnowledgeDocument): Citation {
  return {
    documentId: document.id,
    title: document.title,
    source: document.source,
  };
}

function extractLabeledItems(transcript: TranscriptTurn[], label: "Decision" | "Action" | "Risk"): string[] {
  const pattern = new RegExp(`^${label}:\\s*(.+)$`, "i");

  return transcript.flatMap((turn) => {
    const match = turn.text.match(pattern);
    return match?.[1] ? [match[1]] : [];
  });
}
