# RepAI Today Submission Guide

## Demo Positioning

RepAI is a Teams-ready enterprise knowledge assistant. It helps staff retrieve approved knowledge, ask workflow questions, get recommended next steps, and escalate risky decisions instead of pretending to be the human owner.

The Teams call work should be described as a prototype path, not the main proof for the deadline.

## What To Show First

1. Open the React demo console.
2. Start at Demo Control Center.
3. Ask RepAI a question in the text box or browser voice panel.
4. Show the grounded answer and citation.
5. Show the Staff Support queue.
6. Click a queue item and show the Work IQ-style context, action draft, risk classification, and audit log.
7. Show the architecture section: Copilot work brain plus RepAI role brain.
8. Mention the Teams call prototype only after the core assistant is understood.

## Safe Claims

- RepAI can answer staff questions from approved demo knowledge.
- RepAI can recommend workflow prompts and next steps.
- RepAI can refuse or escalate risky commitments.
- RepAI has a Teams/Copilot package scaffold.
- RepAI has a Teams call prototype path under active testing.
- RepAI is designed to connect later to Work IQ, Fabric IQ, Graph connectors, Azure AI Foundry, and Azure Speech.

## Claims To Avoid

- Do not claim production Copilot deployment is complete.
- Do not claim real Work IQ or Fabric IQ tenant data is connected.
- Do not claim RepAI reliably listens and responds inside a live Teams call today.
- Do not claim RepAI can approve pricing, legal, HR, finance, or customer commitments without review.

## Main Judge Questions

Use these during the demo:

- What signoff do we need before launch approval?
- What should we do for enterprise support incidents?
- Can Jeremiah approve a 40 percent enterprise discount today?
- What should RepAI do when a task needs legal or finance approval?
- How is RepAI different from Copilot?

## Upload Artifact

Use:

```text
RepAI-Enterprise-Knowledge-Submission.zip
```

This zip should contain the combined Teams/Copilot package files at the zip root.

## Backup Artifact

If Teams sideloading gives trouble, use the local/web demo and show:

```text
npm run dev
```

Then open:

```text
http://127.0.0.1:5177
```
