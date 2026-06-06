import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("RepAI combined package", () => {
  it("installs Copilot delegate and Teams calling bot in one app", () => {
    const manifest = JSON.parse(readFileSync("appPackageCombined/manifest.json", "utf8"));
    const agent = JSON.parse(readFileSync("appPackageCombined/declarativeAgent.json", "utf8"));

    expect(manifest.name.short).toBe("RepAI");
    expect(manifest.developer.name).toBe("Jeremiah Adetoro");
    expect(manifest.description.full).toContain("RepAI is built by Jeremiah Adetoro");
    expect(manifest.bots[0]).toMatchObject({
      botId: "78e73fa6-8e61-416d-8419-1d6a536b4030",
      supportsCalling: true,
      supportsVideo: false,
    });
    expect(manifest.copilotAgents.declarativeAgents).toEqual([
      {
        id: "repai-lite-meeting-delegate",
        file: "declarativeAgent.json",
      },
    ]);
    expect(agent.conversation_starters.map((starter: { title: string }) => starter.title)).toContain("Start Teams call");
  });

  it("includes all files referenced by the combined manifest", () => {
    const manifest = JSON.parse(readFileSync("appPackageCombined/manifest.json", "utf8"));

    expect(existsSync(`appPackageCombined/${manifest.icons.color}`)).toBe(true);
    expect(existsSync(`appPackageCombined/${manifest.icons.outline}`)).toBe(true);
    expect(existsSync("appPackageCombined/declarativeAgent.json")).toBe(true);
  });
});
