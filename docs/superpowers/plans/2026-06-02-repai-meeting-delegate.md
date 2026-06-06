# RepAI Meeting Delegate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic local prototype of RepAI, a disclosed meeting delegate that answers from approved knowledge and generates post-meeting briefs.

**Architecture:** The first version is a TypeScript library plus CLI demo. Core behavior lives in small pure functions so it can later be wired into Microsoft 365 Copilot, Teams, Microsoft Graph, and connector-backed knowledge.

**Tech Stack:** Node.js, TypeScript, Vitest, tsx.

---

## File Structure

- `package.json`: scripts and dependencies.
- `tsconfig.json`: TypeScript compiler settings.
- `src/domain/types.ts`: shared domain interfaces.
- `src/domain/delegate.ts`: disclosure, grounded answering, refusal, brief, and follow-up logic.
- `src/demo/sampleData.ts`: hackathon demo fixture data.
- `src/demo/runDemo.ts`: CLI demo script.
- `tests/delegate.test.ts`: behavior tests.
- `README.md`: project pitch, run commands, and Microsoft 365 integration path.

## Tasks

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

- [x] Create Node/TypeScript scripts.
- [x] Install dependencies.
- [x] Verify the test runner starts.

### Task 2: Delegate Behaviors

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/delegate.ts`
- Test: `tests/delegate.test.ts`

- [x] Write failing tests for delegate disclosure.
- [x] Implement disclosure.
- [x] Write failing tests for grounded answers with citations.
- [x] Implement knowledge matching and answer composition.
- [x] Write failing tests for unsupported questions.
- [x] Implement refusal/escalation.
- [x] Write failing tests for meeting brief generation.
- [x] Implement summary, decisions, action items, risks, mentions, and follow-up draft.

### Task 3: Demo Data And CLI

**Files:**
- Create: `src/demo/sampleData.ts`
- Create: `src/demo/runDemo.ts`

- [x] Add realistic hackathon sample meeting data.
- [x] Add CLI output for opening statement, supported answer, unsupported answer, and meeting brief.
- [x] Run the demo and inspect output.

### Task 4: Documentation

**Files:**
- Create: `README.md`

- [x] Document project purpose and trust stance.
- [x] Document local run commands.
- [x] Document the Microsoft 365 integration roadmap.
- [x] Run final verification.
