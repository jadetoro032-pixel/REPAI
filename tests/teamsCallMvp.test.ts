import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildCallScript,
  demoConnectionContext,
  getTeamsCallSetupStatus,
  startDemoCall,
  teamsCallRequirements,
} from "../src/integrations/teamsCallMvp.js";

describe("RepAI real Teams call MVP scaffold", () => {
  it("uses synthetic context but targets a real Teams meeting", () => {
    expect(demoConnectionContext.meetingTitle).toBe("Hackathon Rules, Demo, and Why RepAI Should Win");
    expect(demoConnectionContext.syntheticSources).toContain("Synthetic Outlook calendar");
    expect(demoConnectionContext.syntheticSources).toContain("Synthetic Teams meeting invite");
    expect(demoConnectionContext.twentySecondPitch).toContain("Today the data is synthetic");
    expect(demoConnectionContext.twentySecondPitch).toContain("Teams");
  });

  it("reports setup as blocked until Teams-call values are configured", () => {
    const status = getTeamsCallSetupStatus({});

    expect(status.readyForRealTeamsCall).toBe(false);
    expect(status.missing.map((requirement) => requirement.key)).toContain("REPAI_TEAMS_BOT_ID");
    expect(status.missing.map((requirement) => requirement.key)).toContain("REPAI_DEMO_MEETING_URL");
  });

  it("becomes ready when the Teams-call requirements are configured", () => {
    const status = getTeamsCallSetupStatus({
      REPAI_PUBLIC_BASE_URL: "https://repai-demo.example",
      REPAI_TEAMS_BOT_ID: "bot-id",
      REPAI_TEAMS_BOT_PASSWORD: "secret",
      REPAI_TENANT_ID: "tenant-id",
      REPAI_DEMO_MEETING_URL: "https://teams.microsoft.com/l/meetup-join/demo",
    });

    expect(status.readyForRealTeamsCall).toBe(true);
  });

  it("builds different call scripts when the user joins or lets RepAI attend alone", () => {
    const joined = buildCallScript({ userJoins: true, recommendationPreference: "repai" }).join("\n");
    const alone = buildCallScript({ userJoins: false, recommendationPreference: "repai" }).join("\n");

    expect(joined).toContain("Do you have any questions");
    expect(alone).toContain("Jeremiah did not join this call");
  });

  it("returns setup_required until the real Teams call layer is configured", () => {
    const result = startDemoCall({ userJoins: false, recommendationPreference: "repai" }, {});

    expect(result.mode).toBe("setup_required");
    expect(result.message).toContain("synthetic demo connection");
    expect(result.nextAction).toContain("Configure");
  });

  it("declares a Teams calling bot package", () => {
    const manifest = JSON.parse(readFileSync("appPackageTeamsCall/manifest.json", "utf8"));

    expect(manifest.bots[0].botId).toBe("78e73fa6-8e61-416d-8419-1d6a536b4030");
    expect(manifest.bots[0].supportsCalling).toBe(true);
    expect(manifest.bots[0].supportsVideo).toBe(false);
    expect(manifest.description.full).toContain("real Teams-call surface");
    expect(teamsCallRequirements.map((requirement) => requirement.key)).toContain("REPAI_FOUNDRY_ENDPOINT");
  });

  it("documents the calling webhook route without storing secrets", () => {
    const serverSource = readFileSync("src/server/teamsCallServer.ts", "utf8");
    const envExample = readFileSync(".env.example", "utf8");
    const gitignore = readFileSync(".gitignore", "utf8");

    expect(serverSource).toContain("/api/calling");
    expect(serverSource).toContain("Missing Teams calling authorization bearer token");
    expect(envExample).toContain("YOUR_BOT_CLIENT_SECRET_VALUE");
    expect(gitignore).toContain(".env");
    expect(envExample).toContain("YOUR_FOUNDRY_API_KEY");
    expect(envExample).toContain("YOUR_AZURE_SPEECH_KEY");
  });
});
