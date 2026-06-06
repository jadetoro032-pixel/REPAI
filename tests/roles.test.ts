import { describe, expect, it } from "vitest";
import { canJoinAsDelegates, rolePacks } from "../src/domain/roles.js";
import { classifyStaffSupportWork, staffSupportChannels } from "../src/domain/staffSupport.js";

describe("RepAI role packs", () => {
  it("includes expanded enterprise roles beyond meeting delegate", () => {
    const roleIds = rolePacks.map((role) => role.id);

    expect(roleIds).toContain("secretary");
    expect(roleIds).toContain("coder");
    expect(roleIds).toContain("staff-support");
    expect(roleIds).toContain("finance-analyst");
    expect(roleIds).toContain("customer-support");
  });

  it("keeps every role disclosed and approval-gated", () => {
    expect(rolePacks.every((role) => role.disclosureRequired)).toBe(true);
    expect(rolePacks.every((role) => role.humanApprovalRequiredForCommitments)).toBe(true);
  });
});

describe("RepAI staff support", () => {
  it("receives work through tagged operational channels", () => {
    expect(staffSupportChannels).toEqual([
      "@RepAI Teams mention",
      "email forwarded to RepAI",
      "document tagged for RepAI",
      "Planner task assigned to RepAI",
      "SharePoint folder intake",
    ]);
  });

  it("auto-handles low-risk assigned work", () => {
    const decision = classifyStaffSupportWork({
      channel: "@RepAI Teams mention",
      request: "@RepAI summarize this onboarding document",
      risk: "low",
    });

    expect(decision.mode).toBe("auto_handle");
    expect(decision.reason).toContain("low-risk");
  });

  it("drafts medium-risk work for review", () => {
    const decision = classifyStaffSupportWork({
      channel: "email forwarded to RepAI",
      request: "Draft a customer response for this escalation",
      risk: "medium",
    });

    expect(decision.mode).toBe("draft_for_review");
    expect(decision.reason).toContain("human review");
  });

  it("escalates high-risk work", () => {
    const decision = classifyStaffSupportWork({
      channel: "document tagged for RepAI",
      request: "Approve this discount and send the contract",
      risk: "high",
    });

    expect(decision.mode).toBe("escalate");
    expect(decision.reason).toContain("high-risk");
  });
});

describe("multi-account delegate guardrails", () => {
  it("allows two disclosed delegates for different authorized people and roles", () => {
    const result = canJoinAsDelegates([
      {
        representedUser: "Jeremiah",
        accountLabel: "Jeremiah product account",
        roleId: "meeting-delegate",
        authorized: true,
        visibleIdentity: "RepAI for Jeremiah, Meeting Delegate",
      },
      {
        representedUser: "Sarah",
        accountLabel: "Sarah finance account",
        roleId: "finance-analyst",
        authorized: true,
        visibleIdentity: "RepAI for Sarah, Finance Analyst",
      },
    ]);

    expect(result.allowed).toBe(true);
    expect(result.reasons).toContain("Each represented person authorized RepAI.");
  });

  it("blocks hidden multi-person representation", () => {
    const result = canJoinAsDelegates([
      {
        representedUser: "Jeremiah",
        accountLabel: "Shared account",
        roleId: "meeting-delegate",
        authorized: true,
        visibleIdentity: "RepAI meeting helper",
      },
      {
        representedUser: "Sarah",
        accountLabel: "Shared account",
        roleId: "finance-analyst",
        authorized: false,
        visibleIdentity: "RepAI meeting helper",
      },
    ]);

    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("Every represented person must explicitly authorize RepAI.");
    expect(result.reasons).toContain("Each delegate identity must visibly name the represented person.");
  });
});
