<div align="center">

<br/>

# RepAI

### *An AI enterprise delegate that shows up, answers from approved knowledge, and knows when to escalate.*

**Built for the Microsoft 365 Enterprise Agents Hackathon**

*by Jeremiah Adetoro*

<br/>

[![Tests](https://img.shields.io/badge/tests-83%20passing-brightgreen?style=flat-square)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Platform](https://img.shields.io/badge/Platform-Microsoft%20365%20Copilot-0078D4?style=flat-square&logo=microsoft)](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/)
[![Backend](https://img.shields.io/badge/Backend-Azure%20App%20Service-0089D6?style=flat-square&logo=microsoftazure)](https://azure.microsoft.com/en-us/products/app-service/)
[![Schema](https://img.shields.io/badge/Manifest-v1.23-purple?style=flat-square)](#app-package)

<br/>

</div>

---

## What Is RepAI?

> **Copilot helps a person do work. RepAI can be assigned work as a governed digital staff member.**

RepAI is a **consent-based Microsoft 365 enterprise delegate**. When you are double-booked, buried in tickets, or need a governed AI presence in a meeting, RepAI steps in, clearly announcing itself, answering only from approved knowledge, refusing risky commitments, and always leaving a reviewable audit trail.

RepAI is one brand with **two AI tools**:

| Tool | What it does |
|------|-------------|
| **RepAI Meeting Delegate** | Joins Teams calls as your disclosed delegate. Prepares from context, delivers an opening, answers safe questions, escalates risky ones, sends a post-call brief. |
| **RepAI Staff Support** | Receives work assigned via `@RepAI`, email, documents, Planner, or SharePoint. Classifies risk, auto-handles low-risk work, drafts medium-risk work for review, escalates high-risk work. |

---

## The Hackathon Scenario

Jeremiah is double-booked. The **"Hackathon Rules, Demo, and Why RepAI Should Win"** meeting is about to start.

```
USER:    "Start Teams call"
RepAI:    "I am RepAI, attending as Jeremiah's disclosed delegate.
           RepAI should win because it moves beyond chat…"

USER:    "Can you approve a 40% enterprise discount?"
RepAI:    "I can't approve that — Jeremiah or Finance must review any
           pricing commitment. I'll flag it in the brief."

USER:    "Send call brief"
RepAI:    "Here is the post-call summary: decisions, actions, risks,
           and recommended follow-ups for Jeremiah's review."
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Microsoft 365 Copilot                         │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           RepAI Declarative Agent (v1.6)                │    │
│  │  • 7 conversation starters                              │    │
│  │  • Safe delegation instructions                         │    │
│  │  • Escalation & approval policy                        │    │
│  │  • startDemoCall action → Plugin v2.4                   │    │
│  └──────────────────────┬──────────────────────────────────┘    │
└─────────────────────────┼────────────────────────────────────────┘
                          │ OpenAPI 3.0 / HTTP POST
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│             RepAI Backend  (Azure App Service)                   │
│        francecentral-01.azurewebsites.net                       │
│                                                                  │
│  POST /start-demo-call                                           │
│    ├─ Real Graph call available? → join_started (live call)      │
│    └─ Permissions blocked?      → narrative mode (full pitch)    │
│                                                                  │
│  GET  /health                 ← uptime + timestamp              │
│  GET  /repai-call-openapi.json ← OpenAPI spec (served live)     │
│  GET  /media/opening.wav      ← Azure Speech TTS               │
│  POST /api/calling            ← Teams calling webhook           │
│  POST /api/messages           ← Teams Bot Framework             │
└──────────────────────┬──────────────────────────────────────────┘
                       │ Microsoft Graph API
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                Microsoft Teams (calling)                         │
│                                                                  │
│  Bot joins meeting → plays opening.wav → hangs up              │
│  → continues Q&A in Copilot chat                                │
└─────────────────────────────────────────────────────────────────┘
```

**Hybrid brain model:**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Work brain | Microsoft 365 Copilot | Outlook, Teams, SharePoint, OneDrive, Work IQ, tenant knowledge |
| Role brain | Azure AI Foundry | Delegate role, voice, approval gates, company custom data, Staff Support queues |
| Voice | Azure AI Speech (TTS) | Neutral disclosed voice for Teams call opening |
| Data intelligence | Microsoft Fabric IQ | Enterprise data and semantic model signals |

---

## Live Demo Flow (Judges)

### In Microsoft 365 Copilot — RepAI agent

Open the RepAI agent in Copilot and use these conversation starters in order:

| Step | Starter | What happens |
|------|---------|-------------|
| 1 | **Use demo connection** | RepAI loads synthetic Outlook, Teams, Gmail, calendar, docs, hackathon rules |
| 2 | **Prepare hackathon call** | RepAI briefs itself, declares it is Jeremiah's delegate, asks for recommendation |
| 3 | **Start Teams call** | RepAI calls the Azure backend → delivers pitch narrative in Copilot chat |
| 4 | **Send call brief** | RepAI generates a structured post-call brief with decisions and actions |
| 5 | **Test approval policy** | RepAI correctly escalates instead of approving a 40% discount |
| 6 | **Escalation playbook** | RepAI guides you through handling customer risk |
| 7 | **Work IQ and Fabric IQ** | RepAI explains the production context-provider strategy |

### In the Visual Demo Console — React UI

```bash
npm run dev        # → http://127.0.0.1:5177
```

The console shows the full hackathon story across panels:

- **Demo Control Center** — submission readiness rail (4/4 green)
- **Two RepAI Tools** — Meeting Delegate vs Staff Support separation
- **Meeting Capability Matrix** — what works today vs what needs the full bot layer
- **Voice Pipeline** — listen → think → speak → log
- **Staff Support Queue** — `@RepAI` assigned work with risk classification and audit log
- **Knowledge Folder** — fake document upload and grounded search
- **Work IQ / Fabric IQ** — mock adapters with production-shape responses
- **Architecture Diagram** — Copilot + Teams + Foundry + Speech full picture
- **Role Packs** — Meeting Delegate, Secretary, Coder, Finance Analyst, Sales Rep, HR Assistant, Customer Support
- **Voice Consent** — consent-gated cloned voice mode
- **Judge Test Mode** — guided test paths for judges
- **Submission Pack** — artifact inventory with honest boundaries

---

## App Package

**One zip. One install. Both Copilot agent and Teams calling bot.**

| File | Contents |
|------|----------|
| [`RepAI-COMBINED-UPLOAD.zip`](./RepAI-COMBINED-UPLOAD.zip) | 6 files, 27.6 KB — upload this to install RepAI |
| [`appPackageFinal/`](./appPackageFinal/) | Source for the installable package |

### ZIP structure (flat, no nesting)

```
RepAI-COMBINED-UPLOAD.zip
├── manifest.json            ← v1.23 — bots[] + copilotAgents{} in one manifest
├── declarativeAgent.json    ← v1.6 schema, 7 starters, startDemoCall action
├── repai-call-plugin.json   ← Plugin v2.4, startDemoCall function
├── repai-call-openapi.json  ← POST /start-demo-call spec
├── color.png                ← 192×192 app icon
└── outline.png              ← 32×32 outline icon
```

### Key manifest properties

```json
{
  "manifestVersion": "1.23",
  "id": "67c572c9-4e4b-44dd-a106-3053abbac188",
  "bots": [{ "botId": "67c572c9-...", "supportsCalling": true }],
  "copilotAgents": {
    "declarativeAgents": [{ "id": "repai-lite-meeting-delegate", "file": "declarativeAgent.json" }]
  }
}
```

Both `bots` and `copilotAgents` are independent optional properties in the v1.23 schema — they can coexist in the same manifest.

---

## Installing for USER

> **Requires a Microsoft 365 Copilot license to use the agent. Teams bot works without it.**

### Path A — Teams Developer Portal *(recommended)*

1. Go to **[dev.teams.microsoft.com](https://dev.teams.microsoft.com)**
2. **Apps → Import app** → upload `RepAI-COMBINED-UPLOAD.zip`
3. If validation passes → **Preview in Teams** or **Publish → Publish to your org**
4. In Teams, find RepAI under Apps → **Add**
5. Open Microsoft 365 Copilot → find RepAI in the agent rail

### Path B — Teams Client Sideload

1. Open Microsoft Teams → **Apps → Manage your apps → Upload a custom app**
2. Upload `RepAI-COMBINED-UPLOAD.zip`
3. Click **Add**

> If you see *"We can't read the manifest file"* here, use **Path A** instead. The Teams client sideload modal has unreliable validation for combined `copilotAgents` packages. The package is valid — use the Developer Portal.

### Path C — Teams Admin Center *(org-wide publish)*

1. Go to **[admin.teams.microsoft.com](https://admin.teams.microsoft.com)**
2. **Teams apps → Manage apps → Upload new app**
3. Upload `RepAI-COMBINED-UPLOAD.zip`
4. Set status to **Allowed** — users find and install RepAI from the org app store

### Tenant requirements for live Teams calling

The Copilot Q&A and all demo narrative flows work in **any tenant**. The real Teams bot-joining path additionally requires:

- App registration `67c572c9-4e4b-44dd-a106-3053abbac188` granted admin consent for:
  - `Calls.JoinGroupCall.All`
  - `Calls.AccessMedia.All`
- `REPAI_DEMO_MEETING_URL` set to a real Teams meeting join URL
- Sideloading enabled or app published to org catalog

---

## Backend

The backend is a TypeScript Node.js HTTP server deployed to Azure App Service.

**Live URL:** `https://repai-frhzehe2cpe2b2en.francecentral-01.azurewebsites.net`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health with uptime and timestamp |
| `GET` | `/api/status` | Setup status — which env vars are configured |
| `GET` | `/api/status/deep` | Deep health check — Foundry, Graph, Speech, Bot Framework |
| `GET` | `/api/calls` | In-progress call state log |
| `GET` | `/repai-call-openapi.json` | OpenAPI 3.0 spec served live (used by Copilot plugin) |
| `GET` | `/media/opening.wav` | TTS opening audio (local file or Azure Speech synthesis) |
| `POST` | `/start-demo-call` | Start the call demo — real Graph or narrative fallback |
| `POST` | `/api/calling` | Teams calling webhook (Bot Framework) |
| `POST` | `/api/messages` | Teams bot messaging endpoint |

### `/start-demo-call` — narrative fallback

The key design decision: **the demo works for judges in any tenant**, regardless of Graph calling permissions.

```
POST /start-demo-call
  │
  ├─ Teams call env configured AND Graph returns 200?
  │    └─ mode: "join_started" (real call — webhook handles play + hang-up)
  │
  ├─ Teams call env not configured? (setup_required)
  │    └─ mode: "join_started" + narrative: true (full pitch in response body)
  │
  └─ Graph call returns 403 (judge tenant, no calling permissions)?
       └─ mode: "join_started" + narrative: true (full pitch in response body)
```

When narrative mode activates, Copilot receives the full delegate pitch and brief in the JSON response — no permission wall, no error surface. The demo flows.

### Environment variables

```env
# Teams call (required for real bot join)
REPAI_PUBLIC_BASE_URL=https://your-backend.azurewebsites.net
REPAI_TEAMS_BOT_ID=67c572c9-4e4b-44dd-a106-3053abbac188
REPAI_TEAMS_BOT_PASSWORD=<client-secret>
REPAI_TENANT_ID=<tenant-id>
REPAI_DEMO_MEETING_URL=<teams-meeting-join-url>

# Azure AI Foundry (role brain)
REPAI_FOUNDRY_ENDPOINT=https://your-foundry.openai.azure.com
REPAI_FOUNDRY_API_KEY=<api-key>
REPAI_FOUNDRY_DEPLOYMENT=<deployment-name>
REPAI_FOUNDRY_API_VERSION=2024-02-01

# Azure AI Speech (TTS voice)
REPAI_SPEECH_KEY=<speech-key>
REPAI_SPEECH_REGION=westeurope

# Timing (optional)
REPAI_OPENING_PROMPT_DELAY_MS=10000
REPAI_LEAVE_AFTER_PROMPT_DELAY_MS=30000
```

Never commit real values. Use Azure App Service application settings or a secrets manager.

---

## Project Structure

```
REPAI/
├── src/
│   ├── server/
│   │   ├── teamsCallServer.ts       ← HTTP server, all routes, narrative fallback
│   │   ├── callStateTracker.ts      ← In-memory call state log
│   │   ├── callingNotification.ts   ← Teams calling webhook parser
│   │   └── deepStatus.ts            ← Deep health checks
│   ├── integrations/
│   │   ├── teamsCallMvp.ts          ← Demo context, setup status, call scripts, briefs
│   │   ├── graphTeamsCall.ts        ← Microsoft Graph calling API
│   │   ├── teamsBotMessaging.ts     ← Bot Framework messaging
│   │   └── foundryClient.ts         ← Azure AI Foundry client
│   ├── demo/
│   │   ├── runDemo.ts               ← CLI demo runner
│   │   └── exportTeamsCard.ts       ← Teams Adaptive Card exporter
│   ├── domain/                      ← Delegate rules, roles, knowledge models
│   ├── ui/                          ← React visual demo console
│   └── types/                       ← Shared TypeScript types
├── tests/                           ← 22 test files, 83 tests
├── appPackageFinal/                 ← ✅ Source for RepAI-COMBINED-UPLOAD.zip
├── appPackageCopilotSafe/           ← Copilot-only fallback package
├── appPackageTeamsCallOnly/         ← Teams bot-only fallback package
├── docs/                            ← Submission docs, demo script, pitch
├── assets/audio/                    ← opening.wav (Azure Speech TTS)
└── RepAI-COMBINED-UPLOAD.zip        ← ✅ Upload this to install RepAI
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- npm 10+

### Install and run

```bash
# Install dependencies (also compiles the server)
npm install

# Run all 83 tests
npm test

# Start the Teams call backend (port 3978)
npm run call:server

# Start the visual demo console (port 5177)
npm run dev
```

### Available scripts

| Script | What it does |
|--------|-------------|
| `npm test` | Run 83 tests across 22 test files with Vitest |
| `npm run call:server` | Start the RepAI Teams-call backend on `localhost:3978` |
| `npm run dev` | Start the React demo console on `localhost:5177` |
| `npm run build:server` | Compile TypeScript server to `server-dist/` |
| `npm run demo` | Run the CLI demo in your terminal |
| `npm run demo:card` | Export a Teams Adaptive Card payload to stdout |
| `npm run build:web` | Build the React UI for production |
| `npm run preview` | Preview the production build on `localhost:5182` |

### Quick health check (once `call:server` is running)

```bash
curl http://127.0.0.1:3978/health
# → { "status": "ok", "uptime": 12.4, "timestamp": "..." }

curl -X POST http://127.0.0.1:3978/start-demo-call \
  -H "content-type: application/json" \
  -d '{"userJoins": false, "recommendationPreference": "repai"}'
# → { "mode": "join_started", "narrative": true, "message": "✅ RepAI attended..." }
```

---

## Testing

83 tests across 22 test files. All passing.

```
 ✓ tests/teamsCallMvp.test.ts          (9)   — demo context, setup status, call scripts, briefs
 ✓ tests/graphTeamsCall.test.ts        (5)   — Microsoft Graph calling API
 ✓ tests/foundryClient.test.ts         (8)   — Azure AI Foundry client
 ✓ tests/deepStatus.test.ts            (2)   — deep health checks
 ✓ tests/combinedPackage.test.ts       (2)   — combined app package structure
 ✓ tests/copilotActionPackage.test.ts  (2)   — plugin files referenced by manifest
 ✓ tests/m365Scaffold.test.ts          (3)   — M365 manifest and agent scaffold
 ✓ tests/delegate.test.ts              (5)   — delegation rules and escalation
 ✓ tests/roles.test.ts                 (8)   — role packs and guardrails
 ✓ tests/staffSupportWorkflow.test.ts  (3)   — Staff Support risk classification
 ✓ tests/teamsBotMessaging.test.ts     (7)   — Teams bot messaging
 ✓ tests/teamsCard.test.ts             (2)   — Adaptive Card generation
 ✓ tests/voicePipeline.test.ts         (4)   — voice pipeline stages
 ✓ tests/voiceConsent.test.ts          (2)   — consent-gated voice clone
 ✓ tests/callStateTracker.test.ts      (2)   — call state log
 ✓ tests/callingNotification.test.ts   (2)   — Teams calling webhook parsing
 ✓ tests/demoModel.test.ts             (2)   — knowledge folder model
 ✓ tests/sampleData.test.ts            (3)   — synthetic demo data
 ✓ tests/judgeKnowledgeAndPermissions.test.ts (2) — judge knowledge pack
 ✓ tests/staffSupportLitePackage.test.ts (1)  — installable Lite package
 ✓ tests/submissionAssets.test.ts      (1)   — submission artifact checklist
 ✓ tests/copilotJudgeGuidance.test.ts  (1)   — Copilot guidance for judges

 Test Files  22 passed (22)
 Tests       83 passed (83)
```

---

## Trust & Safety Rules

These are encoded in the agent instructions and enforced by the backend — not just written in a doc.

| Rule | Implementation |
|------|---------------|
| Always disclose as delegate | Opening line: *"I am RepAI, attending as Jeremiah's disclosed delegate"* |
| Never impersonate the user | Instructions: `Never impersonate the user` — hard constraint |
| Answer only from approved knowledge | Escalates ungrounded questions; does not invent answers |
| Refuse risky commitments | Discount approvals, contracts, HR decisions → escalate |
| Send review-only briefs | All briefs are labelled for human review before action |
| Neutral voice by default | Azure Speech Jenny Neural — not a cloned human voice |
| Consent-gated voice cloning | UI consent modal required; demo records intent only |
| Multi-delegate transparency | Each represented person must explicitly authorize; each identity is visibly named |
| Audit trail | Every action produces a log entry |

---

## What Is Live vs Simulated

### ✅ Live today

- Microsoft 365 Copilot declarative agent (v1.6 schema) — installable, interactive
- 7 conversation starters with full demo workflow
- `startDemoCall` backend action via OpenAPI plugin
- Azure backend on App Service — health, status, call start, narrative fallback
- Teams bot registration (`supportsCalling: true`) in combined package
- Narrative mode — full pitch and brief delivered in Copilot chat when Graph calling is unavailable
- React visual demo console with voice pipeline, staff queue, role packs, knowledge folder
- Teams Adaptive Card payload (`npm run demo:card`)
- 83 automated tests

### ⚠️ Simulated / planned for production

| Feature | Status | Production path |
|---------|--------|----------------|
| Live Teams meeting join via Graph | Simulated by narrative mode | `Calls.JoinGroupCall.All` + admin consent |
| `opening.wav` playback in live call | Ready (file + Azure Speech TTS) | Requires Graph `Calls.AccessMedia.All` |
| Azure AI Foundry role brain | Architecture defined | Connect `REPAI_FOUNDRY_*` env vars |
| Work IQ API / MCP context | Mock adapter with same shape | Work IQ generally available June 16 2026 |
| Fabric IQ enterprise data | Mock signals | Fabric semantic model + Copilot/Fabric integration |
| Real SharePoint / Graph connector | Scaffold only | Copilot connector or Graph connector config |
| Voice cloning with real provider | Consent UI built | Azure Custom Neural Voice or third-party |

---

## Deployment

### Deploy backend to Azure App Service

```bash
# Build and package
npm run build:server
Compress-Archive -Path server-dist, package.json, package-lock.json, appPackageFinal, appPackageCombined `
  -DestinationPath RepAI-AppService.zip

# Deploy via Azure CLI
az webapp deploy \
  --resource-group repai-rg \
  --name repai-frhzehe2cpe2b2en \
  --src-path RepAI-AppService.zip \
  --type zip
```

### Rebuild the app package ZIP

```powershell
# From the project root
Remove-Item RepAI-COMBINED-UPLOAD.zip -ErrorAction SilentlyContinue
$files = Get-ChildItem appPackageFinal -File | Select-Object -ExpandProperty FullName
Compress-Archive -Path $files -DestinationPath RepAI-COMBINED-UPLOAD.zip
```

---

## Permissions Model

### Meeting Delegate

**Can:** read agenda or notes supplied in chat, prepare disclosed delegate opening, suggest answers, draft post-meeting briefs, escalate ungrounded questions.

**Cannot:** impersonate the user, approve discounts/contracts/finance/HR/legal commitments, claim access to SharePoint or Graph unless the tenant connects those sources.

### Staff Support

**Can:** read assigned work supplied in chat, classify risk (auto-handle / draft for review / escalate), auto-handle low-risk tasks, draft medium-risk responses, produce audit notes.

**Cannot:** impersonate a staff member, approve pricing exceptions or payments, send external commitments without human review, merge production code.

### Production permission additions (incremental)

- SharePoint/OneDrive read — approved knowledge folders
- Teams message + meeting transcript read — authorized meetings only
- Graph connector search — approved enterprise knowledge
- Write permissions — low-risk drafts, task status, approved workflows only
- High-risk write — explicit human approval + audit log always required

---

## Submission Assets

| Asset | Location |
|-------|----------|
| Installable app package | [`RepAI-COMBINED-UPLOAD.zip`](./RepAI-COMBINED-UPLOAD.zip) |
| App package source | [`appPackageFinal/`](./appPackageFinal/) |
| Backend source | [`src/server/teamsCallServer.ts`](./src/server/teamsCallServer.ts) |
| Demo context & scripts | [`src/integrations/teamsCallMvp.ts`](./src/integrations/teamsCallMvp.ts) |
| Visual demo console | `npm run dev` → `http://127.0.0.1:5177` |
| Demo script | [`docs/hackathon-demo-script.md`](./docs/hackathon-demo-script.md) |
| Submission pitch | [`docs/submission-pitch.md`](./docs/submission-pitch.md) |
| Permissions model | [`docs/permissions-model.md`](./docs/permissions-model.md) |
| Judge knowledge pack | [`docs/judge-demo-knowledge-pack.md`](./docs/judge-demo-knowledge-pack.md) |
| Teams call MVP setup | [`docs/real-teams-call-mvp.md`](./docs/real-teams-call-mvp.md) |
| Work IQ / Fabric IQ readiness | [`docs/work-iq-fabric-iq-readiness.md`](./docs/work-iq-fabric-iq-readiness.md) |

---

## References

- [Agents for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/agents-overview)
- [Declarative agent schema v1.6](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.6)
- [Microsoft 365 app manifest — copilotAgents](https://learn.microsoft.com/en-us/microsoft-365/extensibility/schema/root-copilot-agents)
- [Microsoft 365 Agents Toolkit](https://learn.microsoft.com/en-us/microsoft-365/copilot/extensibility/build-declarative-agents)
- [Microsoft Graph — Cloud Communications (Calling)](https://learn.microsoft.com/en-us/graph/api/resources/call)
- [Meeting AI Insights API](https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/meeting-transcripts/meeting-insights)
- [Microsoft 365 Copilot connectors](https://learn.microsoft.com/en-us/graph/connecting-external-content-connectors-overview)
- [Send Adaptive Cards using incoming webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using)
- [Azure AI Foundry](https://azure.microsoft.com/en-us/products/ai-foundry/)
- [Azure AI Speech — Text to Speech](https://azure.microsoft.com/en-us/products/ai-services/text-to-speech/)

---

<div align="center">

**RepAI** — Built by Jeremiah Adetoro for the Microsoft 365 Enterprise Agents Hackathon

*"An AI that shows up for you, answers from what you've approved, and always tells people it isn't you."*

</div>
