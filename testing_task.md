# Backend Testing Task List

- [x] Install test dependencies (`jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`)
- [x] Activate `jest.config.ts` (uncomment and wire up `ts-jest`, path aliases)
- [x] Create test helpers: `mockPrisma.ts` and `testApp.ts`
- [x] Uncomment `accessResolver.test.ts`
- [x] Write `diagrams.service.test.ts` (6 tests for `targetExists` and `checkDuplicateAccessRule`)
- [x] Write auth unit tests (JWT + password hashing)
- [ ] Write `diagrams.access` integration tests (6 tests for security audit fixes)
- [ ] Write `diagrams.crud` integration tests (6 tests for core CRUD + access enforcement)
- [ ] Write users + admin integration tests (8 tests for remaining API surfaces)
- [ ] Run full suite & verify coverage (≥80%) and zero security regression
