# Testing

## Test Types
- Unit/component tests: `src/**/__tests__/*.test.ts(x)`
- E2E-style integration tests: `src/e2e/*.e2e.test.ts(x)`
- Rules parser tests: `src/lib/rules/__tests__/*.test.ts`

## Core Commands
```bash
npm run test:unit
npm run test:e2e
npm run rules:test
npm run test:all
```

## Runtime Note
- App runtime uses Expo dev client commands (`npm run expo:ios` or `npm run ios:8081|ios:8082`).
- Test execution remains Jest-based and independent of simulator runtime.

## Change Requirements
- New feature: add/update unit or component tests.
- Bug fix: add a regression test when practical.
- Startup/data-flow change: update e2e tests in `src/e2e`.
- Rules pipeline change: update rules parser tests.
