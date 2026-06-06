# RepAI Meeting Delegate Design

## Product Direction

RepAI is a consent-based Microsoft 365 meeting delegate for Jeremiah. It does not impersonate Jeremiah. It explicitly identifies itself as attending on his behalf, answers only from approved knowledge, captures decisions and action items, and sends Jeremiah a post-meeting brief.

## Demo Scenario

Jeremiah is double-booked for a product sync. RepAI attends as his disclosed delegate, explains its scope to participants, answers one question from the approved wiki/folder, refuses one question it cannot ground, and produces a concise meeting brief with follow-up suggestions.

## User Trust Model

- RepAI always opens with a disclosure that it is Jeremiah's delegate.
- RepAI never claims to be Jeremiah.
- RepAI cites approved knowledge sources when answering.
- RepAI refuses or escalates when knowledge is missing, ambiguous, or outside scope.
- RepAI marks items needing Jeremiah's approval instead of committing him without consent.

## Core Capabilities

- Prepare an opening delegate statement for a meeting.
- Search pre-approved knowledge documents.
- Produce grounded answers with citations.
- Decline unsupported answers with a review-needed response.
- Extract decisions, action items, risks, and direct mentions from transcript-like meeting notes.
- Draft a post-meeting brief and follow-up message for Jeremiah.

## Microsoft 365 Fit

The hackathon-facing story maps to Microsoft 365 Copilot extensibility:

- Copilot agent: user-facing delegate experience in Microsoft 365.
- Teams meeting context: meeting transcript and post-meeting insights.
- Microsoft Graph / Meeting AI Insights: source for summaries, action items, and mentioned utterances after meetings conclude.
- Copilot connectors / Graph connectors: ingestion path for wiki and knowledge folder content.
- Teams message: delivery path for brief and suggested follow-up.

## MVP Boundary

The first prototype is a deterministic local engine and CLI demo. It proves product behavior without requiring a tenant, sideloading, Copilot license, or Azure resources during early development.

## Non-Goals For First Prototype

- Live joining of Teams calls.
- Real-time speech synthesis.
- Real Microsoft Graph authentication.
- Production connector ingestion.
- Autonomous sending of messages without Jeremiah's review.

## Success Criteria

- The demo clearly says RepAI is attending as Jeremiah's delegate.
- The agent answers a policy/process question from approved knowledge and includes citations.
- The agent refuses an unsupported answer.
- The final brief contains a summary, decisions, action items, risks, mentions of Jeremiah, and a suggested follow-up.
- Tests cover disclosure, grounded answer, refusal, brief extraction, and suggested follow-up.
