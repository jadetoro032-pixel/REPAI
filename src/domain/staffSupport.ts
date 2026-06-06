export type StaffSupportChannel =
  | "@RepAI Teams mention"
  | "email forwarded to RepAI"
  | "document tagged for RepAI"
  | "Planner task assigned to RepAI"
  | "SharePoint folder intake";

export type StaffSupportRisk = "low" | "medium" | "high";

export type StaffSupportMode = "auto_handle" | "draft_for_review" | "escalate";

export interface StaffSupportWorkItem {
  channel: StaffSupportChannel;
  request: string;
  risk: StaffSupportRisk;
}

export interface StaffSupportDecision {
  mode: StaffSupportMode;
  reason: string;
  nextStep: string;
}

export const staffSupportChannels: StaffSupportChannel[] = [
  "@RepAI Teams mention",
  "email forwarded to RepAI",
  "document tagged for RepAI",
  "Planner task assigned to RepAI",
  "SharePoint folder intake",
];

export function classifyStaffSupportWork(workItem: StaffSupportWorkItem): StaffSupportDecision {
  if (workItem.risk === "low") {
    return {
      mode: "auto_handle",
      reason: "This is low-risk assigned work, so RepAI can complete it and post a status update.",
      nextStep: "Complete the task, cite sources used, and log the action.",
    };
  }

  if (workItem.risk === "medium") {
    return {
      mode: "draft_for_review",
      reason: "This affects another person or customer, so RepAI should prepare a draft for human review.",
      nextStep: "Draft the response or document update and request approval.",
    };
  }

  return {
    mode: "escalate",
    reason: "This is high-risk work involving commitment, approval, finance, legal, HR, security, or external obligation.",
    nextStep: "Route to the accountable human owner and keep the item in RepAI's audit log.",
  };
}
