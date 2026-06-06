export interface VoiceCloneConsent {
  speakerName: string;
  consentGiven: boolean;
  disclosureAccepted: boolean;
  policyAccepted: boolean;
}

export function createVoiceCloneConsent(speakerName: string): VoiceCloneConsent {
  return {
    speakerName,
    consentGiven: false,
    disclosureAccepted: false,
    policyAccepted: false,
  };
}

export function canEnableVoiceClone(consent: VoiceCloneConsent): boolean {
  return consent.consentGiven && consent.disclosureAccepted && consent.policyAccepted;
}
