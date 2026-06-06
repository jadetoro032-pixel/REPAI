import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { startDemoCall, type StartDemoCallRequest, type TeamsCallMvpEnv } from "../integrations/teamsCallMvp.js";

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
    REPAI_SPEECH_KEY: process.env.REPAI_SPEECH_KEY,
    REPAI_SPEECH_REGION: process.env.REPAI_SPEECH_REGION,
  };
}

function sendJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
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

    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    if (url.pathname === "/health" && request.method === "GET") {
      sendJson(response, 200, { ok: true, service: "repai-teams-call-mvp" });
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

      sendJson(response, 202, {
        accepted: true,
        service: "repai-teams-call-mvp",
        message: "Teams calling notification received. Media join/speak handling is the next implementation layer.",
      });
      return;
    }

    if (url.pathname === "/start-demo-call" && request.method === "POST") {
      const body = (await readJsonBody(request)) as Partial<StartDemoCallRequest>;
      const result = startDemoCall(
        {
          userJoins: Boolean(body.userJoins),
          recommendationPreference: body.recommendationPreference ?? "repai",
          userRecommendation: body.userRecommendation,
        },
        readEnv(),
      );

      sendJson(response, result.mode === "ready" ? 200 : 428, result);
      return;
    }

    sendJson(response, 404, { error: "Not found", routes: ["GET /health", "POST /start-demo-call", "POST /api/calling"] });
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
});

const port = Number(process.env.PORT ?? process.env.REPAI_CALL_SERVER_PORT ?? 3978);
const host = process.env.REPAI_CALL_SERVER_HOST ?? "0.0.0.0";
server.listen(port, host, () => {
  console.log(`RepAI Teams call MVP server listening on ${host}:${port}`);
});
