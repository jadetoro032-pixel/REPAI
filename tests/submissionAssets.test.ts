import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("hackathon submission assets", () => {
  it("keeps the pitch and submission checklist in the repo", () => {
    const pitchPath = join(root, "docs", "submission-pitch.md");
    const assetsPath = join(root, "docs", "submission-assets.md");

    expect(existsSync(pitchPath)).toBe(true);
    expect(existsSync(assetsPath)).toBe(true);
    expect(readFileSync(pitchPath, "utf8")).toContain("Copilot helps a person do work");
    expect(readFileSync(assetsPath, "utf8")).toContain("appPackage/manifest.json");
  });

  it("keeps the Microsoft 365 app package files present", () => {
    expect(existsSync(join(root, "appPackage", "manifest.json"))).toBe(true);
    expect(existsSync(join(root, "appPackage", "declarativeAgent.json"))).toBe(true);
    expect(existsSync(join(root, "appPackage", "color.png"))).toBe(true);
    expect(existsSync(join(root, "appPackage", "outline.png"))).toBe(true);
  });

  it("documents the two RepAI tools and judge test modes", () => {
    const readinessPath = join(root, "docs", "work-iq-fabric-iq-readiness.md");
    const appSource = readFileSync(join(root, "src", "ui", "App.tsx"), "utf8");

    expect(existsSync(readinessPath)).toBe(true);
    expect(readFileSync(readinessPath, "utf8")).toContain("RepAI Meeting Delegate");
    expect(readFileSync(readinessPath, "utf8")).toContain("RepAI Staff Support");
    expect(readFileSync(readinessPath, "utf8")).toContain("Judge Test Mode");
    expect(appSource).toContain("Two RepAI tools");
    expect(appSource).toContain("Meeting capability matrix");
    expect(appSource).toContain("Bring your own tools");
  });
});
