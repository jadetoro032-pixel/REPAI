import { buildMeetingBrief, suggestFollowUp } from "../domain/delegate.js";
import { buildBriefAdaptiveCard, wrapAdaptiveCardForTeamsWebhook } from "../integrations/teamsAdaptiveCard.js";
import { jeremiah, productSync, transcript } from "./sampleData.js";

const brief = buildMeetingBrief(jeremiah, productSync, transcript);
const followUp = suggestFollowUp(jeremiah, brief);
const card = buildBriefAdaptiveCard(jeremiah, brief, followUp, {
  meetingUrl: "https://teams.microsoft.com/l/meetup-join/demo",
  reviewUrl: "https://contoso.sharepoint.com/sites/repai/review",
});

console.log(JSON.stringify(wrapAdaptiveCardForTeamsWebhook(card), null, 2));
