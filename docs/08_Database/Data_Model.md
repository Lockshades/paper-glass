# Data Model and Invariants

**Version:** 1.0  
**Status:** Conceptual baseline  
**Last updated:** 2026-07-27

## Core entities

### User

Identity, role, consent, locale, and account status. A user may be a student, reviewer, operator, tutor, or administrator subject to authorization policy.

### Exam and Subject

Examination body, exam version, subject, syllabus version, configuration, time limit, question count, and scoring rules.

### Topic

A versioned taxonomy node mapped to a syllabus. Topic mappings must be version-aware so future syllabus changes do not rewrite historical results.

### Question

The logical item with stable identity, lifecycle state, provenance, and current version.

### QuestionVersion

The exact stem, options, answer key, explanation, metadata, and review state used at a point in time.

### ExamSession

Student, configuration, selected question-version IDs, reproducibility metadata, state, timestamps, and timer data.

### Answer

Session, question-version, selected option, save metadata, and final answer status.

### Result

Immutable submission summary and score derived from the session's stored question versions.

### Explanation

Verified or AI-assisted learning content, provenance, version, prompt/model metadata where relevant, and feedback.

### LearningSignal

Derived observation about accuracy, timing, confidence, topic practice, or recommendation eligibility. It must link to source events.

### ReviewEvent

Reviewer, decision, rationale, evidence, and timestamp for a question version or report.

### AuditEvent

Append-only record of sensitive state changes and operator actions.

## Invariants

**DATA-001** — A submitted result never changes because a question is later edited.

**DATA-002** — A student cannot read another student's session, answer, or result.

**DATA-003** — An exam session references concrete question versions, not only logical question IDs.

**DATA-004** — A question cannot be selected by the exam engine unless its version is active and approved.

**DATA-005** — Derived learning signals never overwrite authoritative score data.

**DATA-006** — Sensitive state changes have an audit trail.

**DATA-007** — Deletion and retention policies distinguish account data, exam records, audit records, and aggregated analytics.

## Retention questions

The final policy must be reviewed for applicable Nigerian data-protection and education requirements. Decide separately:

- account deletion;
- practice history retention;
- audit retention;
- content provenance retention;
- AI prompt/response retention;
- anonymized aggregate retention.