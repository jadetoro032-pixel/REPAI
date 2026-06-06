import { describe, expect, it } from "vitest";
import { canEnableVoiceClone, createVoiceCloneConsent } from "../src/ui/voiceConsent.js";

describe("voice clone consent", () => {
  it("requires explicit consent, disclosure, and policy acknowledgement", () => {
    expect(
      canEnableVoiceClone({
        speakerName: "Jeremiah",
        consentGiven: true,
        disclosureAccepted: false,
        policyAccepted: true,
      }),
    ).toBe(false);

    expect(
      canEnableVoiceClone({
        speakerName: "Jeremiah",
        consentGiven: true,
        disclosureAccepted: true,
        policyAccepted: true,
      }),
    ).toBe(true);
  });

  it("creates an auditable consent record", () => {
    const consent = createVoiceCloneConsent("Jeremiah");

    expect(consent.speakerName).toBe("Jeremiah");
    expect(consent.consentGiven).toBe(false);
    expect(consent.disclosureAccepted).toBe(false);
    expect(consent.policyAccepted).toBe(false);
  });
});
