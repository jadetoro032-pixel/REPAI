import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getTeamsCallSetupStatus, startDemoCall, type StartDemoCallRequest, type TeamsCallMvpEnv } from "../integrations/teamsCallMvp.js";
import { createTeamsMeetingCall, playOpeningPrompt } from "../integrations/graphTeamsCall.js";
import { buildTeamsBotResponse, sendTeamsBotReply, type TeamsBotActivity } from "../integrations/teamsBotMessaging.js";
import type { FoundryMessage } from "../integrations/foundryClient.js";
import { createCallStateTracker } from "./callStateTracker.js";
import { buildDeepStatus } from "./deepStatus.js";

// Conversation memory: stores the last N messages per Teams conversation for Foundry context
const MAX_HISTORY_TURNS = 10;
const conversationMemory = new Map<string, FoundryMessage[]>();
const callStateTracker = createCallStateTracker();

function getConversationHistory(conversationId: string): FoundryMessage[] {
  return conversationMemory.get(conversationId) ?? [];
}

function appendToConversationHistory(conversationId: string, userText: string, assistantReply: string): void {
  const history = conversationMemory.get(conversationId) ?? [];
  history.push({ role: "user", content: userText });
  history.push({ role: "assistant", content: assistantReply });
  // Keep only the last N turns (N * 2 messages)
  while (history.length > MAX_HISTORY_TURNS * 2) {
    history.shift();
  }
  conversationMemory.set(conversationId, history);
}

function clearConversationHistory(conversationId: string): void {
  conversationMemory.delete(conversationId);
}

function loadLocalEnvFile() {
  const envPath = join(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnvFile();

function readEnv(): TeamsCallMvpEnv {
  return {
    REPAI_PUBLIC_BASE_URL: process.env.REPAI_PUBLIC_BASE_URL,
    REPAI_TEAMS_BOT_ID: process.env.REPAI_TEAMS_BOT_ID,
    REPAI_TEAMS_BOT_PASSWORD: process.env.REPAI_TEAMS_BOT_PASSWORD,
    REPAI_TENANT_ID: process.env.REPAI_TENANT_ID,
    REPAI_DEMO_MEETING_URL: process.env.REPAI_DEMO_MEETING_URL,
    REPAI_FOUNDRY_ENDPOINT: process.env.REPAI_FOUNDRY_ENDPOINT,
    REPAI_FOUNDRY_API_KEY: process.env.REPAI_FOUNDRY_API_KEY,
    REPAI_FOUNDRY_DEPLOYMENT: process.env.REPAI_FOUNDRY_DEPLOYMENT,
    REPAI_FOUNDRY_API_VERSION: process.env.REPAI_FOUNDRY_API_VERSION,
    REPAI_SPEECH_KEY: process.env.REPAI_SPEECH_KEY,
    REPAI_SPEECH_REGION: process.env.REPAI_SPEECH_REGION,
  };
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
  });
  response.end(JSON.stringify(body, null, 2));
}

function sendNoContent(response: ServerResponse) {
  response.writeHead(204, {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
  });
  response.end();
}

function sendText(response: ServerResponse, status: number, body: string, contentType = "text/plain; charset=utf-8") {
  response.writeHead(status, {
    "content-type": contentType,
    "access-control-allow-origin": "*",
  });
  response.end(body);
}

