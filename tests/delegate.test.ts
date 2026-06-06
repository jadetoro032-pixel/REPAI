import { describe, expect, it } from "vitest";
import {
  answerFromKnowledge,
  buildMeetingBrief,
  createDelegateOpening,
  suggestFollowUp,
} from "../src/domain/delegate.js";
import type { KnowledgeDocument, MeetingContext, TranscriptTurn, UserProfile } from "../src/domain/types.js";

const user: UserProfile = {
  displayName: "Jeremiah",
  role: "Product Lead",
  delegateName: "RepAI",
};

const meeting: MeetingContext = {
  title: "Product Sync",
  organizer: "Aisha",
  attendees: ["Aisha", "Mina", "Tunde", "RepAI"],
  agenda: ["Launch readiness", "Support escalation", "Pricing approval"],
};

const knowledge: KnowledgeDocument[] = [
  {
    id: "wiki-launch",
    title: "Launch Readiness Wiki",
    source: "SharePoint Wiki",
    body: "Launch approval requires product, legal, and support readiness signoff before public release.",
  },
  {
    id: "folder-support",
    title: "Support Escalation Folder",
    source: "OneDrive Knowledge Folder",
    body: "Enterprise support incidents must be acknowledged within four business hours and assigned to an incident owner.",
  },
];

describe("RepAI delegate", () => {
  it("discloses that it is attending as Jeremiah's delegate", () => {
    const opening = createDelegateOpening(user, meeting);

    expect(opening).toContain("RepAI");
    expect(opening).toContain("attending as Jeremiah's delegate");
    expect(opening).not.toContain("I am Jeremiah");
  });

  it("answers from approved knowledge with citations", () => {
    const answer = answerFromKnowledge(
      "What signoff do we need before launch approval?",
      knowledge,
      user,
    );

    expect(answer.status).toBe("answered");
    expect(answer.message).toContain("product, legal, and support readiness signoff");
    expect(answer.citations).toEqual([
      {
        documentId: "wiki-launch",
        title: "Launch Readiness Wiki",
        source: "SharePoint Wiki",
      },
    ]);
  });

  it("refuses unsupported questions instead of inventing an answer", () => {
    const answer = answerFromKnowledge(
      "Can Jeremiah approve a 40 percent enterprise discount today?",
      knowledge,
      user,
    );

    expect(answer.status).toBe("needs_review");
    expect(answer.message).toContain("I do not have approved knowledge");
    expect(answer.message).toContain("Jeremiah should review");
    expect(answer.citations).toEqual([]);
  });

  it("builds a post-meeting brief with decisions, actions, risks, and mentions", () => {
    const transcript: TranscriptTurn[] = [
      { speaker: "Aisha", text: "Decision: launch stays on Friday after support confirms coverage." },
      { speaker: "Mina", text: "Action: Jeremiah to review the pricing exception by 3 PM." },
      { speaker: "Tunde", text: "Risk: legal signoff may slip if procurement changes the contract language." },
      { speaker: "Aisha", text: "Jeremiah should know customer onboarding needs one more checklist." },
    ];

    const brief = buildMeetingBrief(user, meeting, transcript);

    expect(brief.summary).toContain("Product Sync");
    expect(brief.decisions).toEqual(["launch stays on Friday after support confirms coverage."]);
    expect(brief.actionItems).toEqual(["Jeremiah to review the pricing exception by 3 PM."]);
    expect(brief.risks).toEqual(["legal signoff may slip if procurement changes the contract language."]);
    expect(brief.mentionsForUser).toHaveLength(2);
  });

  it("suggests a follow-up message for Jeremiah to review", () => {
    const brief = buildMeetingBrief(user, meeting, [
      { speaker: "Mina", text: "Action: Jeremiah to review the pricing exception by 3 PM." },
    ]);

    const followUp = suggestFollowUp(user, brief);

    expect(followUp).toContain("Draft for Jeremiah to review");
    expect(followUp).toContain("pricing exception");
    expect(followUp).not.toContain("sent automatically");
  });
});
