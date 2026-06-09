import { askFoundry } from "../integrations/foundryClient.js";
import type { TeamsCallMvpEnv } from "../integrations/teamsCallMvp.js";

type FetchLike = typeof fetch;

export interface DeepStatusCheck {
  name: "foundry" | "graph" | "botFramework" | "speech";
  ok: boolean;
  skipped?: boolean;
  status?: number;
  message: string;
}

export interface DeepStatusResult {
  ok: boolean;
  checkedAt: string;
  checks: DeepStatusCheck[];
}

export async function buildDeepStatus(
  env: TeamsCallMvpEnv,
  fetchImpl: FetchLike = fetch,
): Promise<DeepStatusResult> {
  const checks = await Promise.all([
    checkFoundry(env, fetchImpl),
    checkGraph(env, fetchImpl),
    checkBotFramework(env, fetchImpl),
    checkSpeech(env, fetchImpl),
  ]);

  return {
    ok: checks.every((check) => check.ok),
    checkedAt: new Date().toISOString(),
    checks,
  };
}

async function checkFoundry(env: TeamsCallMvpEnv, fetchImpl: FetchLike): Promise<DeepStatusCheck> {
  if (!env.REPAI_FOUNDRY_ENDPOINT || !env.REPAI_FOUNDRY_API_KEY) {
    return skipped("foundry", "Missing REPAI_FOUNDRY_ENDPOINT or REPAI_FOUNDRY_API_KEY.");
  }

  const result = await askFoundry("Reply with ok.", env, [], fetchImpl);
  return {
    name: "foundry",
    ok: result.ok,
    status: result.ok ? 200 : 502,
    message: sanitize(result.ok ? "Foundry responded." : result.message, env),
  };
}

async function checkGraph(env: TeamsCallMvpEnv, fetchImpl: FetchLike): Promise<DeepStatusCheck> {
  if (!env.REPAI_TENANT_ID || !env.REPAI_TEAMS_BOT_ID || !env.REPAI_TEAMS_BOT_PASSWORD) {
    return skipped("graph", "Missing tenant ID, bot ID, or bot secret.");
  }

  return checkTokenEndpoint({
    name: "graph",
    url: `https://login.microsoftonline.com/${env.REPAI_TENANT_ID}/oauth2/v2.0/token`,
    scope: "https://graph.microsoft.com/.default",
    env,
    fetchImpl,
  });
}

async function checkBotFramework(env: TeamsCallMvpEnv, fetchImpl: FetchLike): Promise<DeepStatusCheck> {
  if (!env.REPAI_TENANT_ID || !env.REPAI_TEAMS_BOT_ID || !env.REPAI_TEAMS_BOT_PASSWORD) {
    return skipped("botFramework", "Missing tenant ID, bot ID, or bot secret.");
  }

  return checkTokenEndpoint({
    name: "botFramework",
    url: `https://login.microsoftonline.com/${env.REPAI_TENANT_ID}/oauth2/v2.0/token`,
    scope: "https://api.botframework.com/.default",
    env,
    fetchImpl,
  });
}

async function checkSpeech(env: TeamsCallMvpEnv, fetchImpl: FetchLike): Promise<DeepStatusCheck> {
  if (!env.REPAI_SPEECH_KEY || !env.REPAI_SPEECH_REGION) {
    return skipped("speech", "Missing REPAI_SPEECH_KEY or REPAI_SPEECH_REGION.");
  }

  try {
    const response = await fetchImpl(
      `https://${env.REPAI_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "content-type": "application/ssml+xml",
          "ocp-apim-subscription-key": env.REPAI_SPEECH_KEY,
          "x-microsoft-outputformat": "riff-16khz-16bit-mono-pcm",
          "user-agent": "repai-health-check",
        },
        signal: AbortSignal.timeout(10_000),
        body: [
          '<speak version="1.0" xml:lang="en-US">',
          '<voice xml:lang="en-US" name="en-US-JennyNeural">ok</voice>',
          "</speak>",
        ].join(""),
      },
    );

    return {
      name: "speech",
      ok: response.ok,
      status: response.status,
      message: response.ok
        ? "Azure Speech responded."
        : sanitize(`Azure Speech returned ${response.status}: ${await response.text().catch(() => "")}`, env),
    };
  } catch (error) {
    return failure("speech", error, env);
  }
}

async function checkTokenEndpoint(options: {
  name: "graph" | "botFramework";
  url: string;
  scope: string;
  env: TeamsCallMvpEnv;
  fetchImpl: FetchLike;
}): Promise<DeepStatusCheck> {
  try {
    const response = await options.fetchImpl(options.url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({
        client_id: options.env.REPAI_TEAMS_BOT_ID ?? "",
        client_secret: options.env.REPAI_TEAMS_BOT_PASSWORD ?? "",
        grant_type: "client_credentials",
        scope: options.scope,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const hasToken = typeof body.access_token === "string";

    return {
      name: options.name,
      ok: response.ok && hasToken,
      status: response.status,
      message: response.ok && hasToken
        ? `${options.name} token endpoint responded.`
        : sanitize(`${options.name} token endpoint returned ${response.status}.`, options.env),
    };
  } catch (error) {
    return failure(options.name, error, options.env);
  }
}

function skipped(name: DeepStatusCheck["name"], message: string): DeepStatusCheck {
  return {
    name,
    ok: false,
    skipped: true,
    status: 0,
    message,
  };
}

function failure(name: DeepStatusCheck["name"], error: unknown, env: TeamsCallMvpEnv): DeepStatusCheck {
  return {
    name,
    ok: false,
    status: 0,
    message: sanitize(error instanceof Error ? error.message : "Unknown error.", env),
  };
}

function sanitize(message: string, env: TeamsCallMvpEnv): string {
  const secretValues = [
    env.REPAI_TEAMS_BOT_PASSWORD,
    env.REPAI_FOUNDRY_API_KEY,
    env.REPAI_SPEECH_KEY,
  ].filter((value): value is string => Boolean(value));

  return secretValues.reduce((safeMessage, secret) => safeMessage.replaceAll(secret, "[redacted]"), message);
}
