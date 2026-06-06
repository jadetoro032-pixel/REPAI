import { describe, expect, it } from "vitest";
import { fabricMetricSummary, knowledgeBase, teamsEscalationThread, transcript } from "../src/demo/sampleData.js";

describe("hackathon sample data", () => {
  it("contains realistic approved company knowledge sources", () => {
    const titles = knowledgeBase.map((document) => document.title);

    expect(titles).toContain("Pricing Approval Policy");
    expect(titles).toContain("Customer Escalation Playbook");
    expect(titles).toContain("Employee Onboarding Checklist");
    expect(titles).toContain("Launch Readiness Policy");
    expect(titles).toContain("Fabric Readiness Metrics");
  });

  it("includes Fabric and Teams context for the Staff Support workflow", () => {
    expect(fabricMetricSummary).toContain("support readiness");
    expect(teamsEscalationThread).toHaveLength(4);
    expect(teamsEscalationThread[0]).toContain("customer escalation");
  });

  it("has a transcript with decisions, actions, and risks", () => {
    expect(transcript.some((turn) => turn.text.startsWith("Decision:"))).toBe(true);
    expect(transcript.some((turn) => turn.text.startsWith("Action:"))).toBe(true);
    expect(transcript.some((turn) => turn.text.startsWith("Risk:"))).toBe(true);
  });
});
