import { describe, expect, it } from "vitest";
import {
  buildVoicePipeline,
  canActivateQuestion,
  getRoleVoiceProfile,
  normalizeQuestion,
} from "../src/ui/voicePipeline.js";

describe("voice pipeline", () => {
  it("documents listen, think, speak, and log stages", () => {
    const stages = buildVoicePipeline();

    expect(stages.map((stage) => stage.name)).toEqual([
      "Listen",
      "Think",
      "Speak",
      "Log",
    ]);
    expect(stages[0]?.production).toContain("Azure AI Speech");
    expect(stages[2]?.demo).toContain("browser speech synthesis");
  });

  it("activates questions from text when content is meaningful", () => {
    expect(canActivateQuestion("What signoff is needed?")).toBe(true);
    expect(canActivateQuestion("   ")).toBe(false);
    expect(canActivateQuestion("ok")).toBe(false);
  });

  it("normalizes typed or spoken questions before processing", () => {
    expect(normalizeQuestion("  @RepAI   what is the launch policy?  ")).toBe(
      "what is the launch policy?",
    );
  });

  it("maps roles to neutral voice profiles", () => {
    expect(getRoleVoiceProfile("staff-support").label).toBe("Clear staff support");
    expect(getRoleVoiceProfile("coder").style).toContain("precise");
    expect(getRoleVoiceProfile("meeting-delegate").disclosure).toContain("RepAI");
  });
});
