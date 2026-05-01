# Superadmin Dashboard Stats Bugfix Design

## Overview

The superadmin dashboard displays four key metrics — Total Users, Total Employees, Active Roles, and Payments — but all four currently show incorrect values. Three of the four are computed from a hardcoded static array or from a partial/mismatched subset of the live API response. The fix targets two layers:

1. **Backend (`stats.service.ts` / `stats.controller.ts`)**: Add a `GET /stats/superadmin-summary` endpoint that returns all four counts in a single, unscoped query — total `hr_users`, count of `Employee`-role users, count of distinct roles with at least one user, and count of `payroll_batches`.
2. **Frontend (`super-admin-dashboard/page.tsx`)**: Replace the four broken metric derivations with values from the new endpoint.

The fix is intentionally minimal: no schema changes, no new tables, no changes to existing endpoints.

---

## Glossary

- **Bug_Condition (C)**: The condition that triggers incorrect metric display — when the dashboard derives any of the four metrics from hardcoded data or a mismatched/scoped API field instead of real DB counts.
- **Property (P)**: The desired behavior — each metric card displays the value that matches the actual count in the database at the time of page load.
- **Preservation**: Existing behavior that must remain unchanged — User Management section, Data Management section, error resilience (no crash on API failure), and all other dashboard functionality.
- **`getUserStats`**: The method in `backend/src/stats/stats.service.ts` that returns `totalUsers` scoped by the actor's role — this is the source of the `summary.totalUsers` fallback, which is scoped and therefore incorrect for a superadmin view.
- **`usersByRole`**: The method in `stats.service.ts` that returns `hr_users` grouped by role, also scoped by actor — the frontend reads this to derive employee count and active roles, but the role string matching is fragile.
- **`appPayment`**: The hardcoded static array in `page.tsx` with a single entry; currently used as the Payments metric value.
- **`hr_users_role`**: The Prisma enum for user roles: `PlatformAdmin`, `SuperAdmin`, `CompanyAdmin`, `BranchHR`, `Employee`.
- **`payroll_batches`**: The Prisma model representing a payroll run; its row count is the correct source for the Payments metric.

---

## Bug Details

### Bug Condition

The bug manifests when the superadmin dashboard loads and computes any of the four overview metrics. The frontend either reads from a hardcoded array, sums an incomplete subset of role buckets, or uses a role string that may not match the enum value returned by the API.

**Formal Specification:**
```
FUNCTION isBugCondition(metric, source)
  INPUT:  metric ∈ {"TotalUsers", "TotalEmployees", "ActiveRoles", "Payments"}
          source = the value currently displayed for that metric
  OUTPUT: boolean

  IF metric = "TotalUsers"
    RETURN source ≠ COUNT(*) FROM hr_users
  IF metric = "TotalEmployees"
    RETURN source ≠ COUNT(*) FROM hr_users WHERE role = "Employee"
  IF metric = "ActiveRoles"
    RETURN source ≠ COUNT(DISTINCT role) FROM hr_users WHERE COUNT(*) > 0
  IF metric = "Payments"
    RETURN source ≠ COUNT(*) FROM payroll_batches
END FUNCTION
```

### Examples

- **Total Users**: DB has 12 `hr_users` across all roles. Dashboard shows 9 because `totalSystemUsers` only sums `SuperAdmin + BranchHR + Employee` buckets, missing `PlatformAdmin` and `CompanyAdmin`.
- **Total Employees**: DB has 7 users with role `Employee`. Dashboard shows 0 because `roleCount("Employee")` looks for the string `"Employee"` but the API returns the Prisma enum value which may differ in a groupBy result.
- **Active Roles**: DB has users in 4 distinct roles. Dashboard shows 2 because only 3 hardcoded buckets are checked and one of those 3 is empty.
- **Payments**: DB has 15 `payroll_batches`. Dashboard shows 1 because `appPayment.length` is a hardcoded static array with one entry.

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Mouse clicks and navigation in the User Management section must continue to work exactly as before.
- The Data Management section table must continue to display its rows correctly.
- The dashboard must not crash when any stats API call fails — it must fall back to 0 gracefully.
- All existing `/stats/users` and `/stats/users-by-role` endpoints must remain unchanged and continue to work for other consumers.
- The sidebar navigation links (Role Management, Branch & Category Settings, etc.) must remain unaffected.

**Scope:**
All inputs that do NOT involve the four overview metric cards are completely unaffected by this fix. This includes:
- User Management CRUD operations (add, edit, delete users)
- Data Management table rendering
- Sidebar navigation and routing
- Any other dashboard section or API endpoint not listed in the fix

