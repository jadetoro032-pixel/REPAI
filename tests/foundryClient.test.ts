import { describe, expect, it } from "vitest";
import { askFoundry } from "../src/integrations/foundryClient.js";
import type { TeamsCallMvpEnv } from "../src/integrations/teamsCallMvp.js";

function makeEnv(overrides: Partial<TeamsCallMvpEnv> = {}): TeamsCallMvpEnv {
  return {
    REPAI_FOUNDRY_ENDPOINT: "https://test.services.ai.azure.com",
    REPAI_FOUNDRY_API_KEY: "test-key",
    ...overrides,
  };
}

describe("Foundry client", () => {
  it("returns an error when the endpoint is not configured", async () => {
    const result = await askFoundry("hello", { REPAI_FOUNDRY_ENDPOINT: "", REPAI_FOUNDRY_API_KEY: "" });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("not configured");
  });

  it("returns an error when the API key is not configured", async () => {
    const result = await askFoundry("hello", { REPAI_FOUNDRY_ENDPOINT: "https://test.example.com", REPAI_FOUNDRY_API_KEY: "" });

    expect(result.ok).toBe(false);
    expect(result.message).toContain("not configured");
  });

  it("returns the AI response when Foundry responds successfully", async () => {
    const fakeFetch = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "I am RepAI, Jeremiah's disclosed delegate." } }],
        }),
        { status: 200 },
      );

    const result = await askFoundry("Who are you?", makeEnv(), [], fakeFetch);

    expect(result.ok).toBe(true);
    expect(result.message).toContain("RepAI");
  });

  it("sends the system prompt and user message to Foundry", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: input.toString(), body: String(init?.body ?? "") });
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
        { status: 200 },
      );
    };

    await askFoundry("test question", makeEnv(), [], fakeFetch);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("/openai/deployments/gpt-4o/chat/completions");
    const body = JSON.parse(calls[0].body);
    expect(body.messages[0].role).toBe("system");
    expect(body.messages[0].content).toContain("RepAI");
    expect(body.messages[body.messages.length - 1]).toEqual({ role: "user", content: "test question" });
  });

  it("includes conversation history between system and user messages", async () => {
    const calls: Array<{ body: string }> = [];
    const fakeFetch = async (_input: string | URL | Request, init?: RequestInit) => {
      calls.push({ body: String(init?.body ?? "") });
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
        { status: 200 },
      );
    };

    const history = [
      { role: "user" as const, content: "previous question" },
      { role: "assistant" as const, content: "previous answer" },
    ];

    await askFoundry("follow-up", makeEnv(), history, fakeFetch);

    const body = JSON.parse(calls[0].body);
    expect(body.messages).toHaveLength(4); // system + 2 history + user
    expect(body.messages[1]).toEqual({ role: "user", content: "previous question" });
    expect(body.messages[2]).toEqual({ role: "assistant", content: "previous answer" });
  });

  it("returns an error when Foundry returns a non-200 status", async () => {
    const fakeFetch = async () =>
      new Response("Unauthorized", { status: 401 });

    const result = await askFoundry("hello", makeEnv(), [], fakeFetch);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("401");
  });

  it("returns an error when Foundry returns empty choices", async () => {
    const fakeFetch = async () =>
      new Response(JSON.stringify({ choices: [] }), { status: 200 });

    const result = await askFoundry("hello", makeEnv(), [], fakeFetch);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("empty response");
  });

  it("returns an error when the fetch throws a network error", async () => {
    const fakeFetch = async () => {
      throw new Error("Network unreachable");
    };

    const result = await askFoundry("hello", makeEnv(), [], fakeFetch as typeof fetch);

    expect(result.ok).toBe(false);
    expect(result.message).toContain("Network unreachable");
  });

  it("does not leak the API key in responses", async () => {
    const fakeFetch = async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: "ok" } }] }),
        { status: 200 },
      );

    const env = makeEnv({ REPAI_FOUNDRY_API_KEY: "super-secret-key-12345" });
    const result = await askFoundry("hello", env, [], fakeFetch);

    expect(JSON.stringify(result)).not.toContain("super-secret-key-12345");
  });
});
