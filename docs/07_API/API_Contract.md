# API Contract: First Student Slice

**Version:** 1.0  
**Status:** Conceptual contract  
**Last updated:** 2026-07-27

This document describes the resource boundaries for implementation. Exact schemas should be generated from the authoritative API specification once the first application build begins.

## Identity and access

- `GET /api/me` — current user and roles
- `GET /api/catalog` — supported exams, subjects, and practice configurations

## Exam sessions

- `POST /api/exam-sessions` — create a session from an approved configuration
- `GET /api/exam-sessions/:id` — retrieve resumable session state
- `PUT /api/exam-sessions/:id/answers/:questionId` — idempotently save an answer
- `POST /api/exam-sessions/:id/events` — record navigation or resilience events
- `POST /api/exam-sessions/:id/submit` — submit exactly once
- `GET /api/exam-sessions/:id/result` — retrieve the immutable result

## Learning

- `GET /api/results/:id/questions/:questionId/explanation` — get verified or AI-assisted explanation
- `POST /api/results/:id/questions/:questionId/feedback` — rate or report learning content
- `GET /api/study-plan` — retrieve current recommended next actions
- `GET /api/topics/:topicId/progress` — retrieve topic-level progress

## Content operations

These routes require reviewer/operator roles:

- `GET /api/content/review-queue`
- `POST /api/content/questions`
- `POST /api/content/questions/:id/review`
- `POST /api/content/questions/:id/publish`
- `POST /api/content/questions/:id/retire`
- `GET /api/content/reports`

## API invariants

- student resources are authorization-scoped;
- submission and answer writes are idempotent;
- answer keys are not exposed before submission;
- result records identify the question and answer-key versions used;
- AI endpoints return provenance and model/prompt metadata suitable for observability;
- errors are safe for display and detailed enough for server-side diagnosis.