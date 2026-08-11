# Operational Playbooks

**Version:** 1.0  
**Status:** Initial baseline  
**Last updated:** 2026-07-27

## OPS-001: Question reported as incorrect

1. Acknowledge the report without implying the student is wrong.
2. Freeze or flag the affected question version if severity warrants it.
3. Inspect source, answer key, explanation, review events, and usage evidence.
4. Compare against the syllabus and authoritative references.
5. Decide: reaffirm, revise, retire, or escalate.
6. Record the decision and affected sessions.
7. Notify impacted students if a published answer was materially wrong.
8. Add the case to the AI and content regression set.

## OPS-002: AI provider unavailable

1. Keep exam start, answer saving, scoring, and result retrieval available.
2. Serve cached or verified explanations where possible.
3. Queue non-urgent explanation generation.
4. Show a transparent delayed-help state.
5. Monitor error rate, latency, queue age, and cost.
6. Record the incident and update the provider fallback decision if needed.

## OPS-003: Payment or entitlement mismatch

1. Do not delete practice history.
2. Check the entitlement event and audit trail.
3. Prefer an idempotent reconciliation process.
4. Grant temporary access only under a defined support policy.
5. Record the correction and notify the student.

## OPS-004: Suspected data exposure

1. Restrict the affected capability if safe to do so.
2. Preserve relevant audit evidence.
3. Identify data scope and affected users.
4. Escalate to the responsible security and legal contacts.
5. Follow applicable notification obligations.
6. Do not speculate publicly before facts are established.

## OPS-005: Syllabus change

1. Capture the new official source and effective date.
2. Create a new syllabus version; do not rewrite history.
3. map affected topics, questions, exams, prompts, tests, and study plans.
4. Review content coverage and retire incompatible items.
5. Publish a migration plan and update the Blueprint.