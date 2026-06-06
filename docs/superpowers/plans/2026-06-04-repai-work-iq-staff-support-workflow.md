# RepAI Work IQ Staff Support Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mock Work IQ adapter and Staff Support workflow so RepAI can demonstrate assigned work intake before production Work IQ APIs are available.

**Architecture:** Keep Work IQ access behind an adapter interface. The Staff Support workflow receives assigned work, asks the adapter for context, classifies risk, produces an action draft, and records an audit log.

**Tech Stack:** TypeScript, Vitest, React/Vite.

---

## File Structure

- `src/integrations/workIqAdapter.ts`: mock Work IQ adapter contract and fixture context.
- `src/domain/staffSupportWorkflow.ts`: Staff Support work processor.
- `tests/staffSupportWorkflow.test.ts`: adapter/workflow tests.
- `src/ui/App.tsx`: role selector and workflow display.
- `src/ui/styles.css`: workflow presentation styles.
- `README.md`: Work IQ fallback strategy.

## Tasks

- [x] Add failing workflow tests.
- [x] Implement mock Work IQ adapter.
- [x] Implement Staff Support processor.
- [x] Add role selector and workflow output to UI.
- [x] Document mock-now, real-Work-IQ-later path.
- [x] Run full verification.
