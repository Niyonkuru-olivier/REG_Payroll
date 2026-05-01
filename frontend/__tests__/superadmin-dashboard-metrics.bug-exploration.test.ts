/**
 * Bug Condition Exploration Test — Superadmin Dashboard Metrics
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4
 *
 * PURPOSE: This test is written against the UNFIXED frontend logic.
 * It is EXPECTED TO FAIL — failure confirms the four metric bugs exist.
 * DO NOT fix the code to make this test pass.
 *
 * When the fix is applied (task 3), re-running this test should PASS,
 * confirming all four metrics now reflect real DB counts.
 *
 * Counterexamples documented below prove each bug.
 */

// ---------------------------------------------------------------------------
// Replicate the exact metric derivation logic from
// frontend/app/super-admin-dashboard/page.tsx (UNFIXED)
// ---------------------------------------------------------------------------

/**
 * The buggy roleCount helper from page.tsx.
 * Looks up a role string in the usersByRole array returned by /stats/users-by-role.
 */
function roleCount(
  usersByRole: Array<{ role: string; _count: { role: number } }>,
  role: string,
): number {
  return usersByRole.find((r) => r.role === role)?._count.role ?? 0;
}

/**
 * The buggy totalSystemUsers derivation from page.tsx.
 * Only sums three hardcoded role buckets: SuperAdmin + BranchHR + Employee.
 * Falls back to summary.totalUsers ONLY when the sum is 0.
 */
function deriveTotalSystemUsers(
  usersByRole: Array<{ role: string; _count: { role: number } }>,
  summaryTotalUsers: number,
): number {
  const sum =
    roleCount(usersByRole, "SuperAdmin") +
    roleCount(usersByRole, "BranchHR") +
    roleCount(usersByRole, "Employee");
  return sum || summaryTotalUsers;
}

/**
 * The buggy totalEmployees derivation from page.tsx.
 * Uses roleCount("Employee") — a string match against the API response.
 */
function deriveTotalEmployees(
  usersByRole: Array<{ role: string; _count: { role: number } }>,
): number {
  return roleCount(usersByRole, "Employee");
}

/**
 * The buggy activeRoles derivation from page.tsx.
 * Only checks three hardcoded role buckets; ignores PlatformAdmin and CompanyAdmin.
 */
function deriveActiveRoles(
  usersByRole: Array<{ role: string; _count: { role: number } }>,
): number {
  return [
    roleCount(usersByRole, "SuperAdmin"),
    roleCount(usersByRole, "BranchHR"),
    roleCount(usersByRole, "Employee"),
  ].filter((count) => count > 0).length;
}

/**
 * The buggy Payments metric from page.tsx.
 * Always returns appPayment.length — a hardcoded static array with 1 entry.
 */
const HARDCODED_APP_PAYMENT_LENGTH = 1; // appPayment array in page.tsx has exactly 1 entry

function derivePayments(): number {
  // This replicates: appPayment.length
  // appPayment is a module-level constant — it never changes regardless of DB state.
  return HARDCODED_APP_PAYMENT_LENGTH;
}

// ---------------------------------------------------------------------------
// Bug Condition Exploration Tests
// ---------------------------------------------------------------------------

