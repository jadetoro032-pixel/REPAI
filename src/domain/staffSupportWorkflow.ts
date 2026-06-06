import { classifyStaffSupportWork, type StaffSupportDecision, type StaffSupportWorkItem } from "./staffSupport.js";
import type { WorkIqAdapter, WorkIqContext } from "../integrations/workIqAdapter.js";

export interface StaffSupportWorkflowResult {
  workItem: StaffSupportWorkItem;
  context: WorkIqContext;
  decision: StaffSupportDecision;
  draft: string;
  auditLog: string[];
}

export async function processStaffSupportWork(
  workItem: StaffSupportWorkItem,
  workIq: WorkIqAdapter,
): Promise<StaffSupportWorkflowResult> {
  const context = await workIq.getWorkContext(workItem.request);
  const decision = classifyStaffSupportWork(workItem);
  const contextSourceCount = countContextSources(context);

  return {
    workItem,
    context,
    decision,
    draft: createDraft(workItem, decision, context),
    auditLog: [
      `Received work through ${workItem.channel}.`,
      `Fetched mock Work IQ context for: ${workItem.request}.`,
      `Classified risk as ${workItem.risk} and selected ${decision.mode}.`,
      `Prepared response using ${contextSourceCount} context source(s).`,
    ],
  };
}

function createDraft(
  workItem: StaffSupportWorkItem,
  decision: StaffSupportDecision,
  context: WorkIqContext,
): string {
  const source = context.policyHits[0] ?? context.sharePointDocs[0] ?? "approved company context";

  if (decision.mode === "auto_handle") {
    return `Completed summary for "${workItem.request}" using ${source}. Status update is ready for the channel.`;
  }

  if (decision.mode === "draft_for_review") {
    return `Draft response for review: based on ${source}, RepAI prepared a response but needs human approval before sending.`;
  }

  return `Escalated to accountable owner: ${source}. RepAI will not approve or send this request.`;
}

function countContextSources(context: WorkIqContext): number {
  return (
    context.emails.length +
    context.teamsThreads.length +
    context.calendarEvents.length +
    context.sharePointDocs.length +
    context.policyHits.length
  );
}
