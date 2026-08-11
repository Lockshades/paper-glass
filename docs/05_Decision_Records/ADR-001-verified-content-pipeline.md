# ADR-001: Use a verified content pipeline instead of live AI-generated exams

**Status:** Accepted  
**Date:** 2026-07-27  
**Decision owner:** Founder

## Context

The product needs a large, varied set of exam questions. Live AI generation appears flexible, but an answer-key error during a timed practice exam can directly damage student trust and learning. Repeated generation also makes quality, reproducibility, cost, and dispute resolution harder.

## Decision

AI may generate candidate questions and explanations inside an internal content factory. Questions must pass defined human review and publication gates before they can be selected for a student examination. The examination engine selects from approved, active content and stores the selection metadata needed for reproducibility.

## Alternatives considered

1. Generate every exam live with AI.
2. Use only manually authored content.
3. Use AI-assisted drafts followed by human verification and controlled publication.

## Why this decision

The third option balances production speed with academic trust. It allows AI to reduce authoring effort without making an unreviewed model the final authority.

## Consequences

### Positive

- stronger answer-key trust;
- reproducible practice papers;
- measurable question quality;
- reusable approved content;
- lower repeated generation cost;
- clear dispute and retirement workflow.

### Negative

- slower initial content expansion;
- reviewer and operator work is required;
- content metadata and lifecycle are more complex;
- coverage gaps may exist while the library is small.

## Reconsideration criteria

Revisit only if evaluation demonstrates that a different workflow can meet the same correctness, auditability, reproducibility, and student-trust thresholds. A lower cost alone is not sufficient.