---

## Hypothesized Root Cause

Based on code analysis, the four bugs have distinct root causes:

1. **Scoped `totalUsers` fallback (Total Users bug)**: `getUserStats` applies `buildScopedWhere` which filters by role and actor context. A SuperAdmin actor gets all roles, but `totalSystemUsers` in the frontend sums only three hardcoded role buckets from `usersByRole` and only falls back to `summary.totalUsers` when that sum is 0. If any of the three buckets has data, the fallback is never used, and `PlatformAdmin`/`CompanyAdmin` users are excluded.

2. **Role string mismatch (Total Employees bug)**: `usersByRole` returns Prisma enum values (e.g. `"Employee"` as the TypeScript enum string). The frontend calls `roleCount("Employee")` which does a strict string equality check. If the API returns `"Employee"` this works, but the scoping in `buildScopedWhere` for a SuperAdmin actor may alter which roles are returned, and the string comparison is fragile against any future enum rename.

3. **Hardcoded role subset (Active Roles bug)**: The frontend computes `activeRoles` by checking only three role buckets (`SuperAdmin`, `BranchHR`, `Employee`). Roles `PlatformAdmin` and `CompanyAdmin` are never checked, so their presence in the DB is invisible to this calculation.

4. **Hardcoded static array (Payments bug)**: `appPayment` is a module-level constant with one entry. There is no API call to fetch real payment/payroll data. The backend has `payroll_batches` and `payslips` tables with real data, but no stats endpoint exposes their count.

---

## Correctness Properties

Property 1: Bug Condition — Dashboard Metrics Reflect Real DB Counts

_For any_ database state where `hr_users` and `payroll_batches` contain real rows, the fixed dashboard SHALL display Total Users equal to `COUNT(*) FROM hr_users`, Total Employees equal to `COUNT(*) FROM hr_users WHERE role = 'Employee'`, Active Roles equal to the number of distinct roles with at least one user, and Payments equal to `COUNT(*) FROM payroll_batches`.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 2: Preservation — Non-Metric Dashboard Behavior Unchanged

_For any_ user interaction that does NOT involve the four overview metric cards (navigation, user CRUD, data table rendering, API failure), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

---

## Fix Implementation

### Changes Required

#### File: `backend/src/stats/stats.service.ts`

**Add method `getSuperAdminSummary`** — a new, unscoped query that returns all four counts directly from the DB without role-based filtering:

```typescript
async getSuperAdminSummary() {
  const [totalUsers, totalEmployees, paymentCount, roleGroups] = await Promise.all([
    this.prisma.hr_users.count(),
    this.prisma.hr_users.count({ where: { role: hr_users_role.Employee } }),
    this.prisma.payroll_batches.count(),
    this.prisma.hr_users.groupBy({ by: ['role'], _count: { role: true } }),
  ]);

  const activeRoles = roleGroups.filter(g => g._count.role > 0).length;

  return { totalUsers, totalEmployees, activeRoles, paymentCount };
}
```

**Specific Changes:**
1. Add `getSuperAdminSummary()` method — no scoping, no actor parameter.
2. Uses `hr_users_role.Employee` enum directly (no string matching).
3. Derives `activeRoles` from all role buckets returned by `groupBy`, not a hardcoded subset.
4. Counts `payroll_batches` for the Payments metric.

#### File: `backend/src/stats/stats.controller.ts`

**Add route `GET /stats/superadmin-summary`** — restricted to `PlatformAdmin` and `SuperAdmin` roles:

```typescript
@Roles(hr_users_role.PlatformAdmin, hr_users_role.SuperAdmin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('superadmin-summary')
@ApiOperation({ summary: 'Get unscoped summary counts for superadmin dashboard' })
superAdminSummary() {
  return this.statsService.getSuperAdminSummary();
}
```

**Specific Changes:**
1. Add `RolesGuard` and `Roles` decorator to restrict access.
2. No `req` parameter needed — the service method is unscoped.
3. Import `RolesGuard`, `Roles`, and `hr_users_role` in the controller.

#### File: `backend/src/stats/stats.module.ts`

No changes needed — `PrismaModule` is already imported and `StatsService` already has access to `PrismaService`.

#### File: `frontend/app/super-admin-dashboard/page.tsx`

**Replace the four broken metric derivations** with values from the new `/stats/superadmin-summary` endpoint:

1. **Add new state** for the superadmin summary:
   ```typescript
   const [adminSummary, setAdminSummary] = useState({
     totalUsers: 0, totalEmployees: 0, activeRoles: 0, paymentCount: 0,
   });
   ```

