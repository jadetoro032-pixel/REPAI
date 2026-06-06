import {
  answerFromKnowledge,
  buildMeetingBrief,
  createDelegateOpening,
  suggestFollowUp,
} from "../domain/delegate.js";
import { jeremiah, knowledgeBase, productSync, transcript } from "./sampleData.js";

const opening = createDelegateOpening(jeremiah, productSync);
const supportedAnswer = answerFromKnowledge(
  "What signoff do we need before launch approval?",
  knowledgeBase,
  jeremiah,
);
const unsupportedAnswer = answerFromKnowledge(
  "Can Jeremiah approve a 40 percent enterprise discount today?",
  knowledgeBase,
  jeremiah,
);
const brief = buildMeetingBrief(jeremiah, productSync, transcript);
const followUp = suggestFollowUp(jeremiah, brief);

console.log("REPAI MEETING DELEGATE DEMO");
console.log("===========================");
console.log();
console.log("Opening disclosure");
console.log(opening);
console.log();
console.log("Grounded answer");
console.log(supportedAnswer.message);
console.log(`Citations: ${supportedAnswer.citations.map((citation) => citation.title).join(", ")}`);
console.log();
console.log("Unsupported answer");
console.log(unsupportedAnswer.message);
console.log();
console.log("Post-meeting brief");
console.log(brief.summary);
console.log(`Decisions: ${brief.decisions.join(" | ")}`);
console.log(`Action items: ${brief.actionItems.join(" | ")}`);
console.log(`Risks: ${brief.risks.join(" | ")}`);
console.log(`Mentions for Jeremiah: ${brief.mentionsForUser.map((turn) => `${turn.speaker}: ${turn.text}`).join(" | ")}`);
console.log();
console.log("Suggested follow-up");
console.log(followUp);
