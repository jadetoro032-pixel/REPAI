import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("Microsoft 365 agent scaffold", () => {
  it("links the app manifest to the declarative agent manifest", () => {
    const manifest = JSON.parse(readFileSync("appPackage/manifest.json", "utf8"));

    expect(manifest.copilotAgents.declarativeAgents).toEqual([
      {
        id: "repai-meeting-delegate",
        file: "declarativeAgent.json",
      },
    ]);
  });

  it("declares the installable Lite agent behavior for RepAI", () => {
    const agent = JSON.parse(readFileSync("appPackage/declarativeAgent.json", "utf8"));

    expect(agent.version).toBe("v1.6");
    expect(agent.instructions).toContain("hackathon package is the installable Copilot agent shell");
    expect(agent.instructions).toContain("Do not claim live access to SharePoint");
    expect(agent.instructions).toContain("Staff Support mode");
    expect(agent.instructions).toContain("Low-risk summarization and organization work may be auto-handled");
    expect(agent.instructions).toContain("refuse to approve it");
    expect(agent.capabilities).toBeUndefined();
  });

  it("includes package icon files referenced by the manifest", () => {
    const manifest = JSON.parse(readFileSync("appPackage/manifest.json", "utf8"));

    expect(existsSync(`appPackage/${manifest.icons.color}`)).toBe(true);
    expect(existsSync(`appPackage/${manifest.icons.outline}`)).toBe(true);
  });
});
