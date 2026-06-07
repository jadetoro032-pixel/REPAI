import type { TeamsCallMvpEnv } from "./teamsCallMvp.js";

export interface TeamsBotAccount {
  id: string;
  name?: string;
}

export interface TeamsBotConversation {
  id: string;
}

export interface TeamsBotActivity {
  type: string;
  id?: string;
  serviceUrl?: string;
  text?: string;
  conversation?: TeamsBotConversation;
  from?: TeamsBotAccount;
  recipient?: TeamsBotAccount;
}

export type TeamsReplyResult =
  | {
      ok: true;
      status: number;
      message: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

type FetchLike = typeof fetch;

export function buildTeamsBotResponse(text: string): string {
  const normalized = text.toLowerCase();

  if (normalized.includes("use demo") || normalized.includes("demo connection") || normalized.includes("read through")) {
    return [
      "Demo connection selected.",
      "",
      "I have read your demo work context. I found the hackathon meeting about rules, the demo, and why RepAI should win.",
      "",
      "I am ready to attend as Jeremiah's disclosed delegate.",
      "",
      "Next: send `Start Teams call` and I will ask the live RepAI backend to join the configured Teams meeting.",
    ].join("\n");
  }

  if (normalized.includes("brief")) {
    return [
      "Meeting brief:",
      "RepAI prepared from synthetic demo context, positioned itself as Jeremiah's disclosed delegate, and recommended leading with the real problem: missed meetings, lost context, and delayed follow-up.",
      "",
      "Follow-up: show the Teams call path, then explain Staff Support as the assigned-work mode.",
    ].join("\n");
  }

  return [
    "I am RepAI, Jeremiah's disclosed delegate.",
    "",
    "Use one of these commands:",
    "- `Use demo connection`",
    "- `Start Teams call`",
    "- `Send call brief`",
  ].join("\n");
}

export function createTeamsReplyActivity(activity: TeamsBotActivity, text: string) {
  return {
    type: "message",
    text,
    from: activity.recipient,
    recipient: activity.from,
    conversation: activity.conversation,
    replyToId: activity.id,
  };
}

export async function sendTeamsBotReply(
  activity: TeamsBotActivity,
  text: string,
  env: TeamsCallMvpEnv,
  fetchImpl: FetchLike = fetch,
): Promise<TeamsReplyResult> {
  if (!env.REPAI_TEAMS_BOT_ID || !env.REPAI_TEAMS_BOT_PASSWORD) {
    return {
      ok: false,
      status: 428,
      message: "Missing REPAI_TEAMS_BOT_ID or REPAI_TEAMS_BOT_PASSWORD for Teams bot replies.",
    };
  }

  if (!activity.serviceUrl || !activity.conversation?.id || !activity.id) {
    return {
      ok: false,
      status: 400,
      message: "Teams activity is missing serviceUrl, conversation ID, or activity ID.",
    };
  }

  const token = await getBotFrameworkToken(env, fetchImpl);

  if (!token.ok) {
    return {
      ok: false,
      status: token.status,
      message: token.message,
    };
  }

  const serviceUrl = activity.serviceUrl.replace(/\/$/, "");
  const replyResponse = await fetchImpl(`${serviceUrl}/v3/conversations/${encodeURIComponent(activity.conversation.id)}/activities/${encodeURIComponent(activity.id)}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token.accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(createTeamsReplyActivity(activity, text)),
  });
  const replyBody = (await replyResponse.json().catch(() => ({}))) as Record<string, unknown>;

  if (!replyResponse.ok) {
    return {
      ok: false,
      status: replyResponse.status,
      message: extractMessage(replyBody, "Bot Framework refused the Teams reply."),
    };
  }

  return {
    ok: true,
    status: replyResponse.status,
    message: "RepAI replied in Teams chat.",
  };
}

async function getBotFrameworkToken(env: TeamsCallMvpEnv, fetchImpl: FetchLike) {
  const tokenResponse = await fetchImpl("https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.REPAI_TEAMS_BOT_ID ?? "",
      client_secret: env.REPAI_TEAMS_BOT_PASSWORD ?? "",
      grant_type: "client_credentials",
      scope: "https://api.botframework.com/.default",
    }),
  });
  const tokenBody = (await tokenResponse.json().catch(() => ({}))) as Record<string, unknown>;

  if (!tokenResponse.ok || typeof tokenBody.access_token !== "string") {
    return {
      ok: false as const,
      status: tokenResponse.status,
      message: extractMessage(tokenBody, "Could not get a Bot Framework token."),
    };
  }

  return {
    ok: true as const,
    status: tokenResponse.status,
    accessToken: tokenBody.access_token,
  };
}

function extractMessage(body: Record<string, unknown>, fallback: string): string {
  const error = body.error;

  if (typeof error === "object" && error !== null) {
    const message = "message" in error ? (error as { message?: unknown }).message : undefined;
    const code = "code" in error ? (error as { code?: unknown }).code : undefined;

    if (typeof code === "string" && typeof message === "string") {
      return `${code}: ${message}`;
    }

    if (typeof message === "string") {
      return message;
    }
  }

  if (typeof body.error_description === "string") {
    return body.error_description;
  }

  if (typeof body.error === "string") {
    return body.error;
  }

  return fallback;
}
