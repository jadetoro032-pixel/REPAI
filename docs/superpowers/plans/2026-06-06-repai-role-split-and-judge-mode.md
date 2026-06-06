# RepAI Role Split And Judge Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split RepAI into clear Meeting Delegate and Staff Support tools, add meeting/call capability clarity, document judge testing paths, and package a Staff Support Lite Copilot agent.

**Architecture:** Keep one RepAI brand with two role tools surfaced in the React demo and docs. Keep RepAI Lite as the working Copilot shell, add Staff Support Lite as a separate installable agent, and present Work IQ/Fabric IQ as tenant-connected production integrations rather than built-in Lite capabilities.

**Tech Stack:** React + Vite + TypeScript, Vitest, Microsoft 365 declarative agent app packages, Markdown docs.

---

### Task 1: Tests For Role Split And Staff Support Package

**Files:**
- Modify: `tests/submissionAssets.test.ts`
- Create: `tests/staffSupportLitePackage.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that assert the docs mention Meeting Delegate and Staff Support as separate tools, and that `appPackageStaffSupportLite` contains a Teams manifest and declarative agent manifest.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test`
Expected: FAIL because the new Staff Support Lite package and role split docs do not exist yet.

### Task 2: UI Role Split And Meeting Capability Sections

**Files:**
- Modify: `src/ui/App.tsx`
- Modify: `src/ui/styles.css`

- [ ] **Step 1: Add visible sections**

Add a role split panel, a meeting capability matrix, a Teams call architecture panel, and a Judge Test Mode panel.

- [ ] **Step 2: Preserve existing flows**

Keep the existing voice, knowledge folder, Staff Support queue, and architecture panels working.

### Task 3: Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/hackathon-demo-script.md`
- Create: `docs/work-iq-fabric-iq-readiness.md`

- [ ] **Step 1: Document live versus production**

Explain RepAI Lite works live, Meeting Delegate and Staff Support are separate role tools, Work IQ APIs become generally available June 16, 2026, and Fabric IQ needs tenant Fabric/Power BI permissions.

### Task 4: Staff Support Lite Package

**Files:**
- Create: `appPackageStaffSupportLite/manifest.json`
- Create: `appPackageStaffSupportLite/declarativeAgent.json`
- Copy: `appPackageStaffSupportLite/color.png`
- Copy: `appPackageStaffSupportLite/outline.png`

- [ ] **Step 1: Create instructions-only Staff Support agent**

Use a new manifest ID, a unique declarative agent ID, no fake SharePoint/Graph capabilities, and Staff Support-specific risk-gating instructions.

- [ ] **Step 2: Zip package**

Create `RepAI-Staff-Support-Lite-new-app.zip`.

### Task 5: Verification

**Files:**
- No production files.

- [ ] **Step 1: Run tests and builds**

Run: `npm test`, `npm run build`, `npm run build:web`, and `npm audit --audit-level=moderate`.

- [ ] **Step 2: Render the app**

Open the production build in Browser/IAB or a static server fallback and verify the new panels appear without console errors.
