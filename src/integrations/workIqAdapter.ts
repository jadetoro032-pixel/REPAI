export interface WorkIqContext {
  emails: string[];
  teamsThreads: string[];
  calendarEvents: string[];
  sharePointDocs: string[];
  policyHits: string[];
}

export interface WorkIqAdapter {
  getWorkContext: (request: string) => Promise<WorkIqContext>;
}

export function createMockWorkIqAdapter(): WorkIqAdapter {
  return {
    async getWorkContext(request: string): Promise<WorkIqContext> {
      const normalized = request.toLowerCase();

      if (normalized.includes("pricing") || normalized.includes("contract") || normalized.includes("discount")) {
        return {
          emails: ["Finance email: pricing exception requires finance owner review before customer response."],
          teamsThreads: ["Teams thread: account team asked whether the discount can be approved today."],
          calendarEvents: ["Calendar: finance review is scheduled for 3 PM."],
          sharePointDocs: ["SharePoint: pricing approval matrix v4."],
          policyHits: ["Pricing exceptions require approval from Finance and Legal before contract delivery."],
        };
      }

      if (normalized.includes("customer") || normalized.includes("escalation")) {
        return {
          emails: ["Email: customer escalation asks for an update on launch readiness and support coverage."],
          teamsThreads: ["Teams thread: support owner confirmed Tier 2 is investigating the escalation."],
          calendarEvents: ["Calendar: customer success sync tomorrow at 10 AM."],
          sharePointDocs: ["SharePoint: customer escalation playbook."],
          policyHits: ["Customer escalation replies should be reviewed before external send."],
        };
      }

      return {
        emails: ["Email: onboarding owner requested a summary and next steps."],
        teamsThreads: ["Teams thread: onboarding document needs a concise summary for the launch channel."],
        calendarEvents: ["Calendar: onboarding review occurs after the product sync."],
        sharePointDocs: ["SharePoint: onboarding checklist and launch readiness notes."],
        policyHits: ["Internal document summaries are low-risk when source citations are included."],
      };
    },
  };
}
