import type { TeamsCallMvpEnv } from "./teamsCallMvp.js";
import { askFoundry, REPAI_SYSTEM_PROMPT } from "./foundryClient.js";
import { processStaffSupportWork } from "../domain/staffSupportWorkflow.js";
import { createMockWorkIqAdapter } from "./workIqAdapter.js";
import type { StaffSupportRisk } from "../domain/staffSupport.js";
import { rolePacks, type RolePackId } from "../domain/roles.js";

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

// ── Role switching state (per conversation) ────────────────────────
const conversationRoles = new Map<string, RolePackId>();

export function getActiveRole(conversationId: string): RolePackId {
  return conversationRoles.get(conversationId) ?? "meeting-delegate";
}

export function setActiveRole(conversationId: string, roleId: RolePackId): void {
  conversationRoles.set(conversationId, roleId);
}

export function clearActiveRole(conversationId: string): void {
  conversationRoles.delete(conversationId);
}

export function buildRoleSystemPrompt(roleId: RolePackId): string {
  const role = rolePacks.find((r) => r.id === roleId);
  if (!role) {
    return REPAI_SYSTEM_PROMPT;
  }

  return [
    `You are RepAI acting as Jeremiah Adetoro's **${role.name}**.`,
    "",
    `Role: ${role.summary}`,
    `Capabilities: ${role.capabilities.join(", ")}.`,
    `Data sources: ${role.dataSources.join(", ")}.`,
    "",
    "Rules:",
    "- Always disclose you are RepAI, Jeremiah's delegate. Never impersonate Jeremiah.",
    "- Answer only from context provided in the conversation or from your approved knowledge.",
    '- If you cannot ground an answer, say: "I do not have approved knowledge for that. Jeremiah should review."',
    role.humanApprovalRequiredForCommitments
      ? "- Never approve discounts, pricing exceptions, commitments, or legal/financial decisions."
      : "- You may make safe recommendations within your approved scope.",
    "- For high-risk work, escalate to Jeremiah or the accountable owner.",
    "- Keep responses concise and professional.",
  ].join("\n");
}

function tryParseRoleSwitch(text: string): RolePackId | null {
  const match = text.match(/switch\s+to\s+(.+)/i);
  if (!match) return null;

  const requested = match[1].trim().toLowerCase();
  const role = rolePacks.find(
    (r) =>
      r.name.toLowerCase() === requested ||
      r.id === requested ||
      r.id === requested.replace(/\s+/g, "-"),
  );
  return role?.id ?? null;
}

// ── Adaptive Card builders ─────────────────────────────────────────

export interface BotReplyPayload {
  text: string;
  adaptiveCard?: unknown;
}

function buildStaffSupportCard(
  mode: string,
  draft: string,
  risk: string,
  reason: string,
  nextStep: string,
  auditLog: string[],
): unknown {
  const riskColor = risk === "high" ? "Attention" : risk === "medium" ? "Warning" : "Good";
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      { type: "TextBlock", text: `Staff Support — ${mode.replace(/_/g, " ")}`, size: "Medium", weight: "Bolder", wrap: true },
      { type: "TextBlock", text: draft, wrap: true },
      {
        type: "FactSet",
        facts: [
          { title: "Risk", value: risk },
          { title: "Reason", value: reason },
          { title: "Next step", value: nextStep },
        ],
      },
      { type: "TextBlock", text: "Audit log", weight: "Bolder", spacing: "Medium", size: "Small" },
      ...auditLog.map((entry) => ({
        type: "TextBlock" as const,
        text: `• ${entry}`,
        wrap: true,
        size: "Small" as const,
        spacing: "None" as const,
      })),
    ],
    msTeams: { width: "Full" },
  };
}

function buildRoleSwitchCard(roleName: string, summary: string, capabilities: string[]): unknown {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      { type: "TextBlock", text: `🔄 Switched to ${roleName}`, size: "Medium", weight: "Bolder", wrap: true },
      { type: "TextBlock", text: summary, wrap: true },
      {
        type: "FactSet",
        facts: capabilities.map((cap) => ({ title: "✓", value: cap })),
      },
      { type: "TextBlock", text: "RepAI will now answer as this role. Send `Switch to Meeting Delegate` to reset.", size: "Small", color: "Accent", wrap: true },
    ],
    msTeams: { width: "Full" },
  };
}

function buildBriefCard(briefText: string): unknown {
  return {
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.5",
    body: [
      { type: "TextBlock", text: "📋 Meeting Brief", size: "Medium", weight: "Bolder" },
      { type: "TextBlock", text: briefText, wrap: true },
      { type: "TextBlock", text: "Review-only: no commitment is sent until Jeremiah approves it.", color: "Warning", size: "Small", wrap: true },
    ],
    msTeams: { width: "Full" },
  };
}

// ── Main bot response builder ──────────────────────────────────────

