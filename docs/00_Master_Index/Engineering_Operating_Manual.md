# Engineering Operating Manual

**Version:** 1.0  
**Status:** Accepted baseline  
**Last updated:** 2026-07-27

## 1. Purpose

This manual defines how ExamPilot turns ideas into a traceable product. Code is not the only output of a meaningful change. Every significant change must leave enough evidence for a future teammate to understand the problem, the decision, the implementation, and the result.

## 2. Required lifecycle

```text
Idea
  ↓
Problem statement
  ↓
Decision or hypothesis
  ↓
Requirement
  ↓
Engineering specification
  ↓
Implementation
  ↓
Test evidence
  ↓
Release
  ↓
Product and operational metrics
  ↓
Lesson learned
  ↓
Updated decision
```

No stage may be silently skipped for a change that affects learning correctness, exam integrity, user data, money, AI behaviour, or platform reliability.

## 3. Required pre-implementation questions

Before building a feature, answer:

1. Which student, educator, reviewer, or operator problem does it solve?
2. Which business or learning objective does it support?
3. Which requirement IDs does it satisfy?
4. Which subsystem owns the behaviour?
5. Which existing documents, APIs, data entities, prompts, tests, and runbooks are affected?
6. What is explicitly out of scope?
7. What evidence will show that the change worked?

## 4. Traceability identifiers

Use stable identifiers in documents and implementation notes:

| Prefix | Meaning | Example |
|---|---|---|
| VSN | Vision principle | VSN-001 |
| GOAL | Business or learning goal | GOAL-001 |
| FR | Functional requirement | FR-EXAM-001 |
| NFR | Non-functional requirement | NFR-SEC-001 |
| ADR | Architecture decision record | ADR-001 |
| EDS | Engineering design specification | EDS-001 |
| API | API contract item | API-EXAM-001 |
| DATA | Data invariant | DATA-001 |
| AI | AI policy or requirement | AI-004 |
| TEST | Test or evaluation case | TEST-CBT-001 |
| EXP | Experiment | EXP-001 |
| OPS | Operational procedure | OPS-001 |

Identifiers should not be reused after a requirement is retired. A superseded item should link to the item that replaces it.

## 5. Change rules

### Small changes

For copy, styling, or an isolated defect with no behaviour or data impact:

- record the reason in the change description;
- update tests if the observable behaviour changes;
- update documentation if a user or operator contract changes.

### Significant changes

For changes involving authentication, payments, examination state, question correctness, AI outputs, personal data, or external integrations:

- create or update an ADR;
- update the relevant requirement and EDS;
- define acceptance criteria before implementation;
- record test and rollout evidence;
- add or update a runbook if failure handling changes.

## 6. Content and AI rule

AI output is an accelerator and a candidate explanation, not proof of academic correctness. Any content that can directly affect a student's answer key must pass the approved content workflow. The system must distinguish:

- AI-generated draft;
- human-reviewed content;
- approved published content;
- retired or disputed content.

## 7. Document metadata

Every normative document must contain:

- version;
- status: Draft, In Review, Accepted, Superseded, or Archived;
- owner;
- last updated date;
- related requirements and decisions;
- a short changelog.

## 8. Definition of ready

A feature is ready for implementation when its owner can state:

- the user outcome;
- the constraints and non-goals;
- the state transitions;
- the data needed;
- the failure behaviour;
- the acceptance criteria;
- the observability needed after release.

## 9. Definition of done

A feature is not done until:

- the intended user workflow works end to end;
- invalid and failure states are handled;
- data and permission boundaries are tested;
- documentation and traceability links are updated;
- metrics or logs needed to evaluate the outcome exist;
- rollout and rollback steps are known.