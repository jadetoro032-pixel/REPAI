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
  it("replies as RepAI when the judge uses the demo connection", async () => {
    const response = await buildTeamsBotResponse("use demo connection");

    expect(response.text).toContain("Demo connection selected");
    expect(response.text).toContain("I have read your demo work context");
    expect(response.text).toContain("Start Teams call");
  });

  it("replies with the Teams call command instead of setup instructions", async () => {
    const response = await buildTeamsBotResponse("hello");

    expect(response.text).toContain("I am RepAI");
    expect(response.text).toContain("Use demo connection");
    expect(response.text).toContain("Start Teams call");
    expect(response.text).toContain("@RepAI handle");
    expect(response.text).not.toContain("Azure Bot Registration");
  });

  it("returns the brief template when the user asks for a brief", async () => {
    const response = await buildTeamsBotResponse("send call brief");

    expect(response.text).toContain("Meeting brief");
    expect(response.text).toContain("Staff Support");
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
        REPAI_TENANT_ID: "tenant-id",
      },
      fakeFetch,
    );

    expect(result.ok).toBe(true);
    expect(calls.some((call) => call.url === "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token")).toBe(true);
    expect(calls.some((call) => call.url === "https://smba.trafficmanager.net/emea/v3/conversations/conversation-id/activities/activity-id")).toBe(true);
    expect(calls.at(-1)?.body).toContain("Hello from RepAI");
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });

  it("sends adaptive card payloads as Bot Framework attachments", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const adaptiveCard = {
      type: "AdaptiveCard",
      version: "1.5",
      body: [{ type: "TextBlock", text: "Meeting brief" }],
    };
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
      "Meeting brief fallback",
      {
        REPAI_TEAMS_BOT_ID: "bot-id",
        REPAI_TEAMS_BOT_PASSWORD: "secret-value",
        REPAI_TENANT_ID: "tenant-id",
      },
      fakeFetch,
      adaptiveCard,
    );

    const replyBody = JSON.parse(calls.at(-1)?.body ?? "{}");
    expect(result.ok).toBe(true);
    expect(calls.some((call) => call.url === "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token")).toBe(true);
    expect(replyBody.text).toBe("Meeting brief fallback");
    expect(replyBody.attachments).toHaveLength(1);
    expect(replyBody.attachments[0]).toMatchObject({
      contentType: "application/vnd.microsoft.card.adaptive",
      content: adaptiveCard,
    });
  });

  it("uses the Foundry AI brain for non-command messages when configured", async () => {
    const response = await buildTeamsBotResponse("What is RepAI?", {});

    expect(response.text).toContain("I am RepAI");
    expect(response.text).toContain("Use demo connection");
  });

  it("routes @RepAI handle messages to Staff Support", async () => {
    const response = await buildTeamsBotResponse("@RepAI handle summarize the onboarding checklist");

    expect(response.text).toContain("Staff Support");
    expect(response.text).toContain("auto handle");
    expect(response.text).toContain("Audit log");
  });

  it("classifies high-risk Staff Support work as escalate", async () => {
    const response = await buildTeamsBotResponse("handle approve the enterprise discount for the customer");

    expect(response.text).toContain("Staff Support");
    expect(response.text).toContain("high");
    expect(response.text).toContain("escalat");
  });

  it("classifies medium-risk Staff Support work as draft for review", async () => {
    const response = await buildTeamsBotResponse("handle respond to the customer escalation");

    expect(response.text).toContain("Staff Support");
    expect(response.text).toContain("medium");
    expect(response.text).toContain("draft");
  });

  it("routes messages containing 'staff support' to Staff Support mode", async () => {
    const response = await buildTeamsBotResponse("show me staff support for this task");

    expect(response.text).toContain("Staff Support");
    expect(response.text).toContain("Audit log");
  });

  it("includes audit log entries in Staff Support responses", async () => {
    const response = await buildTeamsBotResponse("@RepAI handle check the onboarding status");

    expect(response.text).toContain("Received work through @RepAI Teams mention");
    expect(response.text).toContain("Classified risk as");
    expect(response.text).toContain("context source");
  });
});
