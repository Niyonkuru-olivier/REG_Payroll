# Bugfix Requirements Document

## Introduction

The superadmin dashboard displays four key metrics: Total Users, Total Employees, Active Roles, and Payments. Currently, these metrics are either derived from hardcoded static data or computed incorrectly from the live API response. The result is that the dashboard shows wrong counts that do not reflect the actual state of the database.

Specifically:
- "Total Users" should count ALL users in `hr_users` (all roles: PlatformAdmin, SuperAdmin, CompanyAdmin, BranchHR, Employee), but the current logic only sums three role buckets from `usersByRole` and falls back to a scoped `summary.totalUsers` that excludes some roles.
- "Total Employees" should count only users with role `Employee`, but the role string used in `roleCount("Employee")` may not match the enum value returned by the API (`hr_users_role.Employee`).
- "Active Roles" should reflect the number of distinct roles that actually exist in the system, but the current logic counts only three hardcoded role buckets and checks which have a non-zero count — ignoring roles like `PlatformAdmin` and `CompanyAdmin`.
- "Payments" is derived from a hardcoded static array (`appPayment`) rather than real data from the database.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the superadmin dashboard loads THEN the system displays "Total Users" as the sum of only `SuperAdmin`, `BranchHR`, and `Employee` role counts (or falls back to a scoped count), excluding `PlatformAdmin` and `CompanyAdmin` users.

1.2 WHEN the superadmin dashboard loads THEN the system displays "Total Employees" using `roleCount("Employee")` which may return 0 if the API returns the role as `"Employee"` but the enum value differs in casing or format.

1.3 WHEN the superadmin dashboard loads THEN the system displays "Active Roles" as the count of non-zero buckets among only three hardcoded roles (`SuperAdmin`, `BranchHR`, `Employee`), ignoring other roles present in the system.

1.4 WHEN the superadmin dashboard loads THEN the system displays "Payments" as the length of a hardcoded static array (`appPayment.length = 1`) instead of real payment data from the database.

### Expected Behavior (Correct)

2.1 WHEN the superadmin dashboard loads THEN the system SHALL display "Total Users" as the total count of ALL users across all roles in the `hr_users` table, sourced from the `/stats/users` API response (`summary.totalUsers`).

2.2 WHEN the superadmin dashboard loads THEN the system SHALL display "Total Employees" as the count of users whose role is `Employee` in the `hr_users` table, correctly matched against the role string returned by the `/stats/users-by-role` API.

2.3 WHEN the superadmin dashboard loads THEN the system SHALL display "Active Roles" as the number of distinct roles that have at least one user in the system, computed from all role buckets returned by the `/stats/users-by-role` API (not a hardcoded subset).

2.4 WHEN the superadmin dashboard loads THEN the system SHALL display "Payments" as the real count of payroll batches or payslips from the database, sourced from a backend API endpoint rather than a static array.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the API call to `/stats/users` fails THEN the system SHALL CONTINUE TO render the dashboard without crashing, showing 0 or a safe fallback value for affected metrics.

3.2 WHEN the API call to `/stats/users-by-role` fails THEN the system SHALL CONTINUE TO render the dashboard without crashing, showing 0 or a safe fallback value for affected metrics.

3.3 WHEN a user navigates to the User Management or Data Management sections THEN the system SHALL CONTINUE TO display those sections correctly, unaffected by changes to the overview metrics.

3.4 WHEN the superadmin dashboard loads and the database has no users of a particular role THEN the system SHALL CONTINUE TO display 0 for that role's contribution without errors.
