# EDS-002: AI Tutor

**Status:** Accepted baseline  
**Version:** 1.0  
**Last updated:** 2026-07-27  
**Related:** FR-RESULT-002, FR-RESULT-004, NFR-AI-001, ADR-002

## Objective

Help a student understand a learning event and choose a useful next action without turning an unverified model response into the examination authority.

## Responsibilities

- explain an incorrect or correct answer;
- rephrase an explanation at a suitable level;
- identify a likely misconception;
- recommend related practice;
- suggest prerequisite topics;
- produce a short revision summary;
- collect usefulness feedback.

## Inputs

- student ID or anonymous session context permitted by policy;
- subject and topic;
- approved question text;
- selected answer;
- authoritative answer key;
- verified explanation if available;
- limited performance context;
- language preference, if supported.

## Output contract

An AI tutor response should contain structured fields:

- explanation;
- why the selected answer is right or wrong;
- concept or topic;
- likely misconception, if confidence is sufficient;
- recommended next action;
- confidence and provenance metadata;
- safety or uncertainty note where needed.

The client should not depend on free-form prose alone.

## Retrieval and generation order

```text
Tutor request
  → Find equivalent cached response
  → Retrieve verified explanation
  → Assemble bounded context
  → Call approved model route if needed
  → Validate response shape and safety
  → Store versioned response
  → Return with provenance
```

If the model is unavailable, return the verified explanation when one exists. If neither exists, give a transparent limited response and invite the student to report the item; do not invent certainty.

## Cost controls

- cache equivalent explanations;
- limit context to the learning event;
- use the least expensive model that meets evaluation thresholds;
- cap retries and calls per request;
- record tokens, latency, cache status, and model version;
- never regenerate an identical response without a reason.

## Safety and trust rules

- never change the stored score;
- never claim official examination authority;
- identify AI-assisted content;
- do not expose another student's data;
- avoid unsupported medical, legal, or high-risk advice outside the learning context;
- escalate questionable answer keys to content review.

## Evaluation

Evaluate factual correctness, alignment with the approved key, clarity, age appropriateness, actionability, uncertainty calibration, latency, and cost. Human review samples should include wrong answers, ambiguous items, image-based items, and low-confidence cases.

## Acceptance tests

```text
Given a verified explanation exists
When a student requests help
Then the system uses or adapts that explanation before asking a model to invent a new one
And the response identifies its AI-assisted status when applicable.
```

```text
Given the model contradicts the stored answer key
When response validation detects the contradiction
Then the response is not presented as authoritative
And the item is eligible for review.
```

## Metrics

Cache hit rate, response latency, model error rate, student usefulness rating, follow-up rate, cost per request, fallback rate, and contradiction/escalation rate.