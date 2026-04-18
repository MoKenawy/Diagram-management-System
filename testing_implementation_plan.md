# DMS Backend Testing Plan

Comprehensive testing strategy for the Diagram Management System, covering unit tests, integration tests, and E2E tests per the README TASK-005, TASK-018, and our recent security audit remediation.

## User Review Required

> [!IMPORTANT]
> **Test framework choice:** Jest is partially configured (commented out). The README specifies Playwright for E2E (TASK-018). This plan uses **Jest + Supertest** for backend unit/integration tests and **Playwright** for E2E. Confirm this is acceptable.

> [!WARNING]
> **Database dependency:** Integration tests require a live PostgreSQL instance. Plan uses a test `.env.test` pointing to a `dms_test` database, reset via `prisma migrate reset --force` before each suite. Ensure a test DB is available.

## Approach

- **Layer 1 — Unit Tests**: Pure function testing with mocked Prisma. No DB required.
- **Layer 2 — Integration Tests**: Supertest against live Express app with test DB. Validates routes → controllers → services → DB.
- **Layer 3 — E2E Tests**: Playwright browser tests against a running dev server (TASK-018 scope, deferred).

Focus is on Layer 1 + Layer 2, which cover the security audit changes and all core backend logic.

## Proposed Changes

### Test Infrastructure

#### [MODIFY] [jest.config.ts](file:///d:/Diagram-management-system/Diagram-management-System/monorepo-app/packages/backend/jest.config.ts)
- Uncomment and configure Jest with `ts-jest`, `node` environment, path aliases.
- Add `setupFilesAfterSetup` for Prisma mock helper.

#### [MODIFY] [package.json](file:///d:/Diagram-management-system/Diagram-management-System/monorepo-app/packages/backend/package.json)
- Add `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest` to devDependencies.
- Add `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"` scripts.

#### [NEW] `src/__tests__/helpers/mockPrisma.ts`
- Singleton mock factory for PrismaClient with `jest.mock('@prisma/client')`.

#### [NEW] `src/__tests__/helpers/testApp.ts`
- Creates an Express app instance with all routes mounted for integration tests.
- JWT token generation helpers for each role (`adminToken`, `dcToken`, `engineerToken`, `managerToken`).

---

### Layer 1 — Unit Tests (6 test files)

#### [MODIFY] [accessResolver.test.ts](file:///d:/Diagram-management-system/Diagram-management-System/monorepo-app/packages/backend/src/__tests__/accessResolver.test.ts)
- **Uncomment** the existing 10 test cases for `canAccessDiagram`.
- Add 2 tests for the `checkDiagramAccess` middleware (DC/ADMIN bypass, ENGINEER denied).

#### [NEW] `src/__tests__/unit/diagrams.service.test.ts`
- `targetExists('USER', validId)` → returns `true`
- `targetExists('USER', invalidId)` → returns `false`
- `targetExists('DEPARTMENT', validId)` → returns `true`
- `targetExists('DEPARTMENT', invalidId)` → returns `false`
- `checkDuplicateAccessRule()` → returns match when duplicate exists
- `checkDuplicateAccessRule()` → returns null when no duplicate

#### [NEW] `src/__tests__/unit/auth.service.test.ts`
- `hashPassword` → produces valid bcrypt hash
- `comparePassword` → matches correct password, rejects incorrect
- `generateAccessToken` → returns decodable JWT with `sub`, `role`, `departmentId`
- `verifyAccessToken` → rejects expired/invalid tokens

#### [NEW] `src/__tests__/unit/auditLog.test.ts`
- `logAction` → calls `prisma.auditLog.create` with correct payload
- `logAction` → swallows errors (fire-and-forget)

#### [NEW] `src/__tests__/unit/storage.test.ts`
- File filter accepts `.pdf`, `.jpg`, `.png`, `.svg`, `.dwg`
- File filter rejects `.exe`, `.sh`, `.js`

