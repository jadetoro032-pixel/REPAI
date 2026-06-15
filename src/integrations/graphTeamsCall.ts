import type { TeamsCallMvpEnv } from "./teamsCallMvp.js";

export interface ParsedTeamsMeetingLink {
  joinMeetingId: string;
  passcode: string | null;
}

export interface JoinMeetingCallPayloadOptions extends ParsedTeamsMeetingLink {
  callbackUri: string;
  tenantId: string;
  mediaUrl?: string;
  mediaResourceId?: string;
}

export interface CreateTeamsMeetingCallOptions {
  mediaUrl?: string;
  mediaResourceId?: string;
}

export type GraphCallStartResult =
  | {
      ok: true;
      status: number;
      callId?: string;
      state?: string;
      message: string;
    }
  | {
      ok: false;
      status: number;
      message: string;
    };

type FetchLike = typeof fetch;

export function parseTeamsMeetingLink(meetingUrl: string): ParsedTeamsMeetingLink {
  const url = new URL(meetingUrl);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const meetIndex = pathParts.findIndex((part) => part.toLowerCase() === "meet");
  const joinMeetingId = meetIndex >= 0 ? pathParts[meetIndex + 1] : undefined;

  if (!joinMeetingId) {
    throw new Error("The Teams meeting URL must include a /meet/{meetingId} path.");
  }

  return {
    joinMeetingId,
    passcode: url.searchParams.get("p"),
  };
}

export function buildJoinMeetingCallPayload(options: JoinMeetingCallPayloadOptions) {
  const preFetchMedia =
    options.mediaUrl && options.mediaResourceId
      ? [
          {
            uri: options.mediaUrl,
            resourceId: options.mediaResourceId,
          },
        ]
      : [];

  return {
    "@odata.type": "#microsoft.graph.call",
    callbackUri: options.callbackUri,
    requestedModalities: ["audio"],
    mediaConfig: {
      "@odata.type": "#microsoft.graph.serviceHostedMediaConfig",
      ...(preFetchMedia.length > 0 ? { preFetchMedia } : {}),
    },
    meetingInfo: {
      "@odata.type": "#microsoft.graph.joinMeetingIdMeetingInfo",
      joinMeetingId: options.joinMeetingId,
      passcode: options.passcode,
    },
    tenantId: options.tenantId,
  };
}

export async function createTeamsMeetingCall(
  env: TeamsCallMvpEnv,
  options: CreateTeamsMeetingCallOptions = {},
  fetchImpl: FetchLike = fetch,
): Promise<GraphCallStartResult> {
  const missing = [
    ["REPAI_PUBLIC_BASE_URL", env.REPAI_PUBLIC_BASE_URL],
    ["REPAI_TEAMS_BOT_ID", env.REPAI_TEAMS_BOT_ID],
    ["REPAI_TEAMS_BOT_PASSWORD", env.REPAI_TEAMS_BOT_PASSWORD],
    ["REPAI_TENANT_ID", env.REPAI_TENANT_ID],
    ["REPAI_DEMO_MEETING_URL", env.REPAI_DEMO_MEETING_URL],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    return {
      ok: false,
      status: 428,
      message: `Missing required call setup: ${missing.map(([key]) => key).join(", ")}`,
    };
  }

  const token = await getGraphAccessToken(env, fetchImpl);

  if (!token.ok) {
    return {
      ok: false,
      status: token.status,
      message: token.message,
    };
  }

  const meeting = parseTeamsMeetingLink(env.REPAI_DEMO_MEETING_URL ?? "");
  const baseUrl = (env.REPAI_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const payload = buildJoinMeetingCallPayload({
    callbackUri: `${baseUrl}/api/calling`,
    tenantId: env.REPAI_TENANT_ID ?? "",
    joinMeetingId: meeting.joinMeetingId,
    passcode: meeting.passcode,
    mediaUrl: options.mediaUrl,
    mediaResourceId: options.mediaResourceId,
  });

  const callResponse = await fetchImpl("https://graph.microsoft.com/v1.0/communications/calls", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token.accessToken}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify(payload),
  });
  const callBody = (await callResponse.json().catch(() => ({}))) as Record<string, unknown>;

  if (!callResponse.ok) {
    return {
      ok: false,
      status: callResponse.status,
      message: extractGraphMessage(callBody, "Microsoft Graph refused the Teams join call request."),
    };
  }

  return {
    ok: true,
    status: callResponse.status,
    callId: typeof callBody.id === "string" ? callBody.id : undefined,
    state: typeof callBody.state === "string" ? callBody.state : undefined,
    message: "Microsoft Graph accepted the Teams join request. RepAI should appear in the meeting while the call establishes.",
  };
}

