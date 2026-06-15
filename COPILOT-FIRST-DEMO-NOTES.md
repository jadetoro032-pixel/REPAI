# RepAI Copilot-First Demo Notes

Use `UPLOAD-THIS-IN-COPILOT.zip` for the Microsoft 365 Copilot agent upload path.

Use `UPLOAD-THIS-IN-TEAMS.zip` only for Teams custom app upload. That package is intentionally Teams-only and does not include the Copilot declarative agent.

## Demo Positioning

RepAI is a Microsoft 365 Copilot enterprise delegate agent. The primary demo runs in Copilot using synthetic enterprise context, safe delegation rules, workflow recommendations, and a backend action for the Teams-call extension path.

The Teams calling path is presented as a prototype extension. The backend and audio-opening endpoint are deployed, but live call joining depends on tenant-level Microsoft Graph Cloud Communications permissions.

## Suggested Demo Flow

1. Open RepAI from Microsoft 365 Copilot.
2. Run: `Use demo connection with synthetic Outlook, Teams, Gmail, calendar, docs, and hackathon-rule data. Tell me what meeting you found and what you loaded.`
3. Run: `Prepare for my meeting about the hackathon rules, the demo, and why RepAI should win.`
4. Run: `Start Teams call now. Use the RepAI call action to ask the backend to join the configured Teams meeting as Jeremiah's disclosed delegate. Report the real action result.`
5. Run: `Send Jeremiah a brief explaining what was discussed, why RepAI should win, and what follow-up is needed.`

## Honest Explanation If Asked

The reliable judged surface is Microsoft 365 Copilot. Teams call joining is a real backend extension path, but it requires tenant Graph calling permissions and Azure Bot calling setup. RepAI reports the real backend result instead of pretending the call succeeded.
