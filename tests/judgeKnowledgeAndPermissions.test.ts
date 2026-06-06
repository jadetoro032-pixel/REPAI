import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("judge demo knowledge and permissions docs", () => {
  it("provides a copy-paste demo knowledge pack", () => {
    const path = join(root, "docs", "judge-demo-knowledge-pack.md");

    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf8");
    expect(content).toContain("Launch Readiness Policy");
    expect(content).toContain("Pricing Approval Policy");
    expect(content).toContain("Customer Escalation Playbook");
    expect(content).toContain("Employee Onboarding Checklist");
    expect(content).toContain("Product Sync Transcript");
    expect(content).toContain("Use my demo knowledge");
  });

  it("documents role permissions and boundaries", () => {
    const path = join(root, "docs", "permissions-model.md");

    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, "utf8");
    expect(content).toContain("Meeting Delegate permissions");
    expect(content).toContain("Staff Support permissions");
    expect(content).toContain("Cannot approve discounts");
    expect(content).toContain("Cannot impersonate");
    expect(content).toContain("Production permissions");
  });
});
