# AI System Strategy

**Version:** 1.0  
**Status:** Working baseline  
**Last updated:** 2026-07-27

## AI roles

### Allowed

- draft question and distractor candidates;
- suggest topic mappings;
- draft explanations for human review;
- adapt approved explanations;
- classify likely misconceptions;
- recommend related practice;
- summarize progress;
- assist operators with search and triage.

### Restricted

- selecting the authoritative answer key;
- publishing content without the required review;
- changing a submitted score;
- making high-stakes claims without evidence;
- using a student's private history beyond the stated learning purpose.

## Prompt architecture

Prompts should be versioned assets with:

- purpose;
- input schema;
- output schema;
- model route;
- token budget;
- safety constraints;
- evaluation set;
- owner and review date.

Prompt text should not be scattered through UI components or untracked scripts.

## Model routing

Use a model route based on task requirements:

- deterministic validation and formatting where possible;
- low-cost model for simple adaptation;
- stronger model for difficult synthesis only when evaluation justifies it;
- human review for correctness-critical content.

The chosen model is an implementation detail. The product contract must remain stable if the provider or model changes.

## Evaluation gates

Before a prompt or model route is promoted, evaluate:

- answer alignment;
- factual correctness;
- hallucination rate;
- clarity;
- age and context appropriateness;
- consistency across equivalent inputs;
- latency;
- cost.

Maintain a fixed regression set containing representative subjects, difficult distractors, ambiguous reports, and known failure cases.

## Caching

Cache responses only when the context identity is stable and the response remains valid. Cache keys should include the relevant content version, prompt version, model route, and language/context settings. Never serve a stale explanation after the authoritative question version changes.

## Human escalation

Escalate when:

- the model contradicts the answer key;
- confidence is low;
- the question is ambiguous;
- a student reports harmful or misleading content;
- the answer depends on a current policy or syllabus version;
- the response would influence a high-stakes decision.

## AI cost model

Measure cost from actual usage:

```text
AI cost per active student
= requests per active student
× uncached request rate
× average cost per request
```

Add storage, evaluation, moderation, and operational costs before using the number for pricing decisions.