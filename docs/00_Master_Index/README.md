# ExamPilot Founder's Blueprint

**Version:** 1.0  
**Status:** Working baseline  
**Last updated:** 2026-07-27  
**Working name:** ExamPilot  
**Document owner:** Founder

## What this is

This repository is the living source of truth for a web application that helps students prepare for high-stakes examinations through realistic computer-based tests, verified learning content, AI-assisted explanations, and performance analytics.

It is intentionally more than a product requirements document. It records:

- what the company is trying to achieve;
- what the student product must do;
- how educational content is created and trusted;
- how the technical systems fit together;
- which decisions are accepted, rejected, or still open;
- how implementation should be sequenced and measured.

The product is the student-facing application. This Blueprint is the operating memory used to build it responsibly.

## Current product thesis

ExamPilot should not generate an unverified examination live for every student. An internal content factory may use AI to accelerate question creation, but questions should pass human review and a quality gate before entering the approved question bank. The examination engine then assembles realistic, reproducible practice papers from that bank. AI tutoring is used after learning events to explain, diagnose, and recommend; it is not the authority that defines the examination.

## Document map

| Area | Document | Purpose |
|---|---|---|
| Operating rules | [Engineering Operating Manual](Engineering_Operating_Manual.md) | How the Blueprint is maintained and how product work is traced |
| Vision | [Vision](../01_Vision/Vision.md) | Mission, users, problem, principles, and product boundaries |
| Business | [Business Model](../02_Business/Business_Model.md) | Value creation, actors, business hypotheses, and monetisation |
| Requirements | [Product Requirements](../03_Requirements/PRD.md) | MVP scope, non-goals, user journeys, and acceptance criteria |
| Architecture | [System Architecture](../04_Architecture/System_Architecture.md) | System boundaries, trust boundaries, scaling direction, and failure policy |
| Decisions | [ADR-001](../05_Decision_Records/ADR-001-verified-content-pipeline.md), [ADR-002](../05_Decision_Records/ADR-002-ai-tutor-is-not-the-exam-authority.md) | Accepted architectural decisions and their trade-offs |
| Engineering specifications | [CBT Engine](../06_Engineering_Specifications/EDS-001-CBT-Engine.md), [AI Tutor](../06_Engineering_Specifications/EDS-002-AI-Tutor.md), [Question Factory](../06_Engineering_Specifications/EDS-003-Question-Factory.md) | Implementable subsystem contracts |
| API | [API Contract](../07_API/API_Contract.md) | Resource and endpoint conventions for the first product slice |
| Data | [Data Model](../08_Database/Data_Model.md) | Core entities, invariants, and retention principles |
| AI | [AI System](../09_AI/AI_System.md) | Prompting, evaluation, caching, safety, and cost controls |
| Experiments | [Experiment Log](../10_Experiments/README.md) | Hypotheses, evidence, outcomes, and decisions |
| Operations | [Operational Playbooks](../11_Operations/Runbooks.md) | Human procedures for incidents and content changes |
| Finance | [Unit Economics](../12_Finance/Unit_Economics.md) | Cost drivers, assumptions, and measurement plan |
| Legal and governance | [Governance Boundaries](../13_Legal/Governance_Boundaries.md) | Areas requiring qualified legal review |
| Testing | [Quality Strategy](../14_Testing/Quality_Strategy.md) | Product, academic, AI, security, and reliability quality |
| Execution | [Roadmap](../15_Execution/Roadmap.md) | Now / Next / Later implementation sequence |
| Founder memory | [Founder's Journal](../16_Founders_Journal/README.md) | Strategic observations and decisions not captured elsewhere |

## How to read this

1. Start with the [Vision](../01_Vision/Vision.md) and [Product Requirements](../03_Requirements/PRD.md).
2. Read the three engineering specifications before implementing the first student workflow.
3. Treat every item marked **Open** as an explicit decision, not an invitation to guess.
4. When a decision changes, update the relevant ADR, requirements, and affected specifications together.

## Known uncertainty

The Blueprint captures the strongest direction in the supplied source material, but it does not pretend that unresolved commercial, regulatory, or market questions are settled. The first product milestone should validate the student problem and learning outcome before building the full contributor marketplace or multi-exam platform.