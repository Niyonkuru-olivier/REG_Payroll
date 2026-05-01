# Implementation Plan

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Dashboard Metrics Reflect Real DB Counts
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate all four metric bugs
  - **Scoped PBT Approach**: Scope the property to concrete failing cases — seed known counts and assert each metric matches
  - Test cases (run against UNFIXED frontend logic):
    - Seed 1 PlatformAdmin + 1 CompanyAdmin + 1 SuperAdmin + 1 BranchHR + 1 Employee (5 total). Assert `totalSystemUsers === 5`. Will FAIL — shows 3 (only sums SuperAdmin + BranchHR + Employee buckets).
    - Seed 3 Employee-role users. Assert `totalEmployees === 3`. Will FAIL if role string mismatch or scoping excludes them.
    - Seed users in 4 distinct roles. Assert `activeRoles === 4`. Will FAIL — hardcoded subset checks only 3 roles.
    - Seed 5 `payroll_batches`. Assert `Payments === 5`. Will FAIL — `appPayment.length` is always 1.
  - The test assertions match the Expected Behavior Properties from design (Requirements 2.1–2.4)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists)
  - Document counterexamples found (e.g., "totalSystemUsers shows 3 instead of 5 when PlatformAdmin/CompanyAdmin users exist")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Metric Dashboard Behavior Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-metric interactions:
    - Observe: User Management add/edit/delete operations work correctly on unfixed code
    - Observe: Data Management table renders all rows correctly on unfixed code
    - Observe: Dashboard renders with 0 fallbacks when API calls fail (no crash)
    - Observe: Sidebar navigation links route correctly on unfixed code
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all API failure scenarios: dashboard renders without crashing, all four metrics show 0
    - For all User Management CRUD operations: state updates correctly, table reflects changes
    - For all Data Management renders: `dataTableRows` array renders all 11 rows with correct counts
    - For all navigation interactions: `activeSection` state transitions work correctly
  - Property-based testing generates many random interaction sequences for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3. Fix superadmin dashboard stats — all four metrics show wrong values

  - [ ] 3.1 Add `getSuperAdminSummary()` to `backend/src/stats/stats.service.ts`
    - Add unscoped method with no actor parameter — no `buildScopedWhere` call
    - Run four parallel Prisma queries: `hr_users.count()`, `hr_users.count({ where: { role: hr_users_role.Employee } })`, `payroll_batches.count()`, `hr_users.groupBy({ by: ['role'], _count: { role: true } })`
    - Derive `activeRoles` as `roleGroups.filter(g => g._count.role > 0).length`
    - Return `{ totalUsers, totalEmployees, activeRoles, paymentCount }`
    - _Bug_Condition: isBugCondition holds when any metric ≠ its real DB count (see design)_
    - _Expected_Behavior: totalUsers = COUNT(*) FROM hr_users; totalEmployees = COUNT(*) WHERE role = Employee; activeRoles = COUNT(DISTINCT role) with users; paymentCount = COUNT(*) FROM payroll_batches_
    - _Preservation: existing getUserStats, usersByRole, usersByBranch methods must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.2 Add `GET /stats/superadmin-summary` route to `backend/src/stats/stats.controller.ts`
    - Import `RolesGuard` from `../auth/roles.guard`, `Roles` from `../auth/roles.decorator`, and `hr_users_role` from `@prisma/client`
    - Add `@Roles(hr_users_role.PlatformAdmin, hr_users_role.SuperAdmin)` decorator
    - Add `@UseGuards(JwtAuthGuard, RolesGuard)` on the new route (JwtAuthGuard already on class level, add RolesGuard per-route)
    - Add `@Get('superadmin-summary')` with `@ApiOperation({ summary: 'Get unscoped summary counts for superadmin dashboard' })`
    - Method signature: `superAdminSummary()` — no `@Req()` parameter needed
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.3 Update `frontend/app/super-admin-dashboard/page.tsx`
    - Add new state: `const [adminSummary, setAdminSummary] = useState({ totalUsers: 0, totalEmployees: 0, activeRoles: 0, paymentCount: 0 })`
    - In `loadOverview`, add fetch for `/stats/superadmin-summary` alongside existing calls (or replace them if `summary` and `usersByRole` are no longer needed for metrics)
    - Replace `metrics` array to use `adminSummary` values directly: `{ label: "Total Users", value: adminSummary.totalUsers }`, `{ label: "Total Employees", value: adminSummary.totalEmployees }`, `{ label: "Payments", value: adminSummary.paymentCount }`, `{ label: "Active Roles", value: adminSummary.activeRoles }`
    - Remove dead code: `totalSystemUsers`, `totalEmployees`, `activeRoles` computed variables; remove `roleCount` helper if no longer used; remove `summary` and `usersByRole` state if no longer used elsewhere
    - Keep `appPayment` only if still referenced in `dataTableRows` (it is — the Payment row uses `appPayment.length` for the data table count, which is separate from the metric card)
    - _Bug_Condition: metrics array reads from hardcoded data or mismatched API fields_
    - _Expected_Behavior: metrics array reads from adminSummary state populated by /stats/superadmin-summary_
    - _Preservation: dataTableRows, User Management CRUD, sidebar navigation, error fallback (catch block keeps page usable) must remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

  - [ ] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Dashboard Metrics Reflect Real DB Counts
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms all four metrics now read from real DB counts via `/stats/superadmin-summary`
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Metric Dashboard Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm User Management CRUD, Data Management table, API failure fallback, and navigation all work identically after the fix

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass; ask the user if questions arise
