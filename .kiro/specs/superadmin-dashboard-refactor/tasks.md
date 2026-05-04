# Tasks: Super Admin Dashboard Refactor

## Task List

- [ ] 1. Create shared types and NotificationBanner component
  - [x] 1.1 Create `frontend/lib/types.ts` exporting `Role`, `User`, `Branch`, `Category` interfaces (extracted verbatim from `super-admin-dashboard/page.tsx`)
  - [x] 1.2 Create `frontend/components/NotificationBanner.tsx` with props `type: 'success' | 'error'`, `message: string`, `onClose: () => void` — replicate the existing inline notification markup exactly

- [ ] 2. Implement `role-management/page.tsx`
  - [x] 2.1 Add `"use client"` directive, import `apiFetchAuth` from `@/lib/api`, types from `@/lib/types`, `NotificationBanner` from `@/components/NotificationBanner`
  - [x] 2.2 Import `./globals.css`
  - [x] 2.3 Move all role state (`roles`, `roleId`, `roleName`, `roleStatus`, `notification`) from the monolith
  - [x] 2.4 Move `loadRoles`, `saveRole`, `editRole`, `resetRoleForm`, `showNotification` handlers from the monolith
  - [x] 2.5 Add `useEffect` to call `loadRoles` on mount
  - [x] 2.6 Render sidebar with `<Link>` components matching the shell sidebar, with Role Management marked active
  - [x] 2.7 Render the role form and roles table UI (extracted from the monolith's `activeSection === "roles"` block)

- [ ] 3. Implement `branch-management/page.tsx`
  - [x] 3.1 Add `"use client"` directive, import `apiFetchAuth`, types, `NotificationBanner`
  - [x] 3.2 Import `./globals.css`
  - [x] 3.3 Move branch state (`branches`, `users`, `branchForm`, `isEditingBranch`, `branchSearch`, `notification`) and `districtMap` from the monolith
  - [x] 3.4 Move `loadBranches`, `loadUsers`, `saveBranch`, `editBranch`, `deleteBranch`, `handleBranchChange`, `showNotification` handlers
  - [x] 3.5 Add `useEffect` to call `loadBranches` and `loadUsers` on mount
  - [x] 3.6 Render sidebar with Branch Management marked active
  - [x] 3.7 Render the branch form and branches table UI (extracted from the monolith's branch sub-section)

- [ ] 4. Implement `category-management/page.tsx`
  - [ ] 4.1 Add `"use client"` directive, import `apiFetchAuth`, types, `NotificationBanner`
  - [~] 4.2 Import `./globals.css`
  - [~] 4.3 Move category state (`categories`, `users`, `categoryForm`, `isEditingCategory`, `categorySearch`, `notification`) from the monolith
  - [~] 4.4 Move `loadCategories`, `loadUsers`, `saveCategory`, `editCategory`, `deleteCategory`, `handleCategoryChange`, `showNotification` handlers
  - [~] 4.5 Add `useEffect` to call `loadCategories` and `loadUsers` on mount
  - [~] 4.6 Render sidebar with Category Management marked active
  - [~] 4.7 Render the category form and categories table UI (extracted from the monolith's category sub-section)

- [ ] 5. Implement `data-management/page.tsx`
  - [~] 5.1 Add `"use client"` directive, import `apiFetchAuth`, types
  - [~] 5.2 Import `./globals.css`
  - [~] 5.3 Move `roles`, `users` state and `dataTableRows` derivation from the monolith
  - [~] 5.4 Add `useEffect` to fetch `/roles` and `/users` on mount
  - [~] 5.5 Render sidebar with Data Management marked active
  - [~] 5.6 Render the data overview table UI (extracted from the monolith's `activeSection === "data"` block)

- [ ] 6. Implement `user-management/page.tsx`
  - [~] 6.1 Add `"use client"` directive, import `apiFetchAuth`, types, `NotificationBanner`
  - [~] 6.2 Import `./globals.css`
  - [~] 6.3 Move all user state (`users`, `roles`, `branches`, `categories`, `form`, `isEditing`, `isModalOpen`, `searchQuery`, `notification`) and `blankForm` from the monolith
  - [~] 6.4 Move `loadUsers`, `loadSystemData`, `saveUser`, `editUser`, `deleteUser`, `handleStatusApproval`, `handleDirectStatusChange`, `resetUserPassword`, `handleChange`, `resetForm`, `showNotification` handlers verbatim
  - [~] 6.5 Add `useEffect` to call `loadUsers` and `loadSystemData` on mount
  - [~] 6.6 Render sidebar with User Management marked active
  - [~] 6.7 Render the user list, search bar, and modal form UI (extracted from the monolith's `activeSection === "users"` block)
  - [~] 6.8 Replace inline notification markup inside the modal with `<NotificationBanner>`

- [ ] 7. Update `super-admin-dashboard/page.tsx` shell
  - [~] 7.1 Remove all module state, handlers, and section rendering blocks (users, roles, branches, categories, data)
  - [~] 7.2 Keep only overview stats state (`summary`, `usersByRole`), `metrics` array, and the overview `useEffect`
  - [~] 7.3 Replace sidebar `<button onClick={() => setActiveSection(...)}>` elements with `<Link href="...">` components pointing to each module route
  - [~] 7.4 Keep `<Link>` components for `/payment-history`, `/employee-management`, `/salary-deductions`
  - [~] 7.5 Render only the Overview metrics cards section in the main content area
  - [~] 7.6 Remove the `activeSection` state and all conditional section rendering

- [ ] 8. Write tests
  - [~] 8.1 Unit test: `NotificationBanner` renders message text and correct styling for `type='success'` and `type='error'`
  - [~] 8.2 Unit test: Dashboard Shell sidebar contains `<Link>` to each module route and the three external links
  - [~] 8.3 Unit test: `DataManagement` renders correct table rows given known `roles` and `users` arrays
  - [~] 8.4 Property test (Property 1): `NotificationBanner` renders for all valid `type`/`message` combinations using `fast-check`
  - [~] 8.5 Property test (Property 2): User form validation rejects submissions with any empty mandatory field
  - [~] 8.6 Property test (Property 3): In-use guard prevents `deleteBranch` and `deleteCategory` from calling the DELETE endpoint when the item is referenced by a user
  - [~] 8.7 Property test (Property 4): Any module page renders without throwing when `apiFetchAuth` throws for any subset of its endpoints
