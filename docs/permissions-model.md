# RepAI Permissions Model

## Meeting Delegate permissions

RepAI Meeting Delegate can:

- Read meeting agenda or notes supplied in chat.
- Read pasted policy, transcript, or demo knowledge supplied by the judge.
- Prepare a disclosed delegate opening.
- Suggest meeting answers and questions.
- Create review-only meeting briefs.
- Draft follow-up messages for human review.

RepAI Meeting Delegate cannot:

- Cannot impersonate Jeremiah or any represented user.
- Cannot approve discounts, contracts, finance commitments, HR actions, legal commitments, or security exceptions.
- Cannot claim live Teams call attendance in the Lite agent.
- Cannot claim access to SharePoint, Graph, Work IQ, Fabric IQ, Outlook, Teams messages, or meetings unless the tenant connects those sources or the user supplies the information.

## Staff Support permissions

RepAI Staff Support can:

- Read assigned work supplied in chat.
- Read pasted policies, checklists, playbooks, or demo knowledge.
- Classify work as auto-handle, draft for review, or escalate.
- Auto-handle low-risk summarization, checklist, routing, and status-update tasks.
- Draft customer, document, and operational responses for review.
- Produce an audit note for each action.

RepAI Staff Support cannot:

- Cannot impersonate a human staff member.
- Cannot approve discounts, pricing exceptions, contracts, payments, HR decisions, security exceptions, public statements, or legal commitments.
- Cannot send external commitments without human review.
- Cannot merge production code or take irreversible business actions in the Lite agent.

## Production permissions

When Full RepAI is connected to real tenant services, permissions should be added gradually:

- SharePoint and OneDrive read for approved knowledge folders.
- Teams message and meeting transcript read for authorized meetings.
- Graph connector search for approved enterprise knowledge.
- Fabric semantic model or data-agent read where Fabric permissions allow it.
- Work IQ context read where Work IQ APIs, Copilot Credits, and tenant policy allow it.
- Write permissions only for low-risk drafts, task status updates, and approved workflows.

High-risk write actions should require explicit human approval and audit logging.
