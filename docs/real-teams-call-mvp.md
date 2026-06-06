# RepAI Real Teams Call MVP

This MVP keeps the data synthetic but uses a real Teams call surface.

The goal is simple:

1. RepAI loads demo connection data.
2. RepAI prepares the meeting: **Hackathon Rules, Demo, and Why RepAI Should Win**.
3. RepAI starts the Teams-call path.
4. The user chooses to join the call or let RepAI attend alone.
5. RepAI gives a short opening and sends a brief.

## What Is Synthetic

- Outlook schedule
- Teams invite context
- Gmail notes
- Documents
- Hackathon rules
- RepAI recommendation content

Small judge-facing line:

```text
Demo connection uses synthetic data. In production, RepAI connects to Outlook, Teams, Gmail, SharePoint, Work IQ, Fabric IQ, Azure Speech, and Azure AI Foundry.
```

## What Is Real

The call surface is designed for a real Microsoft Teams meeting.

RepAI needs a Teams calling bot package and backend. The package is in:

```text
appPackageTeamsCall/
```

The backend scaffold is in:

```text
src/server/teamsCallServer.ts
src/integrations/teamsCallMvp.ts
```

Run it locally:

```bash
npm run call:server
```

Health check:

```bash
curl http://127.0.0.1:3978/health
```

Start-call check:

```bash
curl -X POST http://127.0.0.1:3978/start-demo-call \
  -H "content-type: application/json" \
  -d "{\"userJoins\":true,\"recommendationPreference\":\"repai\"}"
```

Without Azure/Teams setup, this returns `setup_required` and lists the missing values.

Teams calling webhook:

```text
https://YOUR_PUBLIC_DOMAIN/api/calling
```

Do not use `localhost`, `127.0.0.1`, `/health`, or `/start-demo-call` as the Teams calling webhook.

## Required Setup

Create or collect these values:

```text
REPAI_PUBLIC_BASE_URL
REPAI_TEAMS_BOT_ID
REPAI_TEAMS_BOT_PASSWORD
REPAI_TENANT_ID
REPAI_DEMO_MEETING_URL
REPAI_FOUNDRY_ENDPOINT
REPAI_FOUNDRY_API_KEY
REPAI_SPEECH_KEY
REPAI_SPEECH_REGION
```

Put the real values in your local environment, Azure App Service settings, Azure Container Apps secrets, or another secret store. Do not commit them to the repo.

Teams-call minimum:

- `REPAI_PUBLIC_BASE_URL`
- `REPAI_TEAMS_BOT_ID`
- `REPAI_TEAMS_BOT_PASSWORD`
- `REPAI_TENANT_ID`
- `REPAI_DEMO_MEETING_URL`

Foundry brain:

- `REPAI_FOUNDRY_ENDPOINT`
- `REPAI_FOUNDRY_API_KEY`

Voice:

- `REPAI_SPEECH_KEY`
- `REPAI_SPEECH_REGION`

## What You Need To Do In Microsoft/Azure

1. Create an Azure Bot registration.
2. Enable the Teams channel.
3. Enable calling for the Teams channel.
4. Expose the RepAI backend over public HTTPS, for example with Azure App Service, Azure Container Apps, Dev Tunnels, or ngrok.
5. Set the calling webhook to `https://YOUR_PUBLIC_DOMAIN/api/calling`.
6. Confirm `bots[0].botId` in `appPackageTeamsCall/manifest.json` matches the Azure Bot Microsoft App ID.
7. Upload the Teams-call app package in Teams admin center.
8. Grant/admin-consent the required Teams calling permissions.
9. Create a real Teams meeting and put its join URL in `REPAI_DEMO_MEETING_URL`.
10. Add Foundry and Speech keys.

## Current Backend Boundary

The scaffold currently checks setup and builds the call script/brief. The actual media join/speak implementation is the next layer:

```text
Teams calling webhook
-> Bot Framework / Graph calling handler
-> Join REPAI_DEMO_MEETING_URL
-> Azure Speech TTS
-> RepAI 20-second opening
-> Optional Q&A through Foundry
-> Brief
```

This keeps the hackathon demo honest: the data is synthetic, but the call target is real Teams.
