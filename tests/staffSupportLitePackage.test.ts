import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("RepAI Staff Support Lite package", () => {
  it("contains an installable Microsoft 365 app package", () => {
    const packageRoot = join(root, "appPackageStaffSupportLite");
    const manifestPath = join(packageRoot, "manifest.json");
    const agentPath = join(packageRoot, "declarativeAgent.json");

    expect(existsSync(manifestPath)).toBe(true);
    expect(existsSync(agentPath)).toBe(true);
    expect(existsSync(join(packageRoot, "color.png"))).toBe(true);
    expect(existsSync(join(packageRoot, "outline.png"))).toBe(true);

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const agent = JSON.parse(readFileSync(agentPath, "utf8"));

    expect(manifest.name.short).toBe("RepAI Staff");
    expect(manifest.copilotAgents.declarativeAgents[0]).toEqual({
      id: "repai-staff-support-lite",
      file: "declarativeAgent.json",
    });
    expect(agent.name).toBe("RepAI Staff Support");
    expect(agent.instructions).toContain("auto-handle, draft for review, or escalate");
    expect(agent.instructions).toContain("Do not approve pricing exceptions");
    expect(agent.capabilities).toBeUndefined();
  });
});
