# RepAI Meeting Delegate

RepAI is a consent-based Microsoft 365 meeting delegate prototype. It represents Jeremiah's working context without impersonating him: it clearly announces that it is attending as his delegate, answers only from approved knowledge, refuses unsupported answers, and sends Jeremiah a post-meeting brief.

RepAI is now framed as a **hybrid enterprise representative**:

- **Microsoft 365 Copilot work brain:** meetings, Teams, Outlook, SharePoint, OneDrive, Work IQ, tenant knowledge, and Copilot connectors.
- **Custom RepAI role brain:** voice, role packs, neutral speech, company custom data, coding/secretary workflows, Staff Support queues, approval gates, and non-Microsoft tools.

RepAI is one brand with two separate AI tools:

- **RepAI Meeting Delegate:** represents a user in meetings, prepares delegate openings, answers safe meeting questions, and produces review-only meeting briefs.
- **RepAI Staff Support:** receives assigned work, owns a queue, classifies risk, drafts responses, and escalates work that needs human authority.

## Hackathon Pitch

Jeremiah is double-booked. RepAI attends the product sync as his disclosed delegate, captures decisions and action items, answers a launch-readiness question from approved wiki/folder content, refuses an unsupported pricing commitment, and drafts a follow-up for Jeremiah to review.

The expanded pitch: RepAI can switch into approved enterprise role packs such as Meeting Delegate, Secretary, Coder, Staff Support, Finance Analyst, Sales Rep, HR Assistant, or Customer Support. Users upload company custom data, then RepAI uses that data with Work IQ and Fabric IQ to represent them safely.

## Run Locally

```bash
npm install
npm test
npm run build
npm run demo
npm run demo:card
npm run call:server
npm run dev
npm run preview
```

