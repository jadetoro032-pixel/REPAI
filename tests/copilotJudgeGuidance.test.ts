import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function readAgent(packageFolder: string) {
  return JSON.parse(readFileSync(join(root, packageFolder, "declarativeAgent.json"), "utf8"));
}

function readManifest(packageFolder: string) {
  return JSON.parse(readFileSync(join(root, packageFolder, "manifest.json"), "utf8"));
}

describe("Copilot package judge guidance", () => {
  it("embeds judge-facing guidance in RepAI Lite", () => {
    const manifest = readManifest("appPackageLite");
    const agent = readAgent("appPackageLite");
    const starterTitles = agent.conversation_starters.map((starter: { title: string }) => starter.title);

    expect(manifest.description.full).toContain("Judges can test");
    expect(agent.instructions).toContain("Judge guide");
    expect(agent.instructions).toContain("RepAI Meeting Delegate");
    expect(agent.instructions).toContain("RepAI Staff Support");
    expect(agent.instructions).toContain("live today");
    expect(agent.instructions).toContain("planned production layer");
    expect(agent.instructions).toContain("Work IQ and Fabric IQ");
    expect(agent.instructions).toContain("demo connection");
    expect(agent.instructions).toContain("real Teams call");
    expect(agent.instructions).toContain("Hackathon Rules, Demo, and Why RepAI Should Win");
    expect(starterTitles).toContain("Use demo connection");
    expect(starterTitles).toContain("Prepare hackathon call");
    expect(starterTitles).toContain("Start Teams call");
    expect(starterTitles).toContain("Send call brief");
    expect(starterTitles).toContain("Test approval policy");
    expect(agent.conversation_starters.map((starter: { text: string }) => starter.text).join("\n")).toContain("synthetic Outlook, Teams, Gmail, calendar, docs, and hackathon-rule data");
  });

  it("embeds judge-facing guidance in RepAI Staff Support Lite", () => {
    const manifest = readManifest("appPackageStaffSupportLite");
    const agent = readAgent("appPackageStaffSupportLite");
    const starterTitles = agent.conversation_starters.map((starter: { title: string }) => starter.title);

    expect(manifest.description.full).toContain("Judges can test");
    expect(agent.instructions).toContain("Judge guide");
    expect(agent.instructions).toContain("RepAI Meeting Delegate");
    expect(agent.instructions).toContain("RepAI Staff Support");
    expect(agent.instructions).toContain("live today");
    expect(agent.instructions).toContain("planned production layer");
    expect(agent.instructions).toContain("Work IQ and Fabric IQ");
    expect(agent.instructions).toContain("load documents");
    expect(agent.instructions).toContain("I have read it now");
    expect(agent.instructions).toContain("proceed to task");
    expect(starterTitles).toContain("Load task knowledge");
    expect(starterTitles).toContain("I have read it");
    expect(starterTitles).toContain("Proceed to task");
    expect(starterTitles).toContain("Test approval task");
    expect(agent.conversation_starters.map((starter: { text: string }) => starter.text).join("\n")).toContain("I have read the Employee Onboarding Checklist");
  });
});
