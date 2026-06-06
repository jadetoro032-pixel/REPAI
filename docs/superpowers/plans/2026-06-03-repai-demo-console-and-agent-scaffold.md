# RepAI Demo Console And Agent Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the visual hackathon demo console, voice-first Ask RepAI interaction, fake knowledge-folder upload/search, Work IQ and Fabric IQ grounding story, architecture diagram, and Microsoft 365 declarative agent scaffold.

**Architecture:** The React/Vite UI consumes the existing deterministic RepAI domain engine. UI-only helpers live in `src/ui`, Teams card formatting stays in `src/integrations`, and Microsoft 365 app package files live in `appPackage`.

**Tech Stack:** React, Vite, TypeScript, Vitest, Microsoft 365 app manifest, Copilot declarative agent schema v1.6.

---

## File Structure

- `src/ui/App.tsx`: visual demo console.
- `src/ui/styles.css`: responsive enterprise UI styling.
- `src/ui/demoModel.ts`: fake knowledge-folder upload/search helpers.
- `src/types/lucide-react.d.ts`: local icon typing shim.
- `appPackage/manifest.json`: Microsoft 365 app package manifest.
- `appPackage/declarativeAgent.json`: Copilot declarative agent scaffold.
- `appPackage/README.md`: sideloading preparation notes.
- `tests/demoModel.test.ts`: knowledge-folder model tests.
- `tests/m365Scaffold.test.ts`: app-package scaffold tests.

## Tasks

### Task 1: Voice-First Demo UI

- [x] Build a React/Vite app shell.
- [x] Add a central Ask RepAI by voice panel.
- [x] Use browser speech recognition when available.
- [x] Add demo voice prompt buttons for fallback environments.
- [x] Show grounded/cited answers and review-needed escalations.

### Task 2: Knowledge, Work IQ, And Fabric IQ

- [x] Add fake knowledge-folder upload/search behavior.
- [x] Add Work IQ context panel.
- [x] Add Fabric IQ semantic/data signals panel.
- [x] Test fake upload/search helpers.

### Task 3: Architecture And Post-Meeting Delivery

- [x] Add Copilot + Teams architecture diagram.
- [x] Show post-meeting brief.
- [x] Show Teams Adaptive Card preview.

### Task 4: Microsoft 365 Agent Scaffold

- [x] Add Microsoft 365 app manifest.
- [x] Add Copilot declarative agent manifest.
- [x] Include OneDrive/SharePoint, Graph connectors, Teams messages, Meetings, and People capabilities.
- [x] Test the scaffold JSON and Copilot agent link.

### Task 5: Verification

- [x] Run tests.
- [x] Run TypeScript build.
- [x] Run npm audit.
- [x] Verify the rendered UI in a browser.
