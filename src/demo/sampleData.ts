import type { KnowledgeDocument, MeetingContext, TranscriptTurn, UserProfile } from "../domain/types.js";

export const jeremiah: UserProfile = {
  displayName: "Jeremiah",
  role: "Product Lead",
  delegateName: "RepAI",
};

export const productSync: MeetingContext = {
  title: "Enterprise Launch Product Sync",
  organizer: "Aisha",
  attendees: ["Aisha", "Mina", "Tunde", "Sarah", "RepAI"],
  agenda: ["Launch readiness", "Support escalation", "Pricing exception", "Customer onboarding"],
};

export const knowledgeBase: KnowledgeDocument[] = [
  {
    id: "wiki-launch-readiness",
    title: "Launch Readiness Policy",
    source: "SharePoint Wiki",
    body: "Launch approval requires product, legal, finance, and support readiness signoff before public release. Any missing signoff must be escalated to the product lead and launch commander.",
  },
  {
    id: "folder-support-escalation",
    title: "Customer Escalation Playbook",
    source: "OneDrive Knowledge Folder",
    body: "Enterprise support incidents must be acknowledged within four business hours and assigned to an incident owner. Incidents affecting launch customers must be posted in the launch command channel, linked to the customer success owner, and reviewed before external send.",
  },
  {
    id: "policy-pricing-approval",
    title: "Pricing Approval Policy",
    source: "SharePoint Policy Library",
    body: "Discounts above 25 percent require finance owner approval and legal review before customer commitment. RepAI may draft a pricing response but cannot approve exceptions or send contracts.",
  },
  {
    id: "checklist-employee-onboarding",
    title: "Employee Onboarding Checklist",
    source: "SharePoint HR Folder",
    body: "New launch team members need identity access, Teams channel membership, support playbook review, security training, and manager confirmation before working customer escalations.",
  },
  {
    id: "fabric-readiness-metrics",
    title: "Fabric Readiness Metrics",
    source: "Fabric IQ Semantic Model",
    body: "The readiness semantic model shows support readiness green at 96 percent, legal readiness amber at 78 percent, and finance approval readiness amber because two pricing exceptions remain open.",
  },
];

export const transcript: TranscriptTurn[] = [
  { speaker: "Aisha", text: "Decision: launch stays on Friday after support confirms coverage." },
  { speaker: "Mina", text: "Action: Jeremiah to review the pricing exception by 3 PM." },
  { speaker: "Tunde", text: "Risk: legal signoff may slip if procurement changes the contract language." },
  { speaker: "Sarah", text: "Action: RepAI to draft a customer escalation update for review." },
  { speaker: "Mina", text: "Decision: onboarding checklist must be attached to the launch channel before handoff." },
  { speaker: "Aisha", text: "Jeremiah should know customer onboarding needs one more checklist." },
];

export const fabricMetricSummary =
  "Fabric IQ summary: support readiness is green at 96 percent, legal readiness is amber at 78 percent, and finance approval readiness is amber because two pricing exceptions remain open.";

export const teamsEscalationThread = [
  "Aisha: We have a customer escalation about launch readiness and support coverage.",
  "Tunde: Support owner is assigned, but we need the response reviewed before external send.",
  "Mina: @RepAI summarize the customer escalation and draft next steps for review.",
  "Sarah: Pricing exception still needs finance owner approval before contract delivery.",
];
