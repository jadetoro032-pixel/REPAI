export interface TeamsCallMvpEnv {
  REPAI_PUBLIC_BASE_URL?: string;
  REPAI_TEAMS_BOT_ID?: string;
  REPAI_TEAMS_BOT_PASSWORD?: string;
  REPAI_TENANT_ID?: string;
  REPAI_DEMO_MEETING_URL?: string;
  REPAI_FOUNDRY_ENDPOINT?: string;
  REPAI_FOUNDRY_API_KEY?: string;
  REPAI_SPEECH_KEY?: string;
  REPAI_SPEECH_REGION?: string;
}

export interface DemoConnectionContext {
  meetingTitle: string;
  meetingUrlLabel: string;
  syntheticSources: string[];
  agenda: string[];
  delegateOpening: string;
  twentySecondPitch: string;
  attendAloneBrief: string;
}

export interface SetupRequirement {
  key: keyof TeamsCallMvpEnv;
  label: string;
  purpose: string;
  requiredFor: "teams-call" | "foundry-brain" | "voice";
}

export interface SetupStatus {
  readyForRealTeamsCall: boolean;
  missing: SetupRequirement[];
  configured: SetupRequirement[];
}

export interface StartDemoCallRequest {
  userJoins: boolean;
  recommendationPreference: "repai" | "user";
  userRecommendation?: string;
}

export interface StartDemoCallResult {
  mode: "setup_required" | "ready" | "join_started" | "join_failed";
  message: string;
  nextAction: string;
  context: DemoConnectionContext;
  setup: SetupStatus;
  callScript: string[];
  brief: string;
  graphCall?: {
    ok: boolean;
    status: number;
    callId?: string;
    state?: string;
    message: string;
  };
}

export const teamsCallRequirements: SetupRequirement[] = [
  {
    key: "REPAI_PUBLIC_BASE_URL",
    label: "Public HTTPS endpoint",
    purpose: "Azure Bot Service sends Teams calling webhooks here, for example https://repai-demo.ngrok.app.",
    requiredFor: "teams-call",
  },
  {
    key: "REPAI_TEAMS_BOT_ID",
    label: "Microsoft App ID / Teams Bot ID",
    purpose: "The Teams app manifest and Azure Bot registration must use this same bot ID.",
    requiredFor: "teams-call",
  },
  {
    key: "REPAI_TEAMS_BOT_PASSWORD",
    label: "Bot client secret",
    purpose: "The backend uses this to authenticate bot/calling requests.",
    requiredFor: "teams-call",
  },
  {
    key: "REPAI_TENANT_ID",
    label: "Microsoft tenant ID",
    purpose: "Used for admin consent and Graph/calling permissions in the hackathon tenant.",
    requiredFor: "teams-call",
  },
  {
    key: "REPAI_DEMO_MEETING_URL",
    label: "Teams demo meeting URL",
    purpose: "The real Teams meeting RepAI should join for the hackathon call demo.",
    requiredFor: "teams-call",
  },
  {
    key: "REPAI_FOUNDRY_ENDPOINT",
    label: "Azure AI Foundry endpoint",
    purpose: "RepAI role brain for the call pitch, question answering, and recommendations.",
    requiredFor: "foundry-brain",
  },
  {
    key: "REPAI_FOUNDRY_API_KEY",
    label: "Azure AI Foundry API key",
    purpose: "Authenticates calls to your selected Foundry model/deployment.",
    requiredFor: "foundry-brain",
  },
  {
    key: "REPAI_SPEECH_KEY",
    label: "Azure Speech key",
    purpose: "Turns RepAI text into spoken audio for the Teams call.",
    requiredFor: "voice",
  },
  {
    key: "REPAI_SPEECH_REGION",
    label: "Azure Speech region",
    purpose: "Required with the Speech key to synthesize the RepAI voice.",
    requiredFor: "voice",
  },
];

