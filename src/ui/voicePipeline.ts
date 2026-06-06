export interface VoicePipelineStage {
  name: "Listen" | "Think" | "Speak" | "Log";
  demo: string;
  production: string;
}

export interface RoleVoiceProfile {
  label: string;
  style: string;
  rate: number;
  pitch: number;
  disclosure: string;
}

export function buildVoicePipeline(): VoicePipelineStage[] {
  return [
    {
      name: "Listen",
      demo: "Browser speech recognition or typed activation",
      production: "Teams transcript, meeting audio, or Azure AI Speech-to-text",
    },
    {
      name: "Think",
      demo: "RepAI role brain with local sample knowledge",
      production: "Azure AI Foundry role agent with Work IQ, Fabric IQ, and company data",
    },
    {
      name: "Speak",
      demo: "Neutral browser speech synthesis plus text response",
      production: "Azure AI Speech neutral voice, Teams captions, and text fallback",
    },
    {
      name: "Log",
      demo: "Visible transcript, citations, decision, and audit output",
      production: "Tenant audit log with permissions, sources, approvals, and actions",
    },
  ];
}

export function canActivateQuestion(question: string): boolean {
  return normalizeQuestion(question).length >= 4;
}

export function normalizeQuestion(question: string): string {
  return question
    .trim()
    .replace(/^@repai[\s,:-]*/i, "")
    .replace(/\s+/g, " ");
}

export function getRoleVoiceProfile(roleId: string): RoleVoiceProfile {
  if (roleId === "staff-support") {
    return {
      label: "Clear staff support",
      style: "clear, calm, service-oriented neutral voice",
      rate: 0.96,
      pitch: 1,
      disclosure: "I am RepAI Staff Support, speaking as a disclosed digital staff agent.",
    };
  }

  if (roleId === "coder") {
    return {
      label: "Precise technical",
      style: "precise, concise, technical neutral voice",
      rate: 0.94,
      pitch: 0.96,
      disclosure: "I am RepAI, speaking as a disclosed coding assistant.",
    };
  }

  if (roleId === "finance-analyst") {
    return {
      label: "Measured analyst",
      style: "measured, careful, numbers-focused neutral voice",
      rate: 0.92,
      pitch: 0.98,
      disclosure: "I am RepAI, speaking as a disclosed finance analyst.",
    };
  }

  if (roleId === "secretary") {
    return {
      label: "Organized coordinator",
      style: "organized, warm, administrative neutral voice",
      rate: 0.97,
      pitch: 1.02,
      disclosure: "I am RepAI, speaking as a disclosed secretary.",
    };
  }

  return {
    label: "Neutral delegate",
    style: "neutral, professional, disclosed delegate voice",
    rate: 0.95,
    pitch: 1,
    disclosure: "I am RepAI, speaking as Jeremiah's disclosed delegate.",
  };
}
