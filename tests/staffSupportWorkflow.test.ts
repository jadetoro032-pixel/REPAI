import { describe, expect, it } from "vitest";
import { createMockWorkIqAdapter } from "../src/integrations/workIqAdapter.js";
import { processStaffSupportWork } from "../src/domain/staffSupportWorkflow.js";

describe("Staff Support workflow with mock Work IQ", () => {
  it("retrieves work context before auto-handling a low-risk @RepAI task", async () => {
    const adapter = createMockWorkIqAdapter();

    const result = await processStaffSupportWork(
      {
        channel: "@RepAI Teams mention",
        request: "@RepAI summarize the onboarding document and create next steps",
        risk: "low",
      },
      adapter,
    );

    expect(result.decision.mode).toBe("auto_handle");
    expect(result.context.emails).toHaveLength(1);
    expect(result.context.teamsThreads[0]).toContain("onboarding");
    expect(result.draft).toContain("Completed summary");
    expect(result.auditLog).toEqual([
      "Received work through @RepAI Teams mention.",
      "Fetched mock Work IQ context for: @RepAI summarize the onboarding document and create next steps.",
      "Classified risk as low and selected auto_handle.",
      "Prepared response using 5 context source(s).",
    ]);
  });

  it("drafts medium-risk customer work for review", async () => {
    const adapter = createMockWorkIqAdapter();

    const result = await processStaffSupportWork(
      {
        channel: "email forwarded to RepAI",
        request: "Draft a customer escalation response for review",
        risk: "medium",
      },
      adapter,
    );

    expect(result.decision.mode).toBe("draft_for_review");
    expect(result.context.emails[0]).toContain("customer escalation");
    expect(result.draft).toContain("Draft response for review");
    expect(result.auditLog).toContain("Classified risk as medium and selected draft_for_review.");
  });

  it("escalates high-risk approval work", async () => {
    const adapter = createMockWorkIqAdapter();

    const result = await processStaffSupportWork(
      {
        channel: "document tagged for RepAI",
        request: "Approve pricing exception and send contract",
        risk: "high",
      },
      adapter,
    );

    expect(result.decision.mode).toBe("escalate");
    expect(result.draft).toContain("Escalated to accountable owner");
    expect(result.context.policyHits[0]).toContain("Pricing exceptions require approval");
  });
});
