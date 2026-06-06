export type RolePackId =
  | "meeting-delegate"
  | "secretary"
  | "coder"
  | "staff-support"
  | "sales-rep"
  | "hr-assistant"
  | "finance-analyst"
  | "customer-support";

export interface RolePack {
  id: RolePackId;
  name: string;
  summary: string;
  capabilities: string[];
  dataSources: string[];
  disclosureRequired: boolean;
  humanApprovalRequiredForCommitments: boolean;
}

export interface DelegateSession {
  representedUser: string;
  accountLabel: string;
  roleId: RolePackId;
  authorized: boolean;
  visibleIdentity: string;
}

export interface DelegateJoinDecision {
  allowed: boolean;
  reasons: string[];
}

export const rolePacks: RolePack[] = [
  {
    id: "meeting-delegate",
    name: "Meeting Delegate",
    summary: "Attends calls as a disclosed delegate, answers grounded questions, captures decisions, and briefs the user.",
    capabilities: ["Voice Q&A", "meeting brief", "action extraction", "escalation"],
    dataSources: ["Teams meetings", "Work IQ", "Knowledge Folder"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
  {
    id: "secretary",
    name: "Secretary",
    summary: "Schedules, drafts follow-ups, organizes tasks, and protects the user's approval boundary.",
    capabilities: ["calendar coordination", "email drafts", "reminders", "task routing"],
    dataSources: ["Outlook", "Teams", "OneDrive"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
  {
    id: "coder",
    name: "Coder",
    summary: "Works from repo docs and code context to explain bugs, draft changes, and prepare review notes.",
    capabilities: ["code review", "bug explanation", "PR draft", "test planning"],
    dataSources: ["repo knowledge", "engineering wiki", "issue tracker"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
  {
    id: "staff-support",
    name: "Staff Support",
    summary: "Acts as a digital staff member with its own work queue for tagged emails, documents, Teams requests, and assigned tasks.",
    capabilities: ["@RepAI intake", "queue ownership", "SLA tracking", "status updates"],
    dataSources: ["Teams mentions", "Outlook mailbox", "SharePoint documents", "Planner tasks"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
  {
    id: "sales-rep",
    name: "Sales Rep",
    summary: "Answers customer-facing product and pricing questions from approved sales knowledge.",
    capabilities: ["product Q&A", "pricing policy lookup", "objection handling", "handoff notes"],
    dataSources: ["CRM notes", "pricing policy", "sales enablement docs"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
  {
    id: "hr-assistant",
    name: "HR Assistant",
    summary: "Answers policy questions and routes sensitive people issues to the right human owner.",
    capabilities: ["policy Q&A", "benefit lookup", "sensitive issue routing", "case notes"],
    dataSources: ["HR policy folder", "employee handbook", "People directory"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
  {
    id: "finance-analyst",
    name: "Finance Analyst",
    summary: "Explains approved business metrics and Fabric IQ signals without approving exceptions.",
    capabilities: ["metric explanation", "variance notes", "forecast context", "approval escalation"],
    dataSources: ["Fabric IQ", "Power BI", "finance policy"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
  {
    id: "customer-support",
    name: "Customer Support",
    summary: "Uses escalation playbooks and account context to answer support calls and route incidents.",
    capabilities: ["incident triage", "playbook lookup", "customer context", "handoff summary"],
    dataSources: ["support playbook", "ticket history", "Teams incidents"],
    disclosureRequired: true,
    humanApprovalRequiredForCommitments: true,
  },
];

export function canJoinAsDelegates(sessions: DelegateSession[]): DelegateJoinDecision {
  const reasons: string[] = [];
  const representedUsers = new Set(sessions.map((session) => session.representedUser));
  const visibleIdentities = new Set(sessions.map((session) => session.visibleIdentity));

  if (sessions.every((session) => session.authorized)) {
    reasons.push("Each represented person authorized RepAI.");
  } else {
    reasons.push("Every represented person must explicitly authorize RepAI.");
  }

  if (
    sessions.every((session) =>
      session.visibleIdentity.toLowerCase().includes(session.representedUser.toLowerCase()),
    )
  ) {
    reasons.push("Each delegate identity visibly names the represented person.");
  } else {
    reasons.push("Each delegate identity must visibly name the represented person.");
  }

  if (visibleIdentities.size === sessions.length) {
    reasons.push("Each active delegate has a distinct visible meeting identity.");
  } else {
    reasons.push("Each active delegate must use a distinct visible meeting identity.");
  }

  if (representedUsers.size === sessions.length) {
    reasons.push("Each delegate session represents one person only.");
  } else {
    reasons.push("A single meeting identity cannot represent the same person twice.");
  }

  const allowed = reasons.every(
    (reason) =>
      !reason.includes("must") &&
      !reason.includes("cannot") &&
      !reason.includes("Every represented person must"),
  );

  return {
    allowed,
    reasons,
  };
}