function sendBinary(response: ServerResponse, status: number, body: Buffer, contentType: string) {
  response.writeHead(status, {
    "content-type": contentType,
    "access-control-allow-origin": "*",
    "cache-control": "no-store",
  });
  response.end(body);
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");

    console.log(`[RepAI] ${request.method} ${url.pathname}`);

    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    if (url.pathname === "/health" && request.method === "GET") {
      sendJson(response, 200, { ok: true, service: "repai-teams-call-mvp" });
      return;
    }

    if (url.pathname === "/api/status" && request.method === "GET") {
      const env = readEnv();
      const setup = getTeamsCallSetupStatus(env);
      const configured = setup.configured.map((requirement) => requirement.label);
      const missing = setup.missing.map((requirement) => ({
        label: requirement.label,
        purpose: requirement.purpose,
        requiredFor: requirement.requiredFor,
      }));

      sendJson(response, 200, {
        service: "repai-teams-call-mvp",
        version: "0.3.0",
        readyForRealTeamsCall: setup.readyForRealTeamsCall,
        configured,
        missing,
        endpoints: {
          health: "/health",
          status: "/api/status",
          statusDeep: "/api/status/deep",
          calls: "/api/calls",
          messages: "/api/messages",
          calling: "/api/calling",
          startDemoCall: "/start-demo-call",
          openapi: "/repai-call-openapi.json",
          openingAudio: "/media/opening.wav",
        },
      });
      return;
    }

    if (url.pathname === "/api/status/deep" && request.method === "GET") {
      sendJson(response, 200, await buildDeepStatus(readEnv()));
      return;
    }

    if (url.pathname === "/api/calls" && request.method === "GET") {
      sendJson(response, 200, {
        service: "repai-teams-call-mvp",
        calls: callStateTracker.list(),
      });
      return;
    }

    if (url.pathname === "/repai-call-openapi.json" && request.method === "GET") {
      sendText(
        response,
        200,
        readFileSync(join(process.cwd(), "appPackageCombined", "repai-call-openapi.json"), "utf8"),
        "application/json; charset=utf-8",
      );
      return;
    }

    if (url.pathname === "/media/opening.wav" && request.method === "GET") {
      const env = readEnv();

      if (!env.REPAI_SPEECH_KEY || !env.REPAI_SPEECH_REGION) {
        sendText(response, 503, "Azure Speech is not configured for RepAI opening audio.");
        return;
      }

      const speechResponse = await fetch(`https://${env.REPAI_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: "POST",
        headers: {
          "content-type": "application/ssml+xml",
          "ocp-apim-subscription-key": env.REPAI_SPEECH_KEY,
          "x-microsoft-outputformat": "riff-16khz-16bit-mono-pcm",
          "user-agent": "repai-teams-call-mvp",
        },
        signal: AbortSignal.timeout(15_000),
        body: buildOpeningSsml(),
      });

      if (!speechResponse.ok) {
        sendText(response, speechResponse.status, "Azure Speech could not synthesize the RepAI opening audio.");
        return;
      }

      sendBinary(response, 200, Buffer.from(await speechResponse.arrayBuffer()), "audio/wav");
      return;
    }

    if (url.pathname === "/api/calling" && request.method === "POST") {
      const authorization = request.headers.authorization;

      if (!authorization?.toLowerCase().startsWith("bearer ")) {
        sendJson(response, 401, {
          error: "Missing Teams calling authorization bearer token",
          nextAction: "Use this route only as the Teams Calling webhook from Azure Bot Service.",
        });
        return;
      }

      const body = (await readJsonBody(request)) as Record<string, unknown>;

      if (!("@odata.type" in body)) {
        sendNoContent(response);
        return;
      }

      const notification = await handleCallingNotification(body, readEnv());
      callStateTracker.record(notification);

      sendJson(response, 202, {
        accepted: true,
        service: "repai-teams-call-mvp",
        callId: notification.callId,
        state: notification.state,
        action: notification.action,
        message: notification.action === "played_opening"
          ? "Teams calling notification received. RepAI sent the opening prompt."
          : notification.action === "call_ended"
            ? "Teams calling notification received. The call has ended."
            : notification.action === "waiting_for_established"
              ? "Teams calling notification received. Waiting for the call to be established."
              : "Teams calling notification received.",
        ...(notification.promptResult ? { promptResult: notification.promptResult } : {}),
      });
      return;
    }

    if (url.pathname === "/api/messages" && request.method === "POST") {
      const authorization = request.headers.authorization;

      if (!authorization?.toLowerCase().startsWith("bearer ")) {
        sendJson(response, 401, {
          error: "Missing Bot Framework authorization bearer token",
          nextAction: "Use this route as the Azure Bot messaging endpoint.",
        });
        return;
      }

      const body = (await readJsonBody(request)) as TeamsBotActivity;

      if (body.type !== "message") {
        sendJson(response, 202, { accepted: true, service: "repai-teams-message-mvp" });
        return;
      }

      const env = readEnv();
      const text = body.text ?? "";
      const conversationId = body.conversation?.id ?? "default";
      const wantsCall = text.toLowerCase().includes("start") && text.toLowerCase().includes("call");

      // Clear conversation memory when the user starts a new demo connection
      if (text.toLowerCase().includes("use demo") || text.toLowerCase().includes("demo connection")) {
        clearConversationHistory(conversationId);
      }

      // Get conversation history for Foundry context
      const history = getConversationHistory(conversationId);
      const replyPayload = wantsCall
        ? { text: await buildStartCallChatReply(env) }
        : await buildTeamsBotResponse(text, env, history, conversationId);

      // Store the exchange in conversation memory
      appendToConversationHistory(conversationId, text, replyPayload.text);

      const replyResult = await sendTeamsBotReply(body, replyPayload.text, env, fetch, replyPayload.adaptiveCard);
      console.log(
        `[RepAI Messages] conversation=${conversationId} reply=${replyResult.ok ? "ok" : "failed"} status=${replyResult.status} message=${replyResult.message}`,
      );

      sendJson(response, replyResult.ok ? 202 : replyResult.status, {
        accepted: replyResult.ok,
        service: "repai-teams-message-mvp",
        replyResult,
      });
      return;
    }

    if (url.pathname === "/start-demo-call" && request.method === "POST") {
      const body = (await readJsonBody(request)) as Partial<StartDemoCallRequest>;
      const env = readEnv();
      const result = startDemoCall(
        {
          userJoins: Boolean(body.userJoins),
          recommendationPreference: body.recommendationPreference ?? "repai",
          userRecommendation: body.userRecommendation,
        },
        env,
      );

      if (result.mode !== "ready") {
        sendJson(response, 428, result);
        return;
      }

      const graphCall = await createTeamsMeetingCall(env, {
        mediaUrl: `${(env.REPAI_PUBLIC_BASE_URL ?? "").replace(/\/$/, "")}/media/opening.wav`,
        mediaResourceId: "repai-opening",
      });

      sendJson(response, graphCall.ok ? 200 : graphCall.status, {
        ...result,
        mode: graphCall.ok ? "join_started" : "join_failed",
        message: graphCall.ok
          ? "RepAI sent the Teams join request through Microsoft Graph."
          : "RepAI tried to join the Teams meeting, but Microsoft Graph returned a setup or permission error.",
        nextAction: graphCall.ok
          ? "Open the Teams meeting and wait for RepAI to appear while the call establishes."
          : "Fix the Graph/Teams calling permission shown in graphCall.message, then retry Start Teams call.",
        graphCall,
      });
      return;
    }

    sendJson(response, 404, {
      error: "Not found",
      routes: ["GET /health", "GET /api/status", "GET /api/status/deep", "GET /api/calls", "GET /repai-call-openapi.json", "GET /media/opening.wav", "POST /start-demo-call", "POST /api/calling", "POST /api/messages"],
    });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
});

const port = Number(process.env.PORT ?? process.env.REPAI_CALL_SERVER_PORT ?? 3978);
const host = process.env.REPAI_CALL_SERVER_HOST ?? "0.0.0.0";
server.listen(port, host, () => {
  console.log(`RepAI Teams call MVP server listening on ${host}:${port}`);
});

function buildOpeningSsml() {
  return [
    '<speak version="1.0" xml:lang="en-US">',
    '<voice xml:lang="en-US" xml:gender="Female" name="en-US-JennyNeural">',
    "Hello everyone. I am RepAI, attending as Jeremiah's disclosed delegate. RepAI helps people show up to meetings, answer from approved context, refuse risky commitments, and send clear briefs afterward. For this hackathon demo I am using synthetic context, but the production path connects to Microsoft 365, Azure AI Foundry, and Azure Speech.",
    "</voice>",
    "</speak>",
  ].join("");
}

interface CallingNotificationResult {
  callId?: string;
  state?: string;
  action: string;
  promptResult?: import("../integrations/graphTeamsCall.js").GraphCallStartResult;
}

async function handleCallingNotification(
  body: Record<string, unknown>,
  env: TeamsCallMvpEnv,
): Promise<CallingNotificationResult> {
  const values = Array.isArray(body.value) ? body.value : [];
  const baseUrl = (env.REPAI_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

  for (const item of values) {
    if (typeof item !== "object" || item === null) {
      continue;
    }

    const resourceData = (item as { resourceData?: unknown }).resourceData;
    if (typeof resourceData !== "object" || resourceData === null) {
      continue;
    }

    const call = resourceData as { id?: unknown; state?: unknown; "@odata.type"?: unknown };
    const callId = typeof call.id === "string" ? call.id : undefined;
    const state = typeof call.state === "string" ? call.state : undefined;

    console.log(`[RepAI Calling] Call ${callId ?? "unknown"} → state: ${state ?? "unknown"}`);

    if (callId && state === "established") {
      const promptResult = await playOpeningPrompt(callId, env, `${baseUrl}/media/opening.wav`);
      return { callId, state, action: "played_opening", promptResult };
    }

    if (state === "terminated") {
      console.log(`[RepAI Calling] Call ${callId ?? "unknown"} has ended.`);
      return { callId, state, action: "call_ended" };
    }

    if (state === "establishing") {
      console.log(`[RepAI Calling] Call ${callId ?? "unknown"} is being established.`);
      return { callId, state, action: "waiting_for_established" };
    }

    return { callId, state, action: "observed" };
  }

  return { action: "no_call_data" };
}

async function buildStartCallChatReply(env: TeamsCallMvpEnv) {
  const result = startDemoCall(
    {
      userJoins: true,
      recommendationPreference: "repai",
    },
    env,
  );

  if (result.mode !== "ready") {
    return [
      "I tried to start the Teams call, but setup is not complete.",
      "",
      `Missing: ${result.setup.missing.map((requirement) => requirement.label).join(", ")}`,
      "",
      "Once these are configured, send `Start Teams call` again.",
    ].join("\n");
  }

  const graphCall = await createTeamsMeetingCall(env, {
    mediaUrl: `${(env.REPAI_PUBLIC_BASE_URL ?? "").replace(/\/$/, "")}/media/opening.wav`,
    mediaResourceId: "repai-opening",
  });

  if (!graphCall.ok) {
    return [
      "I tried to join the Teams meeting as Jeremiah's disclosed delegate, but Microsoft returned an error.",
      "",
      graphCall.message,
      "",
      "Fix that permission/setup issue, then send `Start Teams call` again.",
    ].join("\n");
  }

  return [
    "RepAI sent the Teams join request through Microsoft Graph.",
    "",
    "Open the configured Teams meeting now. RepAI should appear while the call establishes, then speak the opening as Jeremiah's disclosed delegate.",
  ].join("\n");
}