export async function playOpeningPrompt(
  callId: string,
  env: TeamsCallMvpEnv,
  mediaUrl: string,
  fetchImpl: FetchLike = fetch,
): Promise<GraphCallStartResult> {
  const token = await getGraphAccessToken(env, fetchImpl);

  if (!token.ok) {
    return {
      ok: false,
      status: token.status,
      message: token.message,
    };
  }

  const promptResponse = await fetchImpl(`https://graph.microsoft.com/v1.0/communications/calls/${callId}/playPrompt`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token.accessToken}`,
      "content-type": "application/json",
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      clientContext: `repai-opening-${Date.now()}`,
      prompts: [
        {
          "@odata.type": "#microsoft.graph.mediaPrompt",
          mediaInfo: {
            "@odata.type": "#microsoft.graph.mediaInfo",
            uri: mediaUrl,
            resourceId: "repai-opening",
          },
        },
      ],
    }),
  });
  const promptBody = (await promptResponse.json().catch(() => ({}))) as Record<string, unknown>;

  if (!promptResponse.ok) {
    return {
      ok: false,
      status: promptResponse.status,
      message: extractGraphMessage(promptBody, "Microsoft Graph refused the playPrompt request."),
    };
  }

  return {
    ok: true,
    status: promptResponse.status,
    callId,
    state: typeof promptBody.status === "string" ? promptBody.status : undefined,
    message: "RepAI sent the opening audio prompt to the Teams call.",
  };
}

export async function hangUpCall(
  callId: string,
  env: TeamsCallMvpEnv,
  fetchImpl: FetchLike = fetch,
): Promise<GraphCallStartResult> {
  const token = await getGraphAccessToken(env, fetchImpl);

  if (!token.ok) {
    return {
      ok: false,
      status: token.status,
      message: token.message,
    };
  }

  const response = await fetchImpl(`https://graph.microsoft.com/v1.0/communications/calls/${callId}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token.accessToken}`,
    },
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: extractGraphMessage(body, "Microsoft Graph refused the hang-up request."),
    };
  }

  return {
    ok: true,
    status: response.status,
    callId,
    message: "RepAI left the Teams call after the opening.",
  };
}

async function getGraphAccessToken(env: TeamsCallMvpEnv, fetchImpl: FetchLike) {
  const tokenResponse = await fetchImpl(`https://login.microsoftonline.com/${env.REPAI_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    signal: AbortSignal.timeout(15_000),
    body: new URLSearchParams({
      client_id: env.REPAI_TEAMS_BOT_ID ?? "",
      client_secret: env.REPAI_TEAMS_BOT_PASSWORD ?? "",
      grant_type: "client_credentials",
      scope: "https://graph.microsoft.com/.default",
    }),
  });
  const tokenBody = (await tokenResponse.json().catch(() => ({}))) as Record<string, unknown>;

  if (!tokenResponse.ok || typeof tokenBody.access_token !== "string") {
    return {
      ok: false as const,
      status: tokenResponse.status,
      message: extractGraphMessage(tokenBody, "Microsoft identity token request failed. Check bot secret, tenant ID, and app registration."),
    };
  }

  return {
    ok: true as const,
    status: tokenResponse.status,
    accessToken: tokenBody.access_token,
  };
}

function extractGraphMessage(body: Record<string, unknown>, fallback: string): string {
  const error = body.error;
  if (typeof error === "object" && error !== null) {
    const message = "message" in error ? (error as { message?: unknown }).message : undefined;
    const code = "code" in error ? (error as { code?: unknown }).code : undefined;

    if (typeof message === "string" && typeof code === "string") {
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
