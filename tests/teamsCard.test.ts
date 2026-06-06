import { describe, expect, it } from "vitest";
import { buildBriefAdaptiveCard, wrapAdaptiveCardForTeamsWebhook } from "../src/integrations/teamsAdaptiveCard.js";
import { buildMeetingBrief, suggestFollowUp } from "../src/domain/delegate.js";
import type { MeetingContext, TranscriptTurn, UserProfile } from "../src/domain/types.js";

const user: UserProfile = {
  displayName: "Jeremiah",
  role: "Product Lead",
  delegateName: "RepAI",
};

const meeting: MeetingContext = {
  title: "Enterprise Launch Product Sync",
  organizer: "Aisha",
  attendees: ["Aisha", "Mina", "Tunde", "RepAI"],
  agenda: ["Launch readiness", "Support escalation", "Pricing exception"],
};

const transcript: TranscriptTurn[] = [
  { speaker: "Aisha", text: "Decision: launch stays on Friday after support confirms coverage." },
  { speaker: "Mina", text: "Action: Jeremiah to review the pricing exception by 3 PM." },
  { speaker: "Tunde", text: "Risk: legal signoff may slip if procurement changes the contract language." },
];

describe("Teams Adaptive Card delivery", () => {
  it("builds a review-only meeting brief card for Jeremiah", () => {
    const brief = buildMeetingBrief(user, meeting, transcript);
    const followUp = suggestFollowUp(user, brief);

    const card = buildBriefAdaptiveCard(user, brief, followUp, {
      meetingUrl: "https://teams.microsoft.com/l/meetup-join/demo",
      reviewUrl: "https://contoso.sharepoint.com/sites/repai/review",
    });

    const payload = JSON.stringify(card);

    expect(card.type).toBe("AdaptiveCard");
    expect(card.version).toBe("1.5");
    expect(payload).toContain("RepAI attended as Jeremiah's delegate");
    expect(payload).toContain("launch stays on Friday");
    expect(payload).toContain("Jeremiah to review the pricing exception");
    expect(payload).toContain("legal signoff may slip");
    expect(payload).toContain("Draft for Jeremiah to review");
    expect(payload).toContain("Review follow-up");
    expect(payload).not.toContain("Action.Submit");
  });

  it("wraps the card in a Teams incoming webhook message envelope", () => {
    const brief = buildMeetingBrief(user, meeting, transcript);
    const followUp = suggestFollowUp(user, brief);
    const card = buildBriefAdaptiveCard(user, brief, followUp);

    const message = wrapAdaptiveCardForTeamsWebhook(card);

    expect(message.type).toBe("message");
    expect(message.attachments).toHaveLength(1);
    expect(message.attachments[0]?.contentType).toBe("application/vnd.microsoft.card.adaptive");
    expect(message.attachments[0]?.content).toBe(card);
  });
});