export const demoConnectionContext: DemoConnectionContext = {
  meetingTitle: "Hackathon Rules, Demo, and Why RepAI Should Win",
  meetingUrlLabel: "Real Teams meeting URL from REPAI_DEMO_MEETING_URL",
  syntheticSources: [
    "Synthetic Outlook calendar",
    "Synthetic Teams meeting invite",
    "Synthetic Gmail notes",
    "Synthetic hackathon rules",
    "Synthetic RepAI demo brief",
  ],
  agenda: [
    "Confirm RepAI uses synthetic data for the demo.",
    "Show RepAI as a disclosed delegate in a real Teams call.",
    "Explain why RepAI should win the Enterprise Agents track.",
    "Send a short meeting brief after the call.",
  ],
  delegateOpening:
    "I am RepAI, attending as Jeremiah's disclosed delegate. I am using synthetic demo context for this hackathon call.",
  twentySecondPitch:
    "RepAI should win because it moves beyond chat. It acts as a disclosed enterprise representative: it prepares from approved context, joins the work moment, explains itself clearly, answers within policy, refuses risky commitments, and sends a reviewable brief. Today the data is synthetic for the rules; in production the same flow connects to Teams, Outlook, Gmail, SharePoint, Work IQ, Fabric IQ, Azure Speech, and Azure AI Foundry.",
  attendAloneBrief:
    "RepAI attended the hackathon demo call using synthetic context, explained the delegate workflow, highlighted the real Teams-call direction, and recommended positioning RepAI as a safe enterprise representative rather than a generic chatbot.",
};

export function getTeamsCallSetupStatus(env: TeamsCallMvpEnv): SetupStatus {
  const missing = teamsCallRequirements.filter((requirement) => !env[requirement.key]);
  const configured = teamsCallRequirements.filter((requirement) => Boolean(env[requirement.key]));

  return {
    readyForRealTeamsCall: missing.filter((requirement) => requirement.requiredFor === "teams-call").length === 0,
    missing,
    configured,
  };
}

export function buildCallScript(request: StartDemoCallRequest): string[] {
  const recommendation =
    request.recommendationPreference === "user" && request.userRecommendation
      ? `Jeremiah's recommendation to present is: ${request.userRecommendation}`
      : "My recommendation is to present RepAI as a safe delegate system: real Teams call presence, synthetic data for judging, Foundry as the role brain, and human approval for risky commitments.";

  if (!request.userJoins) {
    return [
      demoConnectionContext.delegateOpening,
      recommendation,
      demoConnectionContext.twentySecondPitch,
      "Jeremiah did not join this call, so I will send him the brief for review.",
    ];
  }

  return [
    demoConnectionContext.delegateOpening,
    recommendation,
    demoConnectionContext.twentySecondPitch,
    "I have finished my opening. Do you have any questions for RepAI before I send Jeremiah the brief?",
  ];
}

export function buildDemoCallBrief(request: StartDemoCallRequest): string {
  if (!request.userJoins) {
    return `${demoConnectionContext.attendAloneBrief} Recommendation: RepAI should emphasize that the demo uses synthetic data but the call surface is designed for real Teams.`;
  }

  return "RepAI joined the real Teams-call flow as Jeremiah's disclosed delegate, delivered the hackathon pitch, invited questions, and prepared a review brief. Recommendation: lead with RepAI as an interactive representative, not a chatbot.";
}

export function startDemoCall(request: StartDemoCallRequest, env: TeamsCallMvpEnv): StartDemoCallResult {
  const setup = getTeamsCallSetupStatus(env);
  const callScript = buildCallScript(request);
  const brief = buildDemoCallBrief(request);

  if (!setup.readyForRealTeamsCall) {
    return {
      mode: "setup_required",
      message: "RepAI loaded the synthetic demo connection, but real Teams call joining is not ready until the Teams bot settings are configured.",
      nextAction: "Configure the missing Teams-call environment values, expose the backend over HTTPS, then retry start-demo-call.",
      context: demoConnectionContext,
      setup,
      callScript,
      brief,
    };
  }

  return {
    mode: "ready",
    message: "RepAI loaded the synthetic demo connection and is ready to start the real Teams call flow.",
    nextAction: request.userJoins
      ? "Open the Teams meeting for the user and have RepAI deliver the call opening."
      : "Have RepAI join the Teams meeting, deliver the opening, then send Jeremiah the brief.",
    context: demoConnectionContext,
    setup,
    callScript,
    brief,
  };
}
