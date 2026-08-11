# Unit Economics and Cost Discipline

**Version:** 1.0  
**Status:** Assumptions to validate  
**Last updated:** 2026-07-27

## Purpose

This document prevents optimistic projections from being mistaken for observed economics. All values should be replaced with measured data as usage begins.

## Cost categories

- web and API compute;
- database and backups;
- object storage and bandwidth;
- AI generation and tutoring;
- content authoring and academic review;
- payments and refunds;
- support and moderation;
- acquisition and partnerships;
- legal, compliance, and operations.

## Core formulas

```text
Gross revenue per paying student
− payment fees
− variable infrastructure
− variable AI usage
− variable content/support cost
= contribution margin
```

```text
LTV is not a guess.
It requires observed retention, realised price, variable cost,
and a stated horizon.
```

## Measurement requirements

Report costs by:

- exam and subject;
- free versus paid cohort;
- AI-assisted versus cached explanation;
- acquisition channel;
- institution versus direct student;
- active, retained, and churned users.

## Guardrails

- do not use live AI generation for the exam path;
- cache repeated tutor requests;
- cap expensive requests per session;
- prefer verified explanations when available;
- keep content review cost visible rather than hiding it inside “AI cost”;
- revisit pricing only after the value loop is measured.

## Open commercial decisions

- initial price and currency;
- free allowance;
- payment provider and refund policy;
- direct-to-student versus institution-led launch;
- contributor compensation model;
- target contribution margin.