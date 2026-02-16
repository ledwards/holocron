# AGENTS.md

This repository allows AI-assisted development. Follow these rules for all LLMs and automation agents.

## Objectives

- Keep behavior correct and test-backed.
- Prefer small, reviewable changes over broad rewrites.
- Protect app startup, data loading, and navigation behavior.

## Required Workflow

1. Understand impact before editing.
2. Make the smallest coherent change that solves the task.
3. Add or update tests for behavior changes.
4. Run relevant tests locally before finishing.
5. Update docs when commands, architecture, or developer workflow changes.

## Coding Standards

- Keep TypeScript types explicit at boundaries.
- Avoid introducing new dependencies unless required.
- Reuse existing patterns in `src/models`, `src/presenters`, and `src/components`.
- Prefer pure logic in models/presenters; keep UI components focused on rendering and interaction.
- Do not mix unrelated refactors with feature/fix work.

## Testing Standards

- Unit tests: model, presenter, and component behavior in `src/**/__tests__`.
- E2E-style integration tests: app startup/data flow tests in `src/e2e`.
- Every bug fix should include a regression test when practical.
- Do not skip failing tests without documenting the reason.

## Documentation Standards

- Keep setup and test commands accurate in `README.md`.
- Document architectural choices in `docs/ARCHITECTURE.md`.
- Document test strategy in `docs/TESTING.md`.

## Planning Workflow

- Store all new implementation/release plans in `docs/plans/`.
- Use descriptive filenames: `docs/plans/<topic>-plan.md`.
- A plan must include:
  1. Current snapshot (state of repo/tooling and known blockers).
  2. Goal and scope (what is in/out).
  3. Ordered execution phases with concrete exit criteria.
  4. Human-required steps (accounts, approvals, console actions, legal/policy items).
  5. Validation strategy (tests/builds/manual checks).
  6. Risks/open questions and mitigation.
  7. Source links when policy/platform requirements are referenced.

### Plan Completion and Promotion to Permanent Docs

- When a plan is completed, do not leave key process knowledge only in `docs/plans/`.
- Convert durable guidance into permanent LLM-facing docs:
  - Update `README.md` for developer commands/workflows.
  - Update `docs/ARCHITECTURE.md` for architecture/design decisions.
  - Update `docs/TESTING.md` for test strategy/coverage workflow.
  - If needed, create or update a focused long-lived runbook in `docs/` (for example `docs/ANDROID_RELEASE.md`).
- In the completed plan file, add a short closure note listing:
  1. What shipped.
  2. What permanent docs were updated.
  3. Any follow-up work that remains.

## Safety Rules

- Never commit secrets or tokens.
- Never remove existing tests to make a build pass.
- Never change release scripts blindly; validate assumptions in repo docs first.