export async function buildTeamsBotResponse(
  text: string,
  env: TeamsCallMvpEnv = {},
  conversationHistory: import("./foundryClient.js").FoundryMessage[] = [],
  conversationId: string = "default",
): Promise<BotReplyPayload> {
  const normalized = text.toLowerCase();

  // Role switching
  const switchRole = tryParseRoleSwitch(text);
  if (switchRole) {
    setActiveRole(conversationId, switchRole);
    const role = rolePacks.find((r) => r.id === switchRole)!;
    const reply = `Switched to **${role.name}**. ${role.summary}\n\nCapabilities: ${role.capabilities.join(", ")}.\n\nI will now respond as your ${role.name}. Send \`Switch to Meeting Delegate\` to reset.`;
    return {
      text: reply,
      adaptiveCard: buildRoleSwitchCard(role.name, role.summary, role.capabilities),
    };
  }

  // List available roles
  if (normalized.includes("list roles") || normalized.includes("show roles") || normalized.includes("available roles")) {
    const roleList = rolePacks.map((r) => `• **${r.name}** — ${r.summary}`).join("\n");
    return {
      text: `Available RepAI roles:\n\n${roleList}\n\nSend \`Switch to <role name>\` to activate one.`,
    };
  }

  if (normalized.includes("use demo") || normalized.includes("demo connection") || normalized.includes("read through")) {
    clearActiveRole(conversationId);
    return {
      text: [
        "Demo connection selected.",
        "",
        "I have read your demo work context. I found the hackathon meeting about rules, the demo, and why RepAI should win.",
        "",
        "I am ready to attend as Jeremiah's disclosed delegate.",
        "",
        "Next: send `Start Teams call` and I will ask the live RepAI backend to join the configured Teams meeting.",
      ].join("\n"),
    };
  }

  if (normalized.includes("brief")) {
    const briefText = [
      "RepAI prepared from synthetic demo context, positioned itself as Jeremiah's disclosed delegate, and recommended leading with the real problem: missed meetings, lost context, and delayed follow-up.",
      "",
      "Follow-up: show the Teams call path, then explain Staff Support as the assigned-work mode.",
    ].join("\n");
    return {
      text: `Meeting brief:\n${briefText}`,
      adaptiveCard: buildBriefCard(briefText),
    };
  }

  // Staff Support: handle @RepAI work assignments
  if (normalized.includes("handle") || normalized.includes("staff support") || normalized.includes("@repai")) {
    return buildStaffSupportReply(text);
  }

  // For all other messages, use the Foundry AI brain if configured
  const activeRole = getActiveRole(conversationId);
  const systemPrompt = activeRole !== "meeting-delegate"
    ? buildRoleSystemPrompt(activeRole)
    : undefined;
  const foundryResult = await askFoundry(text, env, conversationHistory, undefined, systemPrompt);
  if (foundryResult.ok) {
    return { text: foundryResult.message };
  }

  // Fallback to template when Foundry is not available
  return {
    text: [
      "I am RepAI, Jeremiah's disclosed delegate.",
      "",
      "Use one of these commands:",
      "- `Use demo connection`",
      "- `Start Teams call`",
      "- `Send call brief`",
      "- `@RepAI handle <request>` — Staff Support mode",
      "- `Switch to <role>` — Change my active role",
      "- `List roles` — See available roles",
    ].join("\n"),
  };
}

function classifyRiskFromText(text: string): StaffSupportRisk {
  if (/approv|commit|discount|price|legal|financ|secur|merge|deploy/i.test(text)) {
    return "high";
  }

  if (/customer|escalat|external|partner|contract|review/i.test(text)) {
    return "medium";
  }

  return "low";
}

async function buildStaffSupportReply(text: string): Promise<BotReplyPayload> {
  const workIq = createMockWorkIqAdapter();
  const request = text
    .replace(/@repai/i, "")
    .replace(/handle/i, "")
    .replace(/staff\s*support/i, "")
    .trim() || text;
  const risk = classifyRiskFromText(request);

  const result = await processStaffSupportWork(
    { channel: "@RepAI Teams mention", request, risk },
    workIq,
  );

  const plainText = [
    `**Staff Support** (${result.decision.mode.replace(/_/g, " ")}):`,
    "",
    result.draft,
    "",
    `**Risk:** ${result.workItem.risk} → ${result.decision.reason}`,
    `**Next:** ${result.decision.nextStep}`,
    "",
    "**Audit log:**",
    ...result.auditLog.map((entry) => `• ${entry}`),
  ].join("\n");

  return {
    text: plainText,
    adaptiveCard: buildStaffSupportCard(
      result.decision.mode,
      result.draft,
      result.workItem.risk,
      result.decision.reason,
      result.decision.nextStep,
      result.auditLog,
    ),
  };
}

export function createTeamsReplyActivity(activity: TeamsBotActivity, text: string, adaptiveCard?: unknown) {
  return {
    type: "message",
    text,
    from: activity.recipient,
    recipient: activity.from,
    conversation: activity.conversation,
    replyToId: activity.id,
    ...(adaptiveCard
      ? {
          attachments: [
            {
              contentType: "application/vnd.microsoft.card.adaptive",
              content: adaptiveCard,
            },
          ],
        }
      : {}),
  };
}

export async function sendTeamsBotReply(
  activity: TeamsBotActivity,
  text: string,
  env: TeamsCallMvpEnv,
  fetchImpl: FetchLike = fetch,
  adaptiveCard?: unknown,
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
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify(createTeamsReplyActivity(activity, text, adaptiveCard)),
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
  const tokenAuthority = env.REPAI_TENANT_ID ?? "botframework.com";
  const tokenResponse = await fetchImpl(`https://login.microsoftonline.com/${tokenAuthority}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    signal: AbortSignal.timeout(15_000),
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
