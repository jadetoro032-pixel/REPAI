# Work IQ And Fabric IQ Readiness

## Role Split

RepAI is one brand with two separate AI tools:

- **RepAI Meeting Delegate:** represents a user in meetings, prepares delegate openings, answers meeting questions from supplied or connected knowledge, and creates review-only briefs.
- **RepAI Staff Support:** receives assigned work, owns a queue, classifies risk, drafts responses, and escalates decisions that need human authority.

The two tools share the same trust model, but they should have different permissions, prompts, and demo flows.

## Judge Test Mode

Judges can test RepAI at three levels:

- **Level 1: Prompt-only test.** Use RepAI Lite or RepAI Staff Support Lite with no tenant data. Paste policy text or meeting notes into the chat.
- **Level 2: Tenant document test.** Connect real SharePoint, OneDrive, or Graph connector sources in the judge tenant and update the declarative agent manifest.
- **Level 3: Production tool test.** Connect real Work IQ APIs, Fabric IQ semantic models/data agents, Foundry role brain services, and Teams bot/meeting surfaces.

## Work IQ

RepAI Lite does not automatically access Work IQ. The production RepAI architecture can use Work IQ when the tenant has access and the agent is wired to the real APIs or MCP tools.

Microsoft announced that Work IQ APIs become generally available on **June 16, 2026** and are billed through Copilot Credits. Until those APIs are available in the tenant, RepAI should use mock Work IQ signals or ordinary Microsoft 365 sources.

## Fabric IQ

RepAI Lite does not automatically access Fabric IQ. Fabric IQ requires tenant Fabric/Power BI setup, semantic models or data agents, capacity/permissions, and the relevant Copilot or Frontier integration path.

For the hackathon demo, Fabric IQ should be presented as the production data intelligence path, while the local demo uses simulated semantic-model signals.

## Safe Demo Statement

RepAI Lite works live as an installable Copilot agent. Full RepAI connects to Work IQ, Fabric IQ, SharePoint, Graph connectors, Teams meetings, voice, and Foundry services when those tenant services and permissions are available.
