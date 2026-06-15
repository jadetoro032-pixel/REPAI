# RepAI Submission Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe RepAI as a reliable enterprise knowledge assistant with a Teams call prototype, then produce one clean submission zip.

**Architecture:** Keep the existing React demo console, Copilot package scaffolds, Teams bot manifest, and docs. Update public-facing copy so the dependable text/knowledge/staff-support flow is the primary demo and the Teams call work is clearly labeled as a prototype.

**Tech Stack:** React, TypeScript, Vite, Vitest, Microsoft Teams app manifests, Copilot declarative agent manifests.

---

### Task 1: Reframe App And Package Copy

**Files:**
- Modify: `C:\Users\adeto\Documents\REPAI\src\ui\App.tsx`
- Modify: `C:\Users\adeto\Documents\REPAI\appPackageCombined\manifest.json`
- Modify: `C:\Users\adeto\Documents\REPAI\appPackageTeamsCall\manifest.json`
- Modify: `C:\Users\adeto\Documents\REPAI\tests\combinedPackage.test.ts`
- Modify: `C:\Users\adeto\Documents\REPAI\tests\teamsCallMvp.test.ts`

- [ ] **Step 1: Update judge-facing copy**

Change the main demo language from call-first to enterprise-knowledge-first. Keep the call section present, but label it as a prototype.

- [ ] **Step 2: Update app package descriptions**

Make the combined package describe RepAI as a governed knowledge assistant and staff-support agent with an optional Teams calling component.

- [ ] **Step 3: Update tests for the new promise**

Assert that the package copy contains `enterprise knowledge assistant` and `Teams call prototype`.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: all Vitest tests pass.

### Task 2: Add Today Submission Guide

**Files:**
- Create: `C:\Users\adeto\Documents\REPAI\docs\today-submission-guide.md`
- Modify: `C:\Users\adeto\Documents\REPAI\README.md`

- [ ] **Step 1: Write the guide**

Document the exact demo path, what to claim, what not to claim, and what files to upload.

- [ ] **Step 2: Link the guide from README**

Add the guide to the submission assets section so it is visible.

- [ ] **Step 3: Run build checks**

Run: `npm run build` and `npm run build:web`.

Expected: TypeScript and Vite complete successfully.

### Task 3: Produce Clean Submission Zip

**Files:**
- Create: `C:\Users\adeto\Documents\REPAI\RepAI-Enterprise-Knowledge-Submission.zip`

- [ ] **Step 1: Remove old confusing zip artifacts if requested**

Only delete old zip files when the user explicitly asks. Do not delete source folders.

- [ ] **Step 2: Package the combined Teams/Copilot app**

Zip `appPackageCombined\manifest.json`, `appPackageCombined\declarativeAgent.json`, `appPackageCombined\repai-call-plugin.json`, `appPackageCombined\repai-call-openapi.json`, `appPackageCombined\color.png`, and `appPackageCombined\outline.png`.

- [ ] **Step 3: Verify zip contents**

Run: `Expand-Archive` to a temporary folder or inspect with `System.IO.Compression.ZipFile`.

Expected: manifest and icons exist at the zip root.
