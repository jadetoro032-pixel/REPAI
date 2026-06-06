# RepAI Real Teams Call MVP Package

This package is the real Teams-call surface for the hackathon MVP. It is separate from the Copilot Lite agent packages.

Before upload, replace `bots[0].botId` in `manifest.json` with the Microsoft App ID from your Azure Bot registration.

The call package needs:

- Azure Bot registration with the Teams channel enabled.
- Calling enabled in the Teams channel.
- Calling webhook set to `https://YOUR_PUBLIC_URL/api/calling` or the endpoint you implement.
- Graph/admin consent for Teams calling permissions.
- A real Teams meeting URL in `REPAI_DEMO_MEETING_URL`.
- Synthetic demo context from the RepAI backend.

The package declares `supportsCalling: true`, which is what lets Teams treat RepAI as a calling/meeting bot once the Azure Bot setup is complete.
