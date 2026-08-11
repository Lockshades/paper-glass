# System Architecture

**Version:** 1.0  
**Status:** Working baseline  
**Last updated:** 2026-07-27

## Architectural objective

Provide a trustworthy student learning loop first, while keeping clear boundaries for the future content factory, AI systems, analytics, and contributor ecosystem.

## Logical system

```text
Student Web App
      │
      ▼
Application API ───────────────┐
      │                        │
      ▼                        ▼
Exam Session Service       Learning Service
      │                        │
      ▼                        ▼
Approved Content Store     Results + Topic Analytics
      │                        │
      └──────────────┬─────────┘
                     ▼
              AI Tutor Gateway
                     │
                     ▼
          Model Provider / Cache

Operator and Reviewer Console
      │
      ▼
Content Workflow + Audit Log
```

## Bounded contexts

### Student experience

Owns onboarding, session discovery, question rendering, navigation, submission, and learning feedback.

### Examination engine

Owns paper generation, session state, timer semantics, answer persistence, scoring, and session audit events.

### Content platform

Owns question drafts, metadata, answer keys, explanations, review decisions, publication, retirement, and provenance.

### AI platform

Owns prompt versions, model routing, context assembly, caching, safety filters, evaluation, cost and latency telemetry.

### Learning analytics

Owns derived measures such as accuracy by topic, time patterns, mastery signals, and recommendations. It must not mutate authoritative exam results.

### Operations and governance

Owns permissions, moderation, incident response, audit trails, data retention, and legal/compliance controls.

## Source of truth

| Data | Source of truth |
|---|---|
| Question correctness and publication state | Content platform |
| Active exam session state | Examination engine |
| Submitted score | Immutable scoring record |
| Student learning profile | Derived analytics with provenance |
| AI response | Versioned response/cache record |
| Permission | Authenticated identity and role policy |
| Operational action | Audit log |

## Core state boundaries

### Question lifecycle

```text
Draft → AI-assisted review → Human review → Approved → Published
                                      ↘ Rejected
Published → Flagged → Investigating → Revised or Retired
```

### Exam lifecycle

```text
Created → Initialized → Running → Submitted → Marked → Archived
                         ↘ Paused → Resumed
```

Illegal transitions must be rejected and logged.

## Reliability strategy

The student should not lose work because a non-critical dependency is temporarily unavailable.

- locally preserve unsent answer state where safe;
- retry idempotent save operations;
- keep session state authoritative on the server once accepted;
- never duplicate a submission during retry;
- show the student whether a change is saved;
- degrade AI explanations without degrading scoring or answer persistence.

## Security boundaries

- student data is tenant-scoped to the authenticated student;
- reviewer and operator actions require explicit roles;
- answer keys are never sent to the client before submission;
- AI prompts should contain only the minimum context required;
- audit records are append-only from application workflows;
- sensitive operational data must not be exposed in client errors.

## Scaling direction

### Early stage

A modular API and relational database are sufficient. Keep state transitions explicit and observable.

### Growth stage

Separate read-heavy analytics, AI jobs, and content processing from the synchronous exam path. Add queues for generation, review notifications, and analytics aggregation.

### Large scale

Partition traffic by function, cache immutable approved content, isolate exam-session writes, and use asynchronous processing for analytics and AI. Revisit infrastructure only when measured load and reliability evidence justify it.

## Architecture risks

1. expanding to too many examinations before content quality is proven;
2. mixing derived analytics with authoritative scoring data;
3. allowing AI response shape to become an undocumented API;
4. introducing a marketplace before identity, fraud, and quality controls;
5. treating a prototype's performance as evidence for scale.