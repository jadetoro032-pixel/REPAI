export interface UserProfile {
  displayName: string;
  role: string;
  delegateName: string;
}

export interface MeetingContext {
  title: string;
  organizer: string;
  attendees: string[];
  agenda: string[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  body: string;
}

export interface Citation {
  documentId: string;
  title: string;
  source: string;
}

export interface KnowledgeAnswer {
  status: "answered" | "needs_review";
  message: string;
  citations: Citation[];
}

export interface TranscriptTurn {
  speaker: string;
  text: string;
}

export interface MeetingBrief {
  meetingTitle: string;
  summary: string;
  decisions: string[];
  actionItems: string[];
  risks: string[];
  mentionsForUser: TranscriptTurn[];
}
