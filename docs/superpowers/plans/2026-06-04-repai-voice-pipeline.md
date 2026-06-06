# RepAI Voice Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add voice and text activation to the demo so RepAI can listen, answer, speak with a neutral voice, and show the production voice path.

**Architecture:** Keep browser speech recognition and speech synthesis in the UI layer. Keep reusable voice pipeline labels in `src/ui/voicePipeline.ts` so the demo and docs share the same product model.

**Tech Stack:** React, browser Web Speech APIs, TypeScript, Vitest.

---

## Tasks

- [x] Add tested voice pipeline model.
- [x] Add browser speech recognition handling.
- [x] Add typed `@RepAI` activation.
- [x] Add neutral text-to-speech response.
- [x] Add role-based voice profiles and custom browser voice selection.
- [x] Add consent-gated cloned voice mode UI.
- [x] Add speech status and stop-speaking control.
- [x] Add voice pipeline panel.
- [x] Document demo and production voice paths.
- [ ] Run full verification.
