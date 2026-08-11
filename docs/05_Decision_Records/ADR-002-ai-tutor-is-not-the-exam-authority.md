# ADR-002: AI tutor is a learning assistant, not the examination authority

**Status:** Accepted  
**Date:** 2026-07-27  
**Decision owner:** Founder

## Context

Students need explanations and personalized support. AI is useful for adapting explanations and suggesting next steps, but an unconstrained model can hallucinate, contradict the answer key, or present confidence without evidence.

## Decision

The AI tutor operates after a learning event and receives bounded context: the approved question, stored answer key, relevant explanation, student response, and permitted learning history. It may explain, rephrase, diagnose likely misconceptions, and recommend revision. It must not silently replace the authoritative answer key or change a score.

## Consequences

- AI responses require provenance and model/prompt versioning.
- Cached explanations should be reused when the context is equivalent.
- Fallbacks must prefer verified educational material.
- Tutor quality must be evaluated separately from exam-scoring correctness.
- Product copy must distinguish AI assistance from reviewed content.