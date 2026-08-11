# Product Requirements: Student Learning Loop

**Version:** 1.0  
**Status:** Working baseline  
**Last updated:** 2026-07-27  
**Owner:** Founder

## Decision this document enables

This document enables a small product and engineering team to scope and build the first student-facing release without confusing the long-term platform vision with the first learning loop.

## Users

### Primary user

A student preparing for a timed, multiple-choice examination, likely in the Nigerian secondary or tertiary entrance-examination context.

### Secondary users

- academic reviewer;
- content operator;
- tutor or tutorial-centre administrator.

Secondary workflows support content trust and future distribution, but the first release should optimize for student learning value.

## Core job stories

- When I have limited study time, I want to start a realistic practice session quickly, so I can use my available time well.
- When I finish a session, I want to know what I got wrong and why, so I can improve rather than only see a score.
- When I repeatedly miss a topic, I want the system to identify it and suggest what to study next, so my revision is focused.
- When I lose connection or close the browser, I want my session to recover safely, so my effort is not lost.
- When I see an explanation, I want to know whether it is based on approved academic content or AI assistance, so I can judge how to use it.

## MVP scope

### In scope

1. student onboarding and exam/subject selection;
2. practice-session creation from an approved question pool;
3. timed CBT interface;
4. answer selection, navigation, flagging, and auto-save;
5. submission and deterministic scoring;
6. result summary by subject/topic;
7. explanation for incorrect answers;
8. weak-topic identification;
9. basic next-step study recommendations;
10. content report mechanism;
11. basic operator workflow for approved questions.

### Out of scope for MVP

- live AI-generated examination papers;
- public contributor marketplace;
- real-money contributor withdrawals;
- institution billing and cohort administration;
- essay, audio, programming, or drawing questions;
- proctoring claims or biometric identity verification;
- fully adaptive testing;
- native mobile apps;
- multi-country examination support;
- a broad social network.

## Functional requirements

### Student account and setup

**FR-STUDENT-001** — A student can select an examination, subject, and practice mode from the currently supported catalog.

**FR-STUDENT-002** — The system must show the scope, question count, time limit, and scoring rules before a session starts.

**FR-STUDENT-003** — The product must not imply that a practice result is an official examination result.

### Practice session

**FR-EXAM-001** — Starting a session creates a unique session with a stored question set and reproducible selection metadata.

**FR-EXAM-002** — The student can move between questions without losing selected answers.

**FR-EXAM-003** — The student can flag a question for review.

**FR-EXAM-004** — The session auto-saves on answer or navigation changes and at a periodic interval.

**FR-EXAM-005** — A recoverable session can be resumed with its answers and remaining time restored.

**FR-EXAM-006** — Submission prevents further answer changes and starts scoring exactly once.

### Results and learning

**FR-RESULT-001** — The result includes score, accuracy, time use, unanswered count, and topic breakdown where metadata exists.

**FR-RESULT-002** — The student can inspect the correct answer, selected answer, provenance state, and explanation for a reviewed question.

**FR-RESULT-003** — The system identifies weak topics using an explainable rule that is visible to the student.

**FR-RESULT-004** — The system recommends a next action linked to a topic or question set.

### Trust and feedback

**FR-TRUST-001** — A student can report a question or explanation as questionable.

**FR-TRUST-002** — Reports enter an operator queue with enough context to investigate without exposing unnecessary personal data.

**FR-TRUST-003** — Student-facing AI explanations are labeled as AI-assisted when applicable.

## Non-functional requirements

**NFR-EXAM-001** — A previously loaded question should remain usable during a short network interruption.

**NFR-EXAM-002** — A normal navigation action should feel immediate; the interface should not wait for a full page reload.

**NFR-DATA-001** — A submitted session and its score must be immutable except through an auditable correction workflow.

**NFR-SEC-001** — Students may access only their own sessions and results.

**NFR-SEC-002** — Operator and reviewer capabilities must be separated from student capabilities.

**NFR-AI-001** — AI output must have a bounded context, explicit fallback behaviour, and observable latency/cost.

**NFR-OPS-001** — Content, scoring, and AI failures must produce actionable logs without exposing answer keys or personal data unnecessarily.

## Acceptance criteria

### Start and complete

```text
Given a student has selected a supported subject
When the student starts a practice session
Then the system creates a session from approved active questions
And shows the configured time limit and question count
And does not generate an unreviewed answer key during the session.
```

```text
Given a session is running
When the student selects an answer and navigates away
Then the answer is persisted
And returning to the question shows the selected answer.
```

```text
Given a student submits a session
When scoring completes
Then the result contains a deterministic score
And the session cannot be submitted a second time
And the student can review learning feedback.
```

### Recovery

```text
Given a session has saved answers
When the browser is closed and the student returns
Then the student can resume the session
And the stored answers and remaining time are restored
And the system does not create a duplicate session silently.
```

### AI explanation

```text
Given a student requests an explanation for a reviewed question
When a verified explanation exists
Then the system prefers the verified explanation
And may use AI to adapt the explanation to the student's context
And labels any AI-assisted content.
```

## Measurement plan

First-release metrics:

- onboarding completion;
- time from landing to first question;
- first-session completion;
- resume success rate;
- result-page engagement;
- explanation usefulness rating;
- repeat practice within seven days;
- reported-content rate and resolution time;
- AI cache-hit rate and cost per explanation.

## Open questions

- Which exam and subject launch first?
- What scoring and negative-marking rules apply?
- What is the minimum approved question count for a useful paper?
- Which content source and reviewer standard establish correctness?
- Is authentication required before a first trial?