import type { TeamsCallMvpEnv } from "./teamsCallMvp.js";

export interface FoundryMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface FoundryResponse {
  ok: boolean;
  message: string;
}

export const REPAI_SYSTEM_PROMPT = [
  "You are RepAI, a disclosed meeting delegate and enterprise representative for Jeremiah Adetoro.",
  "",
  "Rules:",
  "- Always disclose you are RepAI, Jeremiah's delegate. Never impersonate Jeremiah.",
  "- Answer only from context provided in the conversation or from your approved knowledge.",
  '- If you cannot ground an answer, say: "I do not have approved knowledge for that. Jeremiah should review."',
  "- Never approve discounts, pricing exceptions, commitments, or legal/financial decisions.",
  "- For high-risk work, escalate to Jeremiah or the accountable owner.",
  "- Keep responses concise and professional.",
  "- You support two modes: Meeting Delegate (calls) and Staff Support (assigned work).",
  "",
  "Available commands the user can send:",
  '- "Use demo connection" — load synthetic hackathon work context',
  '- "Start Teams call" — attempt to join a Teams meeting via the backend',
  '- "Send call brief" — generate a post-meeting brief',
  '- "Switch to <role>" — change RepAI\'s active role',
].join("\n");

type FetchLike = typeof fetch;

export async function askFoundry(
  userMessage: string,
  env: TeamsCallMvpEnv,
  conversationHistory: FoundryMessage[] = [],
  fetchImpl: FetchLike = fetch,
  systemPromptOverride?: string,
): Promise<FoundryResponse> {
  if (!env.REPAI_FOUNDRY_ENDPOINT || !env.REPAI_FOUNDRY_API_KEY) {
    return {
      ok: false,
      message: "Azure AI Foundry is not configured. Set REPAI_FOUNDRY_ENDPOINT and REPAI_FOUNDRY_API_KEY.",
    };
  }

  const endpoint = env.REPAI_FOUNDRY_ENDPOINT.replace(/\/$/, "");
  const deployment = env.REPAI_FOUNDRY_DEPLOYMENT ?? "gpt-4o";
  const apiVersion = env.REPAI_FOUNDRY_API_VERSION ?? "2024-10-21";

  const messages: FoundryMessage[] = [
    { role: "system", content: systemPromptOverride ?? REPAI_SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  try {
    const response = await fetchImpl(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "api-key": env.REPAI_FOUNDRY_API_KEY,
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          messages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      return {
        ok: false,
        message: `Foundry returned ${response.status}: ${errorBody.slice(0, 200)}`,
      };
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, message: "Foundry returned an empty response." };
    }

    return { ok: true, message: content };
  } catch (error) {
    return {
      ok: false,
      message: `Foundry request failed: ${error instanceof Error ? error.message : "unknown error"}`,
    };
  }
}
