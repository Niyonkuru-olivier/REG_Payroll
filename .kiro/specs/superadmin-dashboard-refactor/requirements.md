# Requirements Document

## Introduction

The Super Admin Dashboard is currently implemented as a single monolithic file (`frontend/app/super-admin-dashboard/page.tsx`) containing all UI, state management, and API logic for User Management, Data Management, Role Management, and Branch & Category Settings. This refactor separates each functional area into its own self-contained module folder, introduces a shared components layer, and updates routing/imports — without changing any existing functionality or user-facing behaviour.

## Glossary

- **Dashboard**: The Super Admin Dashboard page at `/super-admin-dashboard`.
- **Module**: A self-contained folder under `frontend/app/super-admin-dashboard/` that owns the UI, state, and API calls for one functional area.
- **User_Management_Module**: The module responsible for listing, creating, editing, deleting, and managing the status of users.
- **Data_Management_Module**: The module responsible for displaying the data overview table (entity counts, keys, statuses).
- **Role_Management_Module**: The module responsible for listing, creating, and editing roles.
- **Branch_Category_Module**: The module responsible for managing branches and categories (CRUD operations).
- **Shared_Components**: Reusable UI primitives (tables, modals, notification banners, form fields) placed in `frontend/components/`.
- **Dashboard_Shell**: The top-level `page.tsx` that renders the sidebar, topbar, and delegates section rendering to the appropriate module component.
- **API_Layer**: Calls made via `apiFetchAuth` from `frontend/lib/api.ts`.
- **Path_Alias**: The `@/` TypeScript path alias already configured in `tsconfig.json` mapping to the `frontend/` root.

---

## Requirements

### Requirement 1: Module Separation

**User Story:** As a developer, I want each dashboard section to live in its own folder, so that I can find, update, and test each feature independently without touching unrelated code.

#### Acceptance Criteria

1. THE Dashboard SHALL contain a `user-management/` module folder under `frontend/app/super-admin-dashboard/`.
2. THE Dashboard SHALL contain a `data-management/` module folder under `frontend/app/super-admin-dashboard/`.
3. THE Dashboard SHALL contain a `role-management/` module folder under `frontend/app/super-admin-dashboard/`.
4. THE Dashboard SHALL contain a `branch-category/` module folder under `frontend/app/super-admin-dashboard/`.
5. WHEN a module folder is created, THE module SHALL export a single default React component that encapsulates all UI, local state, and API calls for that section.
6. THE Dashboard_Shell SHALL import each module component and render it based on the active section state, preserving the existing `activeSection` navigation behaviour.

---

### Requirement 2: Separation of Concerns

**User Story:** As a developer, I want each module to own its own logic, so that changes to one module do not risk breaking another.

#### Acceptance Criteria

1. THE User_Management_Module SHALL contain all user-related state (`users`, `form`, `isEditing`, `isModalOpen`, `searchQuery`), handlers (`saveUser`, `editUser`, `deleteUser`, `handleStatusApproval`, `handleDirectStatusChange`, `resetUserPassword`), and user-list/form UI.
2. THE Role_Management_Module SHALL contain all role-related state (`roles`, `roleId`, `roleName`, `roleStatus`) and handlers (`saveRole`, `editRole`, `resetRoleForm`).
3. THE Branch_Category_Module SHALL contain all branch and category state and handlers (`saveBranch`, `editBranch`, `deleteBranch`, `saveCategory`, `editCategory`, `deleteCategory`).
4. THE Data_Management_Module SHALL contain the data overview table rows and rendering logic.
5. IF a module requires data owned by another module (e.g., User_Management_Module needs the `roles` list for the role dropdown), THEN THE Dashboard_Shell SHALL pass that data as props to the receiving module component.

---

### Requirement 3: Shared Components

**User Story:** As a developer, I want reusable UI elements in one place, so that I don't duplicate markup and styles across modules.

#### Acceptance Criteria

1. THE Dashboard SHALL place shared UI components in `frontend/components/`.
2. THE Shared_Components folder SHALL include at minimum a `NotificationBanner` component that accepts `type` (`'success' | 'error'`), `message`, and `onClose` props.
3. WHEN a module needs to display a success or error notification, THE module SHALL use the `NotificationBanner` shared component rather than inline notification markup.
4. WHERE additional shared primitives (e.g., a reusable modal wrapper or status badge) are identified during implementation, THE Dashboard SHALL place them in `frontend/components/` and import them via the `@/components/` alias.

---

### Requirement 4: Clean Imports via Path Alias

**User Story:** As a developer, I want absolute imports using the `@/` alias, so that import paths remain stable regardless of file nesting depth.

#### Acceptance Criteria

1. THE Dashboard_Shell SHALL import module components using the `@/` path alias (e.g., `import UserManagement from "@/app/super-admin-dashboard/user-management/UserManagement"`).
2. THE Shared_Components SHALL be imported by modules using the `@/components/` alias (e.g., `import NotificationBanner from "@/components/NotificationBanner"`).
3. THE API_Layer SHALL be imported by all modules using `@/lib/api`.
4. WHEN a new module is added in the future, THE module SHALL follow the same alias-based import convention without requiring changes to `tsconfig.json`.

---

### Requirement 5: Routing Preservation

**User Story:** As a super admin, I want all navigation links and section switching to continue working after the refactor, so that my workflow is not disrupted.

#### Acceptance Criteria

1. THE Dashboard_Shell SHALL preserve the existing sidebar navigation buttons that set `activeSection` to `"overview"`, `"users"`, `"data"`, `"roles"`, and `"branch-category"`.
2. THE Dashboard_Shell SHALL preserve the existing `Link` components for `/payment-history`, `/employee-management`, and `/salary-deductions`.
3. WHEN a user clicks a sidebar navigation button, THE Dashboard_Shell SHALL render the corresponding module component without a full page reload.
4. THE Dashboard route (`/super-admin-dashboard`) SHALL remain at the same URL path after the refactor.

---

### Requirement 6: Functional Parity

**User Story:** As a super admin, I want all existing features to work exactly as before after the refactor, so that no functionality is lost.

#### Acceptance Criteria

1. THE User_Management_Module SHALL support creating, editing, deleting, and searching users with the same validation rules as the current implementation.
2. THE Role_Management_Module SHALL support creating and editing roles, and updating user statuses when a role status changes.
3. THE Branch_Category_Module SHALL support creating, editing, and deleting branches and categories, including the in-use guard that prevents deletion of branches or categories assigned to users.
4. THE Data_Management_Module SHALL display the same data overview table with entity names, keys, counts, and statuses.
5. WHEN the Dashboard page first loads, THE Dashboard_Shell SHALL call the overview stats API, load users, and load system data (roles, branches, categories) exactly as the current `useEffect` does.
6. IF any API call fails during initial load, THEN THE Dashboard_Shell SHALL keep the page usable and not throw an unhandled error, consistent with current behaviour.

---

### Requirement 7: Scalability

**User Story:** As a developer, I want the folder structure to support adding new modules easily, so that future features can be integrated without restructuring existing code.

#### Acceptance Criteria

1. THE Dashboard_Shell SHALL use a pattern (e.g., a section-to-component map or conditional rendering block) that allows a new module to be added by creating a new folder and registering one import and one render case.
2. THE module folder structure SHALL follow the convention `frontend/app/super-admin-dashboard/<module-name>/<ComponentName>.tsx` so that new modules are discoverable by convention.
3. WHERE a new module requires a new shared component, THE developer SHALL be able to add it to `frontend/components/` without modifying any existing module.