Open [http://127.0.0.1:5177](http://127.0.0.1:5177) after `npm run dev` to use the visual demo console. For production preview, run `npm run build:web` and then `npm run preview`, then open [http://127.0.0.1:5182](http://127.0.0.1:5182).

`npm run call:server` starts the RepAI real Teams-call MVP scaffold on [http://127.0.0.1:3978](http://127.0.0.1:3978). It uses synthetic demo context and reports the Azure/Teams settings needed before RepAI can join a real Teams meeting.

## Trust Rules

- RepAI always says it is attending as Jeremiah's delegate.
- RepAI never says it is Jeremiah.
- RepAI uses a neutral disclosed voice by default, not a cloned human voice.
- RepAI answers from approved knowledge and returns citations.
- RepAI escalates questions it cannot ground.
- RepAI drafts follow-ups for review instead of sending commitments automatically.
- RepAI can join a call as two different roles or accounts only when every represented person authorizes it and each meeting identity visibly names who it represents.
- RepAI Staff Support can own assigned work, but only low-risk work is automatic; medium-risk work is drafted for review and high-risk work is escalated.

## Visual Demo Console

The React demo UI shows the full hackathon story:

- **Demo Control Center:** a first-screen judge path with Start Demo, Staff Support, Voice Pipeline, Architecture, and Submission Pack shortcuts.
- **Submission readiness:** a clear 4/4 rail showing the demo UI, voice flow, agent scaffold, and pitch assets are prepared.
- **Real Teams call MVP:** shows the simplified judge flow: use demo connection, prepare the hackathon meeting, choose whether the user joins, start the Teams-call path, and produce a brief.
- **Two RepAI tools:** separates Meeting Delegate from Staff Support so the delegate story and assigned-work story do not blur together.
- **Meeting capability matrix:** shows what works today versus what needs the Teams bot/custom engine layer.
- **Judge Test Mode:** shows how judges can test with prompts, tenant documents, or their own Work IQ/Fabric IQ/Foundry tools.
- **Before meeting:** Jeremiah is double-booked and RepAI prepares a delegate disclosure.
- **During meeting:** participants use **Ask RepAI by voice**. Browser speech recognition is used when available, and demo voice prompts are included for environments where speech capture is blocked.
- **Text activation:** users can also type `@RepAI ...` when voice is unavailable or when a Teams text mention triggers work.
- **Knowledge Folder:** a fake upload/search panel adds approved documents and searches titles, sources, and content.
- **Work IQ:** shows Microsoft 365 work-context signals from Teams, Outlook, SharePoint, and OneDrive.
- **Fabric IQ:** shows enterprise data and semantic-model signals from Microsoft Fabric.
- **After meeting:** RepAI renders a brief and a Teams Adaptive Card preview.
- **Architecture:** the app includes a Copilot + Teams diagram linking meeting voice, RepAI, Work IQ, Fabric IQ, knowledge sources, and Teams delivery.
- **Role packs:** the app shows Secretary, Coder, Finance Analyst, Sales Rep, HR Assistant, Customer Support, and Meeting Delegate roles.
- **Staff Support queue:** the app shows `@RepAI` assigned work across Teams, email, documents, Planner, and SharePoint intake.
- **Mock Work IQ workflow:** the app shows retrieved work context, action draft, and audit log for selected Staff Support work.
- **Guardrails:** the app shows neutral voice policy and two-account delegate rules.
- **Voice pipeline:** the app shows how RepAI listens, thinks, speaks, and logs each answer.
- **Voice customization:** users can use a role-based neutral voice profile or pick an available browser voice.
- **Consent-gated voice clone mode:** users can request cloned voice mode only after accepting explicit consent, disclosure, audit, and policy requirements.
- **Submission Pack:** the app lists the exact artifacts and boundaries judges should inspect.

## Microsoft 365 Integration Path

This first version is local and deterministic so the product behavior is demoable without tenant setup. The intended Microsoft 365 path is:

- Microsoft 365 Copilot agent for the user-facing delegate experience.
- Microsoft 365 Agents Toolkit for a declarative or custom-engine agent shell.
- Microsoft Graph Meeting AI Insights for post-meeting summaries, action items, and mentioned utterances after transcribed Teams meetings.
- Copilot connectors or Graph connectors for approved wiki and knowledge folder content.
- Teams message or Adaptive Card delivery for the post-meeting brief and suggested follow-up.
- Declarative agent scaffold in `appPackage/` for Microsoft 365 app packaging.

## Microsoft 365 Agent Scaffold

The `appPackage/` folder contains:

- `manifest.json`: Microsoft 365 app manifest referencing the declarative agent through `copilotAgents.declarativeAgents`.
- `declarativeAgent.json`: Copilot declarative agent scaffold with OneDrive/SharePoint, Graph connectors, Teams messages, Meetings, and People capabilities.

Before sideloading, replace placeholder app IDs, developer URLs, icon PNGs, SharePoint URLs, and Graph connector IDs with tenant-specific values.

For the hybrid version, keep `appPackage/` as the Copilot-facing work brain and add a custom engine or Teams bot layer for live voice, role switching, coding tools, secretary workflows, Staff Support queues, and other non-Microsoft actions.

## Submission Assets

- [Demo script](docs/hackathon-demo-script.md)
- [Submission pitch](docs/submission-pitch.md)
- [Submission assets checklist](docs/submission-assets.md)
- [Work IQ and Fabric IQ readiness](docs/work-iq-fabric-iq-readiness.md)
- [Judge demo knowledge pack](docs/judge-demo-knowledge-pack.md)
- [Permissions model](docs/permissions-model.md)
- Microsoft 365 app package scaffold in `appPackage/`
- RepAI Lite package in `appPackageLite/`
- RepAI Staff Support Lite package in `appPackageStaffSupportLite/`
- Teams Adaptive Card payload from `npm run demo:card`
- RepAI real Teams-call MVP package in `appPackageTeamsCall/`
- [Real Teams-call MVP setup guide](docs/real-teams-call-mvp.md)

If judges cannot access the same tenant, they can use the Judge Demo Knowledge Pack by pasting a policy or transcript into RepAI Lite or RepAI Staff Support Lite, then using a starter such as "Use my demo knowledge" or "I have read the Pricing Approval Policy."

## Staff Support vs Copilot

Copilot helps a person do work. RepAI Staff Support can be assigned work as a digital staff member.

- Copilot: "Help me summarize this escalation."
- RepAI Staff Support: "@RepAI handle this escalation."

RepAI then owns the item in a queue, checks company procedures, drafts or completes the next step, posts status, and escalates when approval is required.

## Work IQ Fallback Strategy

Work IQ production APIs are treated as the future Microsoft 365 context layer. Until they are available, RepAI uses a mock Work IQ adapter:

```text
Today: mock Work IQ adapter -> RepAI Staff Support workflow -> UI
Later: real Work IQ API/MCP -> same RepAI Staff Support workflow -> UI
```

The adapter contract returns emails, Teams threads, calendar events, SharePoint docs, and policy hits. The Staff Support workflow then classifies the item as auto-handle, draft-for-review, or escalate and writes an audit log.

Work IQ APIs are generally available starting **June 16, 2026** according to Microsoft, and API use is billed through Copilot Credits. RepAI Lite does not call Work IQ directly; Full RepAI should connect Work IQ only when the tenant has the service, permissions, and budget configured.

Fabric IQ is treated as the production enterprise data intelligence path. It requires Fabric/Power BI semantic models or data agents, capacity and permissions, and the relevant Microsoft 365 Copilot/Fabric integration path. The hackathon UI uses simulated Fabric IQ signals until those tenant services are connected.

## Voice Pipeline

RepAI supports both voice and text activation in the demo.

```text
Listen: browser speech recognition or typed @RepAI request
Think: RepAI role brain + approved knowledge / mock Work IQ context
Speak: neutral browser speech synthesis + visible text response
Log: transcript, citations, decision, and audit output
```

Production path:

```text
Teams meeting audio / transcript
-> Azure AI Speech-to-text
-> Azure AI Foundry RepAI role brain
-> Work IQ / Fabric IQ / company data
-> Azure AI Speech neutral voice
-> Teams captions/text fallback
-> audit log
```

RepAI should use a neutral disclosed voice by default: "I am RepAI, speaking as Jeremiah's disclosed delegate." Custom human-like voices should require explicit consent, policy approval, and audit logging.

In the demo, voice customization has three modes:

- **Role voice profile:** RepAI adjusts rate, pitch, and disclosure based on the active role, such as Staff Support, Coder, Finance Analyst, Secretary, or Meeting Delegate.
- **Custom browser voice:** the user can pick one of the voices exposed by their browser/OS speech engine.
- **Cloned voice mode:** requires a consent popup before it can be enabled. The demo records consent intent, but does not perform real provider-backed voice cloning.

This is voice selection, not hidden impersonation. RepAI still announces itself as RepAI. Consent helps reduce risk, but production use still needs legal review, company policy approval, and audit logging.

`npm run demo:card` prints a Teams incoming-webhook-style message envelope containing an Adaptive Card. The card uses review/open links rather than `Action.Submit`, because Teams incoming webhooks do not support submit actions.

References:

- [Agents for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agents-overview)
- [Create declarative agents using Microsoft 365 Agents Toolkit](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-declarative-agents)
- [Meeting AI Insights API](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/meeting-transcripts/meeting-insights)
- [Microsoft 365 Copilot connectors overview](https://learn.microsoft.com/en-us/graph/connecting-external-content-connectors-overview)
- [Send Adaptive Cards using incoming webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using)
- [Declarative agent schema v1.6](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.6)
- [Microsoft 365 app copilotAgents reference](https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/root-copilot-agents)
