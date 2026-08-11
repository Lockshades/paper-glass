# EDS-001: CBT Examination Engine

**Status:** Accepted baseline  
**Version:** 1.0  
**Last updated:** 2026-07-27  
**Related:** FR-EXAM-001 through FR-EXAM-006, NFR-EXAM-001, ADR-001

## Objective

Reproduce the important operational characteristics of a timed multiple-choice examination while preserving answer integrity, recoverability, and a clear learning transition after submission.

## Inputs

- authenticated student;
- examination configuration;
- subject and syllabus version;
- approved active question pool;
- question selection blueprint;
- timer and scoring rules.

## Outputs

- exam session;
- ordered question set;
- answer events and saved state;
- immutable submission;
- score and topic-level result;
- audit events.

## Session creation

```text
Validate student and access
  → Validate exam configuration
  → Load approved question pool
  → Apply blueprint filters
  → Reject duplicates
  → Generate and store reproducibility metadata
  → Create session
  → Initialize timer
  → Enter Running state
```

The synchronous path should not call an AI model.

## State machine

| State | Allowed next states |
|---|---|
| Created | Initialized, Cancelled |
| Initialized | Running, Cancelled |
| Running | Paused, Submitted, Expired |
| Paused | Running, Cancelled |
| Submitted | Marked |
| Expired | Marked |
| Marked | Archived |

Illegal transitions must return a clear error and create an audit event.

## Answer persistence

The client may preserve a pending answer for resilience, but the server is authoritative once it acknowledges the write. Answer updates must be idempotent by session, question, and client event identifier.

Auto-save triggers:

- answer selection;
- navigation event;
- periodic interval;
- explicit resume/visibility recovery.

The exact interval is configurable and must be tested under poor network conditions.

## Timer

The timer is based on server-recognized start and pause/resume timestamps, not only a browser counter. The client display may count down locally, but submission and expiry must be validated server-side.

## Scoring

Scoring reads the stored answer key version attached to each question at session creation. A later content edit must not retroactively change an already submitted result. Corrections require a separate, auditable policy.

## Failure handling

| Failure | Required behaviour |
|---|---|
| Network interruption | Preserve local pending state, show save status, retry safely |
| Duplicate save | Treat as idempotent success |
| Duplicate submission | Return the existing submission/result |
| AI unavailable | Continue exam and results; defer explanation |
| Content unavailable | Do not silently substitute unapproved content |
| Browser close | Offer resume if session remains eligible |

## Acceptance tests

```text
Given an approved question pool
When a session is created
Then every selected question is active and approved
And the stored question order can be reproduced from session metadata.
```

```text
Given a student has selected an answer
When the save request is retried
Then the session contains one effective answer
And no duplicate answer event changes the score.
```

```text
Given a submitted session
When the student requests submission again
Then the original result is returned
And the score is not calculated twice as a new submission.
```

## Observability

Track session creation latency, save success and retry rate, resume success, submission failures, timer drift, question load latency, abandoned sessions, and topic accuracy. Do not log answer keys or unnecessary personal data.