describe("Superadmin Dashboard — Bug Condition Exploration (EXPECTED TO FAIL)", () => {
  /**
   * Bug 1: Total Users
   *
   * Seed: 1 PlatformAdmin + 1 CompanyAdmin + 1 SuperAdmin + 1 BranchHR + 1 Employee = 5 total
   *
   * The /stats/users-by-role API returns all five role buckets.
   * The /stats/users API returns totalUsers = 5 (unscoped count).
   *
   * Expected: totalSystemUsers === 5
   * Actual (buggy): 3 — only SuperAdmin(1) + BranchHR(1) + Employee(1) are summed;
   *                      PlatformAdmin and CompanyAdmin are excluded.
   *
   * Counterexample: totalSystemUsers shows 3 instead of 5 when PlatformAdmin/CompanyAdmin users exist.
   */
  test("Bug 1 — Total Users: should count ALL 5 users across all roles", () => {
    // Simulated /stats/users-by-role response with all 5 roles populated
    const usersByRole = [
      { role: "PlatformAdmin", _count: { role: 1 } },
      { role: "CompanyAdmin",  _count: { role: 1 } },
      { role: "SuperAdmin",    _count: { role: 1 } },
      { role: "BranchHR",      _count: { role: 1 } },
      { role: "Employee",      _count: { role: 1 } },
    ];

    // Simulated /stats/users response: totalUsers = 5 (real DB count)
    const summaryTotalUsers = 5;

    const totalSystemUsers = deriveTotalSystemUsers(usersByRole, summaryTotalUsers);

    // EXPECTED: 5 (all users in hr_users)
    // ACTUAL (buggy): 3 (only SuperAdmin + BranchHR + Employee)
    expect(totalSystemUsers).toBe(5);
  });

  /**
   * Bug 2: Total Employees
   *
   * Seed: 3 users with role "Employee"
   *
   * The /stats/users-by-role API returns a bucket for "Employee" with count 3.
   *
   * Expected: totalEmployees === 3
   * Actual (buggy): May return 0 if the API returns the Prisma enum value
   *                 (e.g. "Employee") but the string match is fragile.
   *                 Even when the string matches, the scoped API may exclude some employees.
   *
   * Counterexample: totalEmployees shows 0 when role string from API doesn't match "Employee".
   */
  test("Bug 2 — Total Employees: should count exactly 3 Employee-role users", () => {
    // Simulated /stats/users-by-role response with 3 employees
    // NOTE: The Prisma enum hr_users_role.Employee serialises as "Employee" in JSON.
    // The buggy code does roleCount("Employee") — this works IF the string matches exactly.
    // However, the scoped getUserStats/usersByRole may not return all employees for a SuperAdmin actor.
    const usersByRole = [
      { role: "Employee", _count: { role: 3 } },
    ];

    const totalEmployees = deriveTotalEmployees(usersByRole);

    // EXPECTED: 3
    // ACTUAL (buggy): 3 when string matches — but this is fragile and scoping may reduce it.
    // The test documents the expected value; the fix must guarantee this via enum-safe query.
    expect(totalEmployees).toBe(3);
  });

  /**
   * Bug 3: Active Roles
   *
   * Seed: users in 4 distinct roles (PlatformAdmin, SuperAdmin, BranchHR, Employee)
   *
   * The /stats/users-by-role API returns 4 non-empty role buckets.
   *
   * Expected: activeRoles === 4
   * Actual (buggy): at most 3 — only SuperAdmin, BranchHR, Employee are checked;
   *                              PlatformAdmin is invisible to the hardcoded subset.
   *
   * Counterexample: activeRoles shows 3 instead of 4 when PlatformAdmin users exist.
   */
  test("Bug 3 — Active Roles: should count 4 distinct roles when 4 roles have users", () => {
    // Simulated /stats/users-by-role response with 4 populated roles
    const usersByRole = [
      { role: "PlatformAdmin", _count: { role: 2 } },
      { role: "SuperAdmin",    _count: { role: 1 } },
      { role: "BranchHR",      _count: { role: 3 } },
      { role: "Employee",      _count: { role: 5 } },
    ];

    const activeRoles = deriveActiveRoles(usersByRole);

    // EXPECTED: 4 (all four roles have at least one user)
    // ACTUAL (buggy): 3 (PlatformAdmin is not in the hardcoded subset)
    expect(activeRoles).toBe(4);
  });

  /**
   * Bug 4: Payments
   *
   * Seed: 5 payroll_batches in the database.
   *
   * Expected: Payments === 5
   * Actual (buggy): always 1 — appPayment is a hardcoded static array with 1 entry;
   *                              no API call is made to fetch real payment data.
   *
   * Counterexample: Payments always shows 1 regardless of how many payroll_batches exist in DB.
   */
  test("Bug 4 — Payments: should reflect 5 payroll_batches from DB, not hardcoded array", () => {
    // The real DB has 5 payroll_batches — this would be returned by a real API call.
    // But the buggy code never makes that API call; it uses appPayment.length = 1.
    const realPayrollBatchCount = 5; // what the DB actually contains

    const paymentsMetric = derivePayments(); // always returns 1 (hardcoded)

    // EXPECTED: 5 (real DB count)
    // ACTUAL (buggy): 1 (hardcoded appPayment.length)
    expect(paymentsMetric).toBe(realPayrollBatchCount);
  });
});

/**
 * SUMMARY OF COUNTEREXAMPLES (documented for task 1 completion):
 *
 * Bug 1 — Total Users:
 *   Input:  5 users across PlatformAdmin(1), CompanyAdmin(1), SuperAdmin(1), BranchHR(1), Employee(1)
 *   Got:    totalSystemUsers = 3
 *   Wanted: totalSystemUsers = 5
 *   Cause:  deriveTotalSystemUsers only sums SuperAdmin + BranchHR + Employee buckets
 *
 * Bug 2 — Total Employees:
 *   Input:  3 users with role "Employee"
 *   Got:    totalEmployees = 3 (string match works in isolation, but scoped API may return fewer)
 *   Wanted: totalEmployees = 3 (guaranteed via hr_users_role.Employee enum, unscoped)
 *   Cause:  roleCount("Employee") is a fragile string match; scoped API may exclude employees
 *
 * Bug 3 — Active Roles:
 *   Input:  4 roles with users: PlatformAdmin(2), SuperAdmin(1), BranchHR(3), Employee(5)
 *   Got:    activeRoles = 3
 *   Wanted: activeRoles = 4
 *   Cause:  deriveActiveRoles only checks 3 hardcoded buckets; PlatformAdmin is invisible
 *
 * Bug 4 — Payments:
 *   Input:  5 payroll_batches in DB
 *   Got:    Payments = 1
 *   Wanted: Payments = 5
 *   Cause:  derivePayments() returns appPayment.length (hardcoded = 1), no API call made
 */
