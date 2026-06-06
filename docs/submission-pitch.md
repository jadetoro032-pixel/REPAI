# RepAI Submission Pitch

## One-Liner

RepAI is a disclosed Microsoft 365 meeting delegate and staff-support agent that can answer by voice, act from approved company knowledge, and escalate risky work instead of pretending to be the human.

## 30-Second Pitch

Jeremiah is double-booked, so RepAI joins the product sync and clearly says: "I am RepAI, attending as Jeremiah's delegate." During the call, people can talk to RepAI. It listens, answers from the approved knowledge folder, cites sources, refuses unsupported approvals, and sends Jeremiah a brief after the meeting.

The bigger direction is Staff Support. RepAI can also be assigned work through `@RepAI`, email, documents, Planner, or SharePoint. Copilot remains the Microsoft 365 work brain. RepAI adds the role brain: queue ownership, voice, role packs, approval gates, company custom data, and audit logging.

## 3-Minute Demo Path

1. Open the Demo Control Center and point to the submission readiness rail.
2. Start the voice demo and ask: "What signoff do we need before launch approval?"
3. Show the grounded answer, citation, and spoken response.
4. Ask a risky approval question and show RepAI escalating instead of approving.
5. Open Staff Support and click a queue item.
6. Show the mock Work IQ context, action draft, classification, and audit log.
7. Open Architecture and explain the hybrid brain: Copilot for work context, RepAI for role-specific autonomy.
8. Close with the Submission Pack and explain which pieces are real today versus simulated.

## Differentiator

Copilot helps a person do work. RepAI can be assigned work as a governed digital staff member.

## Production Path

- Declarative agent: Copilot-facing experience, Microsoft 365 knowledge, SharePoint/OneDrive, Teams, and user trust.
- Custom engine agent: Azure AI Foundry role brain, live voice pipeline, Staff Support queue orchestration, external tools, and non-Microsoft workflows.
- Work IQ and Fabric IQ: production context providers when available; the demo uses a mock adapter with the same shape.

## Honest Demo Boundaries

- Built: React judge console, voice input/output, text activation, knowledge folder search, role packs, risk gates, staff queue, Teams Adaptive Card payload, and Microsoft 365 app package scaffold.
- Simulated: live Teams meeting audio, real Work IQ APIs, Fabric tenant data, and production voice-cloning provider.
- Guardrail: voice cloning is consent-gated and RepAI still announces itself as RepAI.