2. **Fetch from new endpoint** in `loadOverview`:
   ```typescript
   const summary = await apiFetchAuth<{
     totalUsers: number; totalEmployees: number;
     activeRoles: number; paymentCount: number;
   }>("/stats/superadmin-summary");
   setAdminSummary(summary);
   ```

3. **Replace metrics array** to use `adminSummary` values directly:
   ```typescript
   const metrics = [
     { label: "Total Users",      value: adminSummary.totalUsers },
     { label: "Total Employees",  value: adminSummary.totalEmployees },
     { label: "Payments",         value: adminSummary.paymentCount },
     { label: "Active Roles",     value: adminSummary.activeRoles },
   ];
   ```

4. **Remove dead code**: `totalSystemUsers`, `totalEmployees`, `activeRoles` computed variables, and the `usersByRole` / `summary` state that are no longer needed for metrics (keep only if used elsewhere — they are not).

---

## Testing Strategy

### Validation Approach

Two-phase approach: first surface counterexamples on unfixed code to confirm root cause, then verify the fix and preservation.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each of the four metric bugs BEFORE implementing the fix. Confirm or refute the root cause analysis.

**Test Plan**: Seed the DB with known counts across all roles and payroll batches, then assert that the current frontend metric values match those counts. Run on UNFIXED code to observe failures.

**Test Cases:**
1. **Total Users test**: Seed 5 users across all 5 roles (1 each). Assert `totalSystemUsers === 5`. Will fail — shows 3 (only sums 3 role buckets).
2. **Total Employees test**: Seed 3 `Employee`-role users. Assert `totalEmployees === 3`. Will fail if role string mismatch or scoping excludes them.
3. **Active Roles test**: Seed users in 4 distinct roles. Assert `activeRoles === 4`. Will fail — shows at most 3 (hardcoded subset).
4. **Payments test**: Seed 5 `payroll_batches`. Assert `Payments === 5`. Will fail — shows 1 (hardcoded array).

**Expected Counterexamples:**
- `totalSystemUsers` is less than actual `hr_users` count when `PlatformAdmin` or `CompanyAdmin` users exist.
- `activeRoles` is less than actual distinct role count when roles outside the hardcoded 3 have users.
- `Payments` is always 1 regardless of DB state.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed dashboard produces the correct values.

**Pseudocode:**
```
FOR ALL dbState WHERE isBugCondition(metric, currentValue) DO
  result := loadDashboard_fixed(dbState)
  ASSERT result.totalUsers    = COUNT(*) FROM hr_users
  ASSERT result.totalEmployees = COUNT(*) FROM hr_users WHERE role = 'Employee'
  ASSERT result.activeRoles   = COUNT(DISTINCT role) FROM hr_users WHERE count > 0
  ASSERT result.paymentCount  = COUNT(*) FROM payroll_batches
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (non-metric interactions), the fixed code behaves identically to the original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(metric, value) DO
  ASSERT dashboard_original(input) = dashboard_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random user interaction sequences automatically.
- It catches edge cases (e.g. API failure mid-load, empty DB) that manual tests miss.
- It provides strong guarantees that non-metric behavior is unchanged.

**Test Cases:**
1. **API failure preservation**: Mock `/stats/superadmin-summary` to throw. Assert dashboard renders with 0 values and no crash.
2. **User Management preservation**: Perform add/edit/delete user operations. Assert they work identically before and after the fix.
3. **Data Management preservation**: Navigate to Data Management section. Assert table rows render correctly.
4. **Empty DB preservation**: Seed no users, no payroll batches. Assert all four metrics show 0 without errors.

### Unit Tests

- Test `getSuperAdminSummary()` with a mocked Prisma client returning known counts — assert all four fields are correct.
- Test that `getSuperAdminSummary()` uses `hr_users_role.Employee` enum (not a string literal) for the employee count query.
- Test frontend `roleCount` is no longer used for metric derivation after the fix.
- Test edge case: `payroll_batches` table is empty — `paymentCount` returns 0.

### Property-Based Tests

- Generate random counts of users per role; assert `totalUsers` equals the sum and `activeRoles` equals the number of non-empty roles.
- Generate random `payroll_batches` counts; assert `paymentCount` always equals the DB count.
- Generate random sequences of non-metric interactions (navigation, CRUD); assert dashboard state is unchanged by the stats fix.

### Integration Tests

- Full page load with real DB: assert all four metric cards display values matching direct DB queries.
- Simulate SuperAdmin login, load dashboard, verify metrics against seeded data.
- Simulate API timeout on `/stats/superadmin-summary`; verify dashboard renders with 0 fallbacks and no console errors.
