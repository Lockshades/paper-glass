# EDS-003: Question Factory and Verification

**Status:** Working baseline  
**Version:** 1.0  
**Last updated:** 2026-07-27  
**Related:** FR-TRUST-001 through FR-TRUST-003, ADR-001

## Objective

Create a repeatable pipeline that increases question coverage without lowering academic quality or losing provenance.

## Question record minimum

Every question needs:

- examination body and syllabus version;
- subject, topic, and subtopic;
- question type;
- stem and answer options;
- authoritative answer;
- explanation;
- difficulty hypothesis;
- cognitive-skill tag where used;
- source or author provenance;
- AI generation metadata, if applicable;
- review history;
- publication state;
- version and retirement information.

## Lifecycle

```text
Idea or gap
  → Draft
  → AI-assisted generation or authoring
  → Automated validation
  → Academic review
  → Consensus or escalation
  → Approved
  → Published
  → Usage evidence
  → Revision, retirement, or reaffirmation
```

## Automated checks

- schema completeness;
- answer option uniqueness;
- exactly one intended answer where the format requires it;
- duplicate and similarity detection;
- syllabus mapping;
- unsafe or unsupported claims;
- explanation/answer consistency;
- rendering validity;
- prohibited leakage of answer keys into student payloads.

Automated checks can reject or flag; they cannot by themselves approve academic correctness.

## Human review

Reviewers should assess:

- correctness;
- alignment with the syllabus;
- clarity and unambiguity;
- distractor quality;
- difficulty fit;
- cultural and language appropriateness;
- explanation quality;
- source and rights provenance.

Disagreement should create an explicit escalation state rather than being hidden by majority vote.

## Publication rules

A question becomes available to the exam engine only when:

1. required fields are complete;
2. automated validation passes;
3. the required human review threshold is met;
4. the publication decision is recorded;
5. the active version is identifiable.

## Feedback loop

Student performance can inform review, but low accuracy alone is not proof that a question is wrong. Investigate time, distractor distribution, ambiguity reports, reviewer notes, and topic context before changing the item.

## Acceptance tests

```text
Given an AI-generated draft
When it has not passed human review
Then it cannot be selected for a student examination
And its state is visible to operators.
```

```text
Given a published question is reported as questionable
When an operator opens the report
Then the operator can see provenance, review history, usage evidence, and the affected version
And can retire or revise it through an auditable action.
```