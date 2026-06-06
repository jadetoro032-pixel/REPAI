# RepAI Microsoft 365 Agent Scaffold

This folder is a starter Microsoft 365 app package for the hackathon demo.

## Files

- `manifest.json`: Microsoft 365 app manifest with `copilotAgents.declarativeAgents`.
- `declarativeAgent.json`: Declarative agent manifest using schema `v1.6`.

## Before Sideloading

Replace the placeholder values:

- `manifest.json` `id`
- `developer` URLs
- `validDomains`
- `icons.color` and `icons.outline` with real PNG assets
- SharePoint URL in `OneDriveAndSharePoint.items_by_url`
- Graph connector IDs for the knowledge folder and Fabric IQ semantic signals

## Validation Checklist

- Run `npm test` to verify the manifest references `declarativeAgent.json` and package icons.
- Run `npm run build` to verify TypeScript sources.
- Run `npm run build:web` to verify the visual demo build.
- Confirm `manifest.json` has a real GUID before sideloading.
- Confirm `color.png` and `outline.png` meet the final app icon requirements for your tenant/app store target.
- Confirm all SharePoint URLs and Graph connector IDs point to real tenant resources.
- Confirm the custom engine or Teams bot layer is listed separately if live meeting voice is included.

## Simulated vs Real

- **Simulated today:** Work IQ calls, Fabric IQ connector data, live Teams meeting audio, production tenant authorization.
- **Ready in code:** adapter boundary, role packs, Staff Support risk policy, audit log, Teams Adaptive Card payload, declarative agent scaffold.
- **Production swap:** replace the mock Work IQ adapter with real Work IQ API, MCP, or A2A calls when available.

The current scaffold is intentionally hybrid:

- **Microsoft 365 Copilot work brain:** tenant context, Work IQ, meetings, Teams, Outlook, SharePoint, OneDrive, and connector-backed knowledge.
- **Custom RepAI role brain:** voice, role packs, custom company data, coding workflows, secretary workflows, Staff Support queues, approval gates, and non-Microsoft tool actions.

In Staff Support mode, RepAI has its own operational queue. It can receive work through `@RepAI` Teams mentions, forwarded emails, tagged documents, Planner tasks, and SharePoint intake folders. Low-risk work can be handled automatically, medium-risk work becomes a draft for review, and high-risk work is escalated.

Until Work IQ production APIs are available, the demo uses a mock Work IQ adapter with the same shape the real integration should expose: emails, Teams threads, calendar events, SharePoint docs, and policy hits. Replace the mock adapter with real Work IQ API, MCP, or A2A calls when available.

If the hackathon requires real-time meeting attendance, add a custom engine agent or Teams bot layer for live meeting/bot behavior, then keep this declarative agent as the Copilot-facing knowledge and reasoning surface.
