# Submission Assets Checklist

## Ready In This Repo

- `src/ui/App.tsx`: judge-facing demo console with Demo Control Center, voice flow, Staff Support, Knowledge Folder, Work IQ, Fabric IQ, and architecture sections.
- `appPackage/manifest.json`: Microsoft 365 app manifest scaffold.
- `appPackage/declarativeAgent.json`: Copilot declarative agent scaffold.
- `appPackageLite/`: working prompt-only RepAI Lite package.
- `appPackageStaffSupportLite/`: separate Staff Support Lite package for assigned-work testing.
- `appPackage/color.png` and `appPackage/outline.png`: required app icons for a Teams/Microsoft 365 app package.
- `docs/hackathon-demo-script.md`: talk track for the live demo.
- `docs/submission-pitch.md`: concise submission pitch and production path.
- `npm run demo:card`: prints the Teams Adaptive Card message envelope.
- `docs/work-iq-fabric-iq-readiness.md`: explains how judges can test with their own tools and what requires real tenant services.
- `docs/judge-demo-knowledge-pack.md`: copy-paste demo policies, playbooks, metrics, and transcript snippets for judges without tenant data.
- `docs/permissions-model.md`: role permissions and boundaries for Meeting Delegate and Staff Support.

## Before Tenant Sideloading

- Replace placeholder IDs in `appPackage/manifest.json`.
- Replace placeholder developer, privacy, terms, and website URLs.
- Point SharePoint and connector references to the hackathon tenant.
- Zip only the manifest and required icon files at the app package root.
- Validate the package with Microsoft 365 Agents Toolkit or Developer Portal for Teams.

## Screenshot Plan

- Capture the Demo Control Center at 1366 x 768.
- Capture Ask RepAI by voice with a grounded answer visible.
- Capture Staff Support queue with mock Work IQ context and audit log.
- Capture Hybrid Copilot + RepAI engine architecture.
- Capture Submission Pack showing simulated vs production-ready clarity.
