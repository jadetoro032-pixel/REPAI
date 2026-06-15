import { describe, expect, it } from "vitest";
import {
  buildJoinMeetingCallPayload,
  createTeamsMeetingCall,
  hangUpCall,
  parseTeamsMeetingLink,
  playOpeningPrompt,
} from "../src/integrations/graphTeamsCall.js";

describe("Graph Teams meeting call integration", () => {
  it("parses the short Teams meeting URL used by the hackathon demo", () => {
    const parsed = parseTeamsMeetingLink("https://teams.microsoft.com/meet/375029698220440?p=PASSCODE123");

    expect(parsed).toEqual({
      joinMeetingId: "375029698220440",
      passcode: "PASSCODE123",
    });
  });

  it("builds a Microsoft Graph join-meeting payload with service-hosted audio", () => {
    const payload = buildJoinMeetingCallPayload({
      callbackUri: "https://repai.example/api/calling",
      tenantId: "tenant-id",
      joinMeetingId: "375029698220440",
      passcode: "PASSCODE123",
      mediaUrl: "https://repai.example/media/opening.wav",
      mediaResourceId: "repai-opening",
    });

    expect(payload).toMatchObject({
      "@odata.type": "#microsoft.graph.call",
      callbackUri: "https://repai.example/api/calling",
      requestedModalities: ["audio"],
      mediaConfig: {
        "@odata.type": "#microsoft.graph.serviceHostedMediaConfig",
        preFetchMedia: [
          {
            uri: "https://repai.example/media/opening.wav",
            resourceId: "repai-opening",
          },
        ],
      },
      meetingInfo: {
        "@odata.type": "#microsoft.graph.joinMeetingIdMeetingInfo",
        joinMeetingId: "375029698220440",
        passcode: "PASSCODE123",
      },
      tenantId: "tenant-id",
    });
  });

  it("returns the Graph error honestly when permissions are missing", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      calls.push({ url, body: String(init?.body ?? "") });

      if (url.includes("/oauth2/v2.0/token")) {
        return new Response(JSON.stringify({ access_token: "token" }), { status: 200 });
      }

      return new Response(JSON.stringify({ error: { code: "Forbidden", message: "Missing Calls.JoinGroupCall.All" } }), {
        status: 403,
      });
    };

    const result = await createTeamsMeetingCall(
      {
        REPAI_PUBLIC_BASE_URL: "https://repai.example",
        REPAI_TEAMS_BOT_ID: "bot-id",
        REPAI_TEAMS_BOT_PASSWORD: "secret-value",
        REPAI_TENANT_ID: "tenant-id",
        REPAI_DEMO_MEETING_URL: "https://teams.microsoft.com/meet/375029698220440?p=PASSCODE123",
      },
      { mediaUrl: "https://repai.example/media/opening.wav" },
      fakeFetch,
    );

    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(result.message).toContain("Missing Calls.JoinGroupCall.All");
    expect(JSON.stringify(result)).not.toContain("secret-value");
    expect(calls.some((call) => call.url === "https://graph.microsoft.com/v1.0/communications/calls")).toBe(true);
  });

  it("plays the RepAI opening prompt after Graph reports the call is established", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      calls.push({ url, body: String(init?.body ?? "") });

      if (url.includes("/oauth2/v2.0/token")) {
        return new Response(JSON.stringify({ access_token: "token" }), { status: 200 });
      }

      return new Response(JSON.stringify({ id: "operation-id", status: "running" }), { status: 200 });
    };

    const result = await playOpeningPrompt(
      "call-id",
      {
        REPAI_TEAMS_BOT_ID: "bot-id",
        REPAI_TEAMS_BOT_PASSWORD: "secret-value",
        REPAI_TENANT_ID: "tenant-id",
      },
      "https://repai.example/media/opening.wav",
      fakeFetch,
    );

    expect(result.ok).toBe(true);
    expect(calls.some((call) => call.url === "https://graph.microsoft.com/v1.0/communications/calls/call-id/playPrompt")).toBe(
      true,
    );
    expect(calls.at(-1)?.body).toContain("https://repai.example/media/opening.wav");
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });

  it("hangs up after the RepAI opening prompt", async () => {
    const calls: Array<{ url: string; method?: string }> = [];
    const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
      const url = input.toString();
      calls.push({ url, method: init?.method });

      if (url.includes("/oauth2/v2.0/token")) {
        return new Response(JSON.stringify({ access_token: "token" }), { status: 200 });
      }

      return new Response(null, { status: 204 });
    };

    const result = await hangUpCall(
      "call-id",
      {
        REPAI_TEAMS_BOT_ID: "bot-id",
        REPAI_TEAMS_BOT_PASSWORD: "secret-value",
        REPAI_TENANT_ID: "tenant-id",
      },
      fakeFetch,
    );

    expect(result.ok).toBe(true);
    expect(calls).toContainEqual({
      url: "https://graph.microsoft.com/v1.0/communications/calls/call-id",
      method: "DELETE",
    });
    expect(JSON.stringify(result)).not.toContain("secret-value");
  });
});
