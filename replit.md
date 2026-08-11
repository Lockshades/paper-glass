# ExamPilot

ExamPilot is a student-first exam-preparation platform built around realistic CBT practice, verified academic content, AI-assisted tutoring, and measurable learning progress.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `docs/00_Master_Index/` — Founder’s Blueprint and Engineering Operating Manual
- `docs/01_Vision/` through `docs/16_Founders_Journal/` — product, business, architecture, AI, operations, governance, testing, and execution documents
- `lib/api-spec/openapi.yaml` — API source of truth once the student application is implemented
- `artifacts/api-server/` — shared API service
- `artifacts/mockup-sandbox/` — reusable design mockup environment

## Architecture decisions

- AI may accelerate question creation, but unreviewed questions cannot enter a student examination.
- The CBT engine selects approved versioned content and stores reproducibility metadata.
- The AI tutor explains and recommends after learning events; it does not replace the authoritative answer key or change scores.
- The first milestone proves a student learning loop before expanding into marketplace and institutional capabilities.
- Important decisions and experiments are maintained in `docs/` rather than left only in conversation history.

## Product

The intended first product helps a student choose an exam and subject, take a timed practice session, resume safely, receive a deterministic result, understand mistakes with verified or AI-assisted explanations, identify weak topics, and choose a next study action. The long-term platform may also serve reviewers, authors, tutors, institutions, and academic partners.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Read `docs/00_Master_Index/Engineering_Operating_Manual.md` before implementing a significant product change.
- Do not expose answer keys before a session is submitted.
- Do not use live AI-generated questions in the exam path.
- Do not let later question edits change historical results.
- Keep derived analytics separate from authoritative scoring records.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
