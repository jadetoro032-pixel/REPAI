import { describe, expect, it } from "vitest";
import {
  buildTeamsBotResponse,
  createTeamsReplyActivity,
  sendTeamsBotReply,
  type TeamsBotActivity,
} from "../src/integrations/teamsBotMessaging.js";

const activity: TeamsBotActivity = {
  type: "message",
  id: "activity-id",
  serviceUrl: "https://smba.trafficmanager.net/emea/",
  text: "Use demo connection",
  conversation: { id: "conversation-id" },
  from: { id: "user-id", name: "Judge" },
  recipient: { id: "bot-id", name: "RepAI" },
};

describe("Teams bot messaging", () => {
  it("replies as RepAI when the judge uses the demo connection", () => {
    const response = buildTeamsBotResponse("use demo connection");

    expect(response).toContain("Demo connection selected");
    expect(response).toContain("I have read your demo work context");
    expect(response).toContain("Start Teams call");
  });

  it("replies with the Teams call command instead of setup instructions", () => {
    const response = buildTeamsBotResponse("hello");

    expect(response).toContain("I am RepAI");
    expect(response).toContain("Use demo connection");
    expect(response).toContain("Start Teams call");
    expect(response).not.toContain("Azure Bot Registration");
  });

  it("creates a Bot Framework reply activity addressed back to the user", () => {
    const reply = createTeamsReplyActivity(activity, "Hello from RepAI");

    expect(reply).toMatchObject({
      type: "message",
      text: "Hello from RepAI",
      from: activity.recipient,
      recipient: activity.from,
      conversation: activity.conversation,
    });
  });

  it("sends the reply through the Bot Framework conversation endpoint", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      calls.push({ url, body: String(init?.body ?? "") });

      if (url.includes("/oauth2/v2.0/token")) {
        return new Response(JSON.stringify({ access_token: "bot-token" }), { status: 200 });
      }

      return new Response(JSON.stringify({ id: "reply-id" }), { status: 201 });
    };

    const result = await sendTeamsBotReply(
      activity,
      "Hello from RepAI",
      {
        REPAI_TEAMS_BOT_ID: "bot-id",
        REPAI_TEAMS_BOT_PASSWORD: "secret-value",
      },
      fakeFetch,
    );

    expect(result.ok).toBe(true);
    expect(calls.some((call) => call.url === "https://smba.trafficmanager.net/emea/v3/conversations/conversation-id/activities/activity-id")).toBe(true);
    expect(calls.at(-1)?.body).toContain("Hello from RepAI");
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });
});
