# Testing Strategy

## Test Types

- Unit/component tests: `src/**/__tests__/*.test.ts(x)`
- E2E-style integration tests: `src/e2e/*.e2e.test.ts(x)`
- Rules parser tests: `src/lib/rules/__tests__/*.test.ts`

## Commands

- Run unit tests: `npm run test:unit`
- Run e2e tests: `npm run test:e2e`
- Run all tests: `npm run test:all`
- Run rules parser tests: `npm run rules:test`
- Dry-run screenshot pipeline tests (flow generation + validation planning): `npm run screenshots:dry-run`
- Run phase-3 text extraction pipeline (manual quality smoke): `npm run rules:phase3:text -- --skip-download`

## Dev Runtime Notes

- App runtime is launched via Expo dev client (`npm run expo:ios` or fixed-port `npm run ios:*`) but tests continue to run with Jest exactly as before.
- If Metro port conflicts occur while testing/devving multiple apps, run one app on `8081` and the other on `8082`.

## Scope Guidelines

- Models: validate parsing, comparisons, and query/filter behavior.
- Presenters: validate transformation and display-safe formatting.
- Components: validate rendering, callbacks, and empty/error states.
- E2E: validate app startup and data-loading flow across network conditions.
- Rules parser: validate column ordering, heading sectioning, anchor normalization, TOC mapping, and page-anchor fallback behavior.
- Rules fidelity: add regression coverage for embedded image extraction/render mapping as image support is introduced.

## Rules for New Changes

- New feature: include unit/component tests for core behavior.
- Bug fix: add a failing regression test first when practical.
- Startup/data flow change: update e2e tests in `src/e2e`.
- Screenshot pipeline changes: add/update unit tests in `src/__tests__/screenshots`.
