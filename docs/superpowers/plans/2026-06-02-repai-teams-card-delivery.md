# RepAI Teams Card Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Teams-ready Adaptive Card payload for delivering RepAI's post-meeting brief to Jeremiah.

**Architecture:** Keep delivery formatting separate from delegate reasoning. The domain layer builds the brief and follow-up draft; the integration layer converts that result into an Adaptive Card and wraps it in a Teams incoming-webhook-style envelope.

**Tech Stack:** TypeScript, Vitest, Adaptive Cards JSON shape.

---

## File Structure

- `src/integrations/teamsAdaptiveCard.ts`: typed Adaptive Card and Teams webhook payload builder.
- `src/demo/exportTeamsCard.ts`: CLI exporter for the Teams card JSON.
- `tests/teamsCard.test.ts`: behavioral tests for review-only card delivery.
- `README.md`: documents `demo:card` and webhook limitations.

## Tasks

### Task 1: Card Payload Tests

- [x] Write failing test for a RepAI meeting brief card.
- [x] Assert the card discloses RepAI attended as Jeremiah's delegate.
- [x] Assert decisions, actions, risks, and follow-up draft appear.
- [x] Assert webhook-incompatible `Action.Submit` is not used.

### Task 2: Card Builder

- [x] Implement typed Adaptive Card payload.
- [x] Implement Teams incoming-webhook-style envelope.
- [x] Keep card actions as `Action.OpenUrl` review/open links.

### Task 3: Demo And Docs

- [x] Add `npm run demo:card`.
- [x] Update README with the Teams card delivery step.
- [x] Run final verification.
