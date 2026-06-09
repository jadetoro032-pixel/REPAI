import { describe, expect, it } from "vitest";
import { buildDeepStatus } from "../src/server/deepStatus.js";
import type { TeamsCallMvpEnv } from "../src/integrations/teamsCallMvp.js";

const readyEnv: TeamsCallMvpEnv = {
  REPAI_PUBLIC_BASE_URL: "https://repai.example",
  REPAI_TEAMS_BOT_ID: "bot-id",
  REPAI_TEAMS_BOT_PASSWORD: "secret-value",
  REPAI_TENANT_ID: "tenant-id",
  REPAI_DEMO_MEETING_URL: "https://teams.microsoft.com/meet/375029698220440?p=PASSCODE123",
  REPAI_FOUNDRY_ENDPOINT: "https://foundry.example",
  REPAI_FOUNDRY_API_KEY: "foundry-secret",
  REPAI_SPEECH_KEY: "speech-secret",
  REPAI_SPEECH_REGION: "eastus",
};

describe("deep status checks", () => {
  it("checks configured Foundry, Graph, Bot Framework, and Speech services without leaking secrets", async () => {
    const calls: string[] = [];
    const fakeFetch = async (input: string | URL | Request) => {
      const url = input.toString();
      calls.push(url);

      if (url.includes("/chat/completions")) {
        return new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status: 200 });
      }

      if (url.includes("login.microsoftonline.com")) {
        return new Response(JSON.stringify({ access_token: "token" }), { status: 200 });
      }

      if (url.includes(".tts.speech.microsoft.com")) {
        return new Response("RIFF", { status: 200 });
      }

      return new Response("not found", { status: 404 });
    };

    const status = await buildDeepStatus(readyEnv, fakeFetch);

    expect(status.ok).toBe(true);
    expect(status.checks.map((check) => check.name)).toEqual([
      "foundry",
      "graph",
      "botFramework",
      "speech",
    ]);
    expect(status.checks.every((check) => check.ok)).toBe(true);
    expect(calls.some((url) => url.includes("/openai/deployments/gpt-4o/chat/completions"))).toBe(true);
    expect(calls.filter((url) => url === "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token")).toHaveLength(2);
    expect(calls.some((url) => url.includes("login.microsoftonline.com/botframework.com"))).toBe(false);
    expect(JSON.stringify(status)).not.toContain("secret-value");
    expect(JSON.stringify(status)).not.toContain("foundry-secret");
    expect(JSON.stringify(status)).not.toContain("speech-secret");
  });

  it("marks missing service configuration as skipped instead of trying live calls", async () => {
    const calls: string[] = [];
    const fakeFetch = async (input: string | URL | Request) => {
      calls.push(input.toString());
      return new Response("unexpected", { status: 500 });
    };

    const status = await buildDeepStatus({}, fakeFetch);

    expect(status.ok).toBe(false);
    expect(status.checks.every((check) => check.skipped)).toBe(true);
    expect(calls).toHaveLength(0);
  });
});