#### [NEW] `src/__tests__/unit/validate.middleware.test.ts`
- Zod `accessRuleSchema` accepts valid payloads
- Zod `accessRuleSchema` rejects missing `targetType`, invalid `policy`

---

### Layer 2 — Integration Tests (5 test files)

#### [NEW] `src/__tests__/integration/auth.routes.test.ts`
- `POST /api/auth/login` → 200 with valid credentials
- `POST /api/auth/login` → 401 with wrong password
- `POST /api/auth/login` → 423 after 5 failed attempts (account lock)
- `GET /api/auth/me` → 401 without token
- `GET /api/auth/me` → 200 with valid token, returns user (no `passwordHash`)

#### [NEW] `src/__tests__/integration/diagrams.access.test.ts` ⭐ (Security audit validation)
- **Authorization fix:** ENGINEER with diagram-level ADMIN access can `POST /:id/access` → 201 ✅
- **Authorization fix:** ENGINEER without access gets denied → 403
- **Target validation:** `POST /:id/access` with non-existent `targetId` → 404
- **Duplicate prevention:** Same access rule created twice → 409
- **Delete rule:** `DELETE /:id/access/:ruleId` → 200, rule removed
- **List rules:** `GET /:id/access` → returns rules with user/department names

#### [NEW] `src/__tests__/integration/diagrams.crud.test.ts`
- `POST /api/diagrams` with file upload → 201, creates diagram + version 1
- `GET /api/diagrams` as ENGINEER → only accessible diagrams
- `GET /api/diagrams/:id` with access → 200
- `GET /api/diagrams/:id` without access → 403
- `PATCH /api/diagrams/:id` → updates title/description
- `DELETE /api/diagrams/:id` → soft-delete (isActive = false)

#### [NEW] `src/__tests__/integration/users.routes.test.ts`
- `POST /api/users` as ADMIN → 201
- `POST /api/users` as ENGINEER → 403
- `PATCH /api/users/:id` → updates user
- `PATCH /api/users/:id` → cannot change own role -> 400
- `PATCH /api/users/:id/password` → resets password

#### [NEW] `src/__tests__/integration/admin.routes.test.ts`
- `GET /api/admin/config` → 200 as ADMIN, 403 as ENGINEER
- `PATCH /api/admin/config` → updates config values
- `GET /api/admin/audit-logs` → paginated results

---

## Action Items Checklist

1. **Install test dependencies** — `jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`
2. **Activate jest.config.ts** — Uncomment and wire up `ts-jest`, path aliases, `clearMocks: true`
3. **Create test helpers** — `mockPrisma.ts` (mock factory) + `testApp.ts` (Express app + JWT tokens)
4. **Uncomment accessResolver.test.ts** — Activate existing 10 Deny-Override unit tests
5. **Write diagrams.service.test.ts** — 6 tests covering `targetExists` and `checkDuplicateAccessRule`
6. **Write auth unit tests** — 4 tests for JWT + password hashing
7. **Write diagrams.access integration tests** — 6 tests validating all security audit fixes
8. **Write diagrams.crud integration tests** — 6 tests for core CRUD + access enforcement
9. **Write users + admin integration tests** — 8 tests for remaining API surfaces
10. **Run full suite and verify** — `npm test`, target ≥80% coverage on services/controllers

## Verification Plan

### Automated Tests
```bash
cd monorepo-app/packages/backend
npm test                    # Run all tests
npm run test:coverage       # Coverage report
```

**Pass criteria:**
- All tests green
- ≥80% line coverage on `services/`, `controllers/`, `utils/accessResolver.ts`
- Zero security regression (access rules tests all pass)

### Manual Verification
- Confirm the 4 security audit fixes are each covered by at least one test:
  1. ✅ Global `authorize` removal → ENGINEER with diagram ADMIN can manage access
  2. ✅ `targetExists` validation → 404 on non-existent target
  3. ✅ Duplicate check reactivation → 409 on duplicate rule
  4. ✅ Deny-Override logic → unit tests cover all 10 scenarios
