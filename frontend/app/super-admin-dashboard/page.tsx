"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./globals.css";
import { apiFetchAuth } from "../../lib/api";

/* ── TYPES ── */
interface Role {
  id: number;
  name: string;
  status: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  national_id: string;
  date_of_birth: string;
  email: string;
  phone_number: string;
  branch: string;
  payment_method: string;
  payment_number: string;
  password?: string;
  roleId: number;
  status: string;
  category: string;
  contract_type: string;
  contract_start?: string;
  contract_end?: string;
  education_level: string;
  status_request?: string | null;
}

interface Category {
  id: number;
  name: string;
  code: string;
  status: string;
}

interface Salary {
  id: number;
  categoryId: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: string;
}

interface DeductionCategory {
  id: number;
  name: string;
  status: string;
}

interface SalaryDeduction {
  id: number;
  salaryId: number;
  deductionCategoryId: number;
  percentage: number;
  status: string;
}

interface ContractType {
  id: number;
  name: string;
  status: string;
}

interface Branch {
  id: number;
  name: string;
  hubId: string;
  province?: string;
  district?: string;
  status: string;
}

interface EducationLevel {
  id: number;
  name: string;
  status: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  branchId: number;
  categoryId: number;
  contractTypeId: number;
  levelId: number;
  status: string;
}

interface Payment {
  id: number;
  month: number;
  year: number;
  days: number;
  grossAmount: number;
  deductedAmount: number;
  paidNetAmount: number;
  employeeId: number;
  categoryId: number;
  salaryId: number;
  status: string;
}

/* ── INITIAL DATA ── */
const initialRoles: Role[] = [];
const appCategories: Category[] = [];
const appBranch: Branch[] = [];

const initialUsers: User[] = [];
const appSalary: Salary[] = [{ id: 1, categoryId: 1, grossAmount: 850000, deductions: 120000, netAmount: 730000, status: "ACTIVE" }];
const appDeductionCategory: DeductionCategory[] = [{ id: 1, name: "Tax", status: "ACTIVE" }, { id: 2, name: "Insurance", status: "ACTIVE" }];
const appSalaryDeductions: SalaryDeduction[] = [{ id: 1, salaryId: 1, deductionCategoryId: 1, percentage: 12, status: "ACTIVE" }];
const appContractType: ContractType[] = [{ id: 1, name: "Permanent", status: "ACTIVE" }, { id: 2, name: "Fixed Term", status: "ACTIVE" }];
const appEducationLevel: EducationLevel[] = [{ id: 1, name: "Diploma", status: "ACTIVE" }, { id: 2, name: "Degree", status: "ACTIVE" }];
const appEmployee: Employee[] = [{ id: 1, firstName: "Jean", lastName: "K.", nationalId: "1199887766554433", branchId: 1, categoryId: 1, contractTypeId: 1, levelId: 2, status: "ACTIVE" }];
const appPayment: Payment[] = [{ id: 1, month: 3, year: 2026, days: 30, grossAmount: 850000, deductedAmount: 120000, paidNetAmount: 730000, employeeId: 1, categoryId: 1, salaryId: 1, status: "PAID" }];

/* ── BLANK FORM ── */
const blankForm = {
  id: 0,
  name: "",
  username: "",
  national_id: "",
  date_of_birth: "",
  email: "",
  phone_number: "",
  branch: "",
  payment_method: "",
  payment_number: "",
  password: "Reg@12345",
  roleId: 0,
  status: "ACTIVE",
  category: "",
  contract_type: "",
  contract_start: "",
  contract_end: "",
  education_level: "",
};

/* ══════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════ */
export default function SuperAdminDashboard() {
  const router = useRouter();
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    lockedUsers: 0,
    totalEmployees: 0,
    activeRoles: 0,
  });
  const [usersByRole, setUsersByRole] = useState<
    Array<{ role: string; _count: { role: number } }>
  >([]);

  /* ── state ── */
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "data" | "roles" | "branch-category">("overview");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleStatus, setRoleStatus] = useState("ACTIVE");
  const [form, setForm] = useState({ ...blankForm });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  /* ── Branch / Category State ── */
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchForm, setBranchForm] = useState({ id: 0, name: "", hubId: "", province: "Kigali City", district: "Nyarugenge", status: "ACTIVE" });
  const [isEditingBranch, setIsEditingBranch] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryForm, setCategoryForm] = useState({ id: 0, name: "", code: "", status: "ACTIVE" });
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  /* ── Dynamic Districts ── */
  const districtMap: Record<string, string[]> = {
    "North": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
    "East": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
    "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
    "South": ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
    "West": ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"]
  };

  function resetRoleForm() {
    setRoleId(null);
    setRoleName("");
    setRoleStatus("ACTIVE");
  }

  async function saveRole(e: React.FormEvent) {
    e.preventDefault();
    if (!roleName.trim()) return;

    try {
      if (roleId) {
        await apiFetchAuth(`/roles/${roleId}`, {
          method: "PATCH",
          body: JSON.stringify({ role_name: roleName, status: roleStatus })
        });
        await apiFetchAuth(`/users/role-status`, {
          method: "PATCH",
          body: JSON.stringify({ roleName: roleName, status: roleStatus })
        });
        showNotification('success', `Role ${roleName} status updated.`);
      } else {
        await apiFetchAuth(`/roles`, {
          method: "POST",
          body: JSON.stringify({ role_name: roleName, status: roleStatus })
        });
        showNotification('success', 'Role saved successfully');
      }
      loadSystemData();
      resetRoleForm();
    } catch (err: any) {
      showNotification('error', err.message || `Failed to save role.`);
    }
  }

  function editRole(id: number) {
    const role = roles.find(r => r.id === id);
    if (!role) return;
    setRoleId(role.id);
    setRoleName(role.name);
    setRoleStatus(role.status);
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  /* ── Branch Handlers ── */
  const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setBranchForm(prev => {
      const next = { ...prev, [id === "branchName" ? "name" : id === "branchStatus" ? "status" : id]: id === "hubId" ? Number(value) : value };
      if (id === "province") {
        next.district = districtMap[value][0]; // reset district
      }
      return next;
    });
  };

  const saveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        branch_name: branchForm.name,
        branch_code: branchForm.hubId.toString(),
        province: branchForm.province,
        district: branchForm.district,
        status: branchForm.status
      };

      if (isEditingBranch) {
        await apiFetchAuth(`/branches/${branchForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetchAuth(`/branches`, {
          method: "POST",
          body: JSON.stringify({ ...payload, address_line1: 'N/A', city: branchForm.district })
        });
      }
      setBranchForm({ id: 0, name: "", hubId: "", province: "Kigali City", district: "Nyarugenge", status: "ACTIVE" });
      setIsEditingBranch(false);
      showNotification('success', 'Branch saved successfully');
      loadSystemData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save branch');
    }
  };

  const editBranch = (id: number) => {
    const b = branches.find(x => x.id === id);
    if (b) {
      setBranchForm({ id: b.id, name: b.name, hubId: b.hubId, province: b.province || "Kigali City", district: b.district || "Nyarugenge", status: b.status });
      setIsEditingBranch(true);
    }
  };

  const deleteBranch = async (id: number) => {
    const b = branches.find(x => x.id === id);
    if (!b) return;
    const isInUse = users.some(u => u.branch === b.name);
    if (isInUse) {
      showNotification('error', 'Branch cannot be deleted because it is in use by one or more users.');
      return;
    }
    try {
      await apiFetchAuth(`/branches/${id}`, { method: "DELETE" });
      showNotification('success', 'Branch deleted successfully');
      loadSystemData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete branch');
    }
  };

  /* ── Category Handlers ── */
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [id === "categoryName" ? "name" : id === "categoryCode" ? "code" : id === "categoryStatus" ? "status" : id]: id === "categoryCode" ? value.toUpperCase() : value,
    }));
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        category_name: categoryForm.name,
        category_code: categoryForm.code,
        status: categoryForm.status
      };

      if (isEditingCategory) {
        await apiFetchAuth(`/categories/${categoryForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetchAuth(`/categories`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setCategoryForm({ id: 0, name: "", code: "", status: "ACTIVE" });
      setIsEditingCategory(false);
      showNotification('success', 'Category saved successfully');
      loadSystemData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save category');
    }
  };

  const editCategory = (id: number) => {
    const c = categories.find(x => x.id === id);
    if (c) {
      setCategoryForm({ id: c.id, name: c.name, code: c.code, status: c.status });
      setIsEditingCategory(true);
    }
  };

  const deleteCategory = async (id: number) => {
    const c = categories.find(x => x.id === id);
    if (!c) return;
    const isInUse = users.some(u => u.category === c.name);
    if (isInUse) {
      showNotification('error', 'Category cannot be deleted because it is in use by one or more users.');
      return;
    }
    try {
      await apiFetchAuth(`/categories/${id}`, { method: "DELETE" });
      showNotification('success', 'Category deleted successfully');
      loadSystemData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete category');
    }
  };

  const loadUsers = async (q = "") => {
    try {
      const authUsers = await apiFetchAuth<Array<any>>(`/users${q ? `?q=${q}` : ''}`);
      if (authUsers) {
        const mappedUsers = authUsers.map((u: any) => ({
          id: u.user_id,
          name: u.full_name || u.username,
          username: u.username || "",
          national_id: u.national_id || u.profile?.national_id || "",
          date_of_birth: u.date_of_birth || u.profile?.date_of_birth || "",
          email: u.email || "",
          phone_number: u.phone_number || u.profile?.phone_number || "",
          branch: u.branch || u.profile?.branch || "",
          payment_method: u.payment_method || u.profile?.payment_method || "",
          payment_number: u.payment_number || u.profile?.payment_number || "",
          password: "•••",
          roleId: u.role === "SuperAdmin" ? 1 : u.role === "Employee" ? 3 : 2,
          status: u.is_locked ? "LOCKED" : !u.is_active ? "BLOCKED" : "ACTIVE",
          category: u.category || u.profile?.category || "",
          contract_type: u.contract_type || u.profile?.contract_type || "",
          contract_start: u.contract_start || u.profile?.contract_start || "",
          contract_end: u.contract_end || u.profile?.contract_end || "",
          education_level: u.education_level || u.profile?.education_level || "",
          status_request: u.profile?.status_request || null,
        }));
        setUsers(mappedUsers);
      }
    } catch { }
  };

  const loadSystemData = async () => {
    try {
      const [fetchedRoles, fetchedBranches, fetchedCategories] = await Promise.all([
        apiFetchAuth<any[]>("/roles"),
        apiFetchAuth<any[]>("/branches"),
        apiFetchAuth<any[]>("/categories")
      ]);
      
      if (fetchedRoles) {
        setRoles(fetchedRoles.map(r => ({ id: r.role_id, name: r.role_name, status: r.status })));
      }
      if (fetchedBranches) {
        setBranches(fetchedBranches.map(b => ({ id: b.branch_id, name: b.branch_name, hubId: b.branch_code, province: b.province, district: b.district, status: b.status })));
      }
      if (fetchedCategories) {
        setCategories(fetchedCategories.map(c => ({ id: c.category_id, name: c.category_name, code: c.category_code, status: c.status })));
      }
    } catch {}
  };

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [stats, byRole] = await Promise.all([
          apiFetchAuth<{
            totalUsers: number;
            activeUsers: number;
            blockedUsers: number;
            lockedUsers: number;
            totalEmployees: number;
            activeRoles: number;
          }>("/stats/users"),
          apiFetchAuth<Array<{ role: string; _count: { role: number } }>>("/stats/users-by-role"),
        ]);
        setSummary(stats);
        setUsersByRole(byRole);
      } catch {
        // keep page usable if API temporarily fails
      }
    };
    loadOverview();
    loadUsers();
    loadSystemData();
  }, []);

  /* ── helpers ── */
  const roleNameById = (roleId: number): string =>
    roles.find((r) => r.id === roleId)?.name ?? "Unknown";

  const roleCount = (role: string): number =>
    usersByRole.find((r) => r.role === role)?._count.role ?? 0;

  /* ── overview metrics ── */
  const metrics = [
    { label: "Total Users", value: summary.totalUsers },
    { label: "Total Employees", value: summary.totalEmployees },
    { label: "Payments", value: appPayment.length },
    { label: "Active Roles", value: summary.activeRoles },
  ];

  /* ── data table rows ── */
  const dataTableRows = [
    { name: "Category", keys: "id, name, code, status", count: appCategories.length, status: "ACTIVE" },
    { name: "Salary", keys: "id, categoryId, grossAmount, netAmount, status", count: appSalary.length, status: "ACTIVE" },
    { name: "Deduction Category", keys: "id, name, status", count: appDeductionCategory.length, status: "ACTIVE" },
    { name: "Salary Deductions", keys: "id, salaryId, deductionCategoryId, percentage", count: appSalaryDeductions.length, status: "ACTIVE" },
    { name: "Contract Type", keys: "id, name, status", count: appContractType.length, status: "ACTIVE" },
    { name: "Branch", keys: "id, name, hubId, status", count: appBranch.length, status: "ACTIVE" },
    { name: "Education Level", keys: "id, name, status", count: appEducationLevel.length, status: "ACTIVE" },
    { name: "Employee", keys: "id, firstName, lastName, branchId, categoryId", count: appEmployee.length, status: "ACTIVE" },
    { name: "Payment", keys: "id, month, year, employeeId, paidNetAmount, status", count: appPayment.length, status: "PAID/CANCELLED" },
    { name: "Role", keys: "id, name, status", count: roles.length, status: "ACTIVE" },
    { name: "User", keys: "id, name, username, roleId, status", count: users.length, status: "ACTIVE/BLOCKED/LOCKED" },
  ];

  /* ── form handlers ── */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    const keyMap: Record<string, string> = {
      userName: "name",
      userUsername: "username",
      userPassword: "password",
      userRole: "roleId",
      userStatus: "status",
    };
    const key = keyMap[id] ?? id;
    setForm((prev) => ({
      ...prev,
      [key]: key === "roleId" ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setForm({ ...blankForm, roleId: 0 });
    setIsEditing(false);
    setIsModalOpen(false);
  };

  const editUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setForm({
      id: user.id,
      name: user.name,
      username: user.username || "",
      national_id: user.national_id || "",
      date_of_birth: user.date_of_birth || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      branch: user.branch || "",
      payment_method: user.payment_method || "",
      payment_number: user.payment_number || "",
      password: "",
      roleId: user.roleId,
      status: user.status,
      category: user.category || "",
      contract_type: user.contract_type || "",
      contract_start: user.contract_start ? new Date(user.contract_start).toISOString().split('T')[0] : "",
      contract_end: user.contract_end ? new Date(user.contract_end).toISOString().split('T')[0] : "",
      education_level: user.education_level || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("Delete this user?")) return;
    try {
      await apiFetchAuth(`/users/${userId}`, { method: 'DELETE' });
      loadUsers(searchQuery);
    } catch {
      alert("Failed to delete user");
    }
  };

  const handleStatusApproval = async (userId: number, action: 'APPROVE_PENDING' | 'REJECT_PENDING') => {
    try {
      await apiFetchAuth(`/users/status`, {
        method: "PATCH",
        body: JSON.stringify({ userId, status: action, reason: action === 'APPROVE_PENDING' ? 'Approved by SuperAdmin' : 'Rejected by SuperAdmin' })
      });
      showNotification('success', `Status request ${action === 'APPROVE_PENDING' ? 'approved' : 'rejected'} successfully.`);
      loadUsers(searchQuery);
    } catch (err: any) {
      showNotification('error', "Failed to process status approval.");
    }
  };

  const handleDirectStatusChange = async (userId: number, newStatus: string) => {
    try {
      await apiFetchAuth(`/users/status`, {
        method: "PATCH",
        body: JSON.stringify({ userId, status: newStatus, reason: `Direct status change to ${newStatus}` })
      });
      showNotification('success', `Status changed to ${newStatus} successfully.`);
      loadUsers(searchQuery);
    } catch (err: any) {
      showNotification('error', "Failed to change status.");
    }
  };

  const resetUserPassword = async (userId: number) => {
    if (!confirm("Send password reset email to this user?")) return;
    try {
      await apiFetchAuth(`/users/${userId}/reset-password`, { method: 'POST' });
      alert("Password reset email sent.");
    } catch {
      alert("Failed to reset password.");
    }
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!form.name.trim() || !form.email.trim() || !form.national_id.trim() || !form.phone_number.trim()) {
      showNotification('error', "Please fill all mandatory fields (Full Name, Email, National ID, Telephone).");
      return;
    }

    if (form.roleId === 2 && !form.branch.trim()) {
      showNotification('error', "Please select a Branch for the Admin role.");
      return;
    }

    if (form.roleId === 0) {
      showNotification('error', "Please select a Role.");
      return;
    }

    const generatedUsername = form.username || form.email.split("@")[0];

    // Primary key constraint check
    const errors: string[] = [];
    users.forEach(u => {
      if (u.id === form.id) return;
      if (form.national_id && u.national_id === form.national_id) errors.push("National ID already exists.");
      if (form.email && u.email === form.email) errors.push("Email already exists.");
      if (form.phone_number && u.phone_number === form.phone_number) errors.push("Telephone Number already exists.");
      if (generatedUsername && u.username === generatedUsername) errors.push("Username already exists.");
      if (form.payment_number && u.payment_number === form.payment_number) errors.push("Payment Number already exists.");
    });
    
    if (errors.length > 0) {
      const uniqueErrors = Array.from(new Set(errors));
      showNotification('error', uniqueErrors.join("\n"));
      return;
    }

    const payload = {
      full_name: form.name,
      username: generatedUsername,
      email: form.email,
      national_id: form.national_id,
      phone_number: form.phone_number,
      branch: form.branch,
      date_of_birth: form.date_of_birth,
      payment_method: form.payment_method,
      payment_number: form.payment_number,
      category: form.category,
      contract_type: form.contract_type,
      contract_start: form.contract_start,
      contract_end: form.contract_end,
      education_level: form.education_level,
      status: form.status,
      role: form.roleId === 1 ? 'SuperAdmin' : form.roleId === 3 ? 'Employee' : 'BranchHR',
      ...(isEditing ? {} : { password: form.password || 'Reg@12345' })
    };

    try {
      if (isEditing && form.id) {
        await apiFetchAuth(`/users/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        showNotification('success', "User details updated successfully.");
      } else {
        await apiFetchAuth(`/users`, { method: 'POST', body: JSON.stringify(payload) });
        showNotification('success', "User created successfully.");
      }
      resetForm();
      loadUsers(searchQuery);
    } catch (err: any) {
      let errorMsg = err.message || "An unexpected error occurred while saving.";
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.statusCode === 401) {
          errorMsg = "Your session has expired or you do not have permission to perform this action. Please log in again.";
        } else if (parsed.message) {
          errorMsg = Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
        }
      } catch (e) {
        if (errorMsg.includes("401") || errorMsg.toLowerCase().includes("unauthorized")) {
          errorMsg = "Your session has expired or you do not have permission. Please log in again.";
        } else if (errorMsg.includes("Failed to fetch")) {
          errorMsg = "Unable to connect to the server. Please check your internet connection.";
        }
      }
      showNotification('error', errorMsg);
    }
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="app-layout">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-title">Reserve Force Payroll</div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item${activeSection === "overview" ? " active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </button>
          <button
            className={`nav-item${activeSection === "users" ? " active" : ""}`}
            onClick={() => setActiveSection("users")}
          >
            User Management
          </button>
          <button
            className={`nav-item${activeSection === "data" ? " active" : ""}`}
            onClick={() => setActiveSection("data")}
          >
            Data Management
          </button>
          <button
            className={`nav-item${activeSection === "roles" ? " active" : ""}`}
            onClick={() => setActiveSection("roles")}
          >
            Role Management
          </button>
          <button
            className={`nav-item${activeSection === "branch-category" ? " active" : ""}`}
            onClick={() => setActiveSection("branch-category")}
          >
            Branch &amp; Category Settings
          </button>
          <Link className="nav-link" href="/payment-history">Payment History</Link>
          <Link className="nav-link" href="/employee-management">Employee Management</Link>
          <Link className="nav-link" href="/salary-deductions">Salary Deductions Setup</Link>
        </nav>
      </aside>

      {/* ── CONTENT ── */}
      <div className="content">
        <header className="topbar">
          <h1>Super Admin Dashboard</h1>
          <button id="logoutBtn" className="logout-btn" onClick={() => router.push("/")}>
            Logout
          </button>
        </header>

        <main className="main-content">

          {/* ══ OVERVIEW ══ */}
          {activeSection === "overview" && (
            <section id="overview" className="section active">
              <div className="cards-grid" id="overviewCards">
                {metrics.map((m) => (
                  <article className="metric-card" key={m.label}>
                    <h3>{m.label}</h3>
                    <p>{m.value}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ══ USER MANAGEMENT ══ */}
          {activeSection === "users" && (
            <section id="users" className="section active">


              {/* User Modal Form */}
              {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                  <div className="panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                    <button type="button" onClick={resetForm} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
                    <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>{isEditing ? "Edit User Details" : "Create New User"}</h2>
                    {notification && (
                      <div style={{
                        padding: '12px 16px',
                        marginBottom: '1rem',
                        borderRadius: '6px',
                        backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: notification.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        fontWeight: 500
                      }}>
                        <span style={{ whiteSpace: 'pre-wrap' }}>{notification.message}</span>
                        <button type="button" onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit', marginLeft: '10px' }}>&times;</button>
                      </div>
                    )}
                    <form id="userForm" className="user-form" onSubmit={saveUser}>
                      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem' }}>
                        <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                          <label htmlFor="userRole">Role *</label>
                          <select id="userRole" value={form.roleId} onChange={handleChange} required>
                            <option value={0} disabled>Select a role...</option>
                            {roles.filter((r) => r.status === "ACTIVE").map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          {form.roleId === 0 && (
                            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              Select a role to configure the appropriate user details.
                            </p>
                          )}
                        </div>

                        {form.roleId !== 0 && (
                          <>
                            <div className="field-group">
                              <label htmlFor="national_id">National ID *</label>
                              <input type="text" id="national_id" value={form.national_id} onChange={handleChange} required />
                            </div>
                            <div className="field-group">
                              <label htmlFor="userName">Full Name *</label>
                              <input type="text" id="userName" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className="field-group">
                              <label htmlFor="userUsername">Username</label>
                              <input type="text" id="userUsername" value={form.username} onChange={handleChange} />
                            </div>
                            <div className="field-group">
                              <label htmlFor="phone_number">Telephone *</label>
                              <input type="text" id="phone_number" value={form.phone_number} onChange={handleChange} required />
                            </div>
                            <div className="field-group">
                              <label htmlFor="email">Email *</label>
                              <input type="email" id="email" value={form.email} onChange={handleChange} required />
                            </div>

                            {form.roleId === 2 && (
                              <div className="field-group">
                                <label htmlFor="branch">Branch *</label>
                                <select id="branch" value={form.branch} onChange={handleChange} required>
                                  <option value="">Select Branch</option>
                                  <option value="All">All</option>
                                  {branches.filter(b => b.status === "ACTIVE").map(b => <option key={`role2-${b.id}`} value={b.name}>{b.name}</option>)}
                                </select>
                              </div>
                            )}

                            {form.roleId !== 1 && form.roleId !== 2 && (
                              <>
                                <div className="field-group">
                                  <label htmlFor="date_of_birth">Date of Birth</label>
                                  <input type="date" id="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
                                </div>
                                <div className="field-group">
                                  <label htmlFor="branch">Branch</label>
                                  <select id="branch" value={form.branch} onChange={handleChange}>
                                    <option value="">Select Branch</option>
                                    {branches.filter(b => b.status === "ACTIVE").map(b => <option key={`role3-${b.id}`} value={b.name}>{b.name}</option>)}
                                  </select>
                                </div>
                                <div className="field-group">
                                  <label htmlFor="payment_method">Payment Method</label>
                                  <select id="payment_method" value={form.payment_method} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="Telephone">Telephone</option>
                                    <option value="Bank account">Bank account</option>
                                  </select>
                                </div>
                                <div className="field-group">
                                  <label htmlFor="payment_number">Payment Number</label>
                                  <input type="text" id="payment_number" value={form.payment_number} onChange={handleChange} />
                                </div>
                                <div className="field-group">
                                  <label htmlFor="userStatus">Status *</label>
                                  <select id="userStatus" value={form.status} onChange={handleChange} required>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="BLOCKED">BLOCKED</option>
                                    <option value="LOCKED">LOCKED</option>
                                  </select>
                                </div>
                                <div className="field-group">
                                  <label htmlFor="category">Category</label>
                                  <select id="category" value={form.category} onChange={handleChange}>
                                    <option value="">Select Category</option>
                                    {categories.filter(c => c.status === "ACTIVE").map(c => <option key={"cat-" + c.id} value={c.name}>{c.name}</option>)}
                                  </select>
                                </div>
                                <div className="field-group">
                                  <label htmlFor="contract_type">Contract Type</label>
                                  <select id="contract_type" value={form.contract_type} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="Permanent">Permanent</option>
                                    <option value="Fixed Term">Fixed Term</option>
                                  </select>
                                </div>
                                <div className="field-group">
                                  <label htmlFor="education_level">Education Level</label>
                                  <select id="education_level" value={form.education_level} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="non-Study">non-Study</option>
                                    <option value="primary level">primary level</option>
                                    <option value="A2">A2</option>
                                    <option value="A1">A1</option>
                                    <option value="A0">A0</option>
                                    <option value="Masters Degree">Masters Degree</option>
                                    <option value="PHD">PHD</option>
                                  </select>
                                </div>
                                <div className="field-group">
                                  <label htmlFor="contract_start">Contract Start Date</label>
                                  <input type="date" id="contract_start" value={form.contract_start} onChange={handleChange} />
                                </div>
                                <div className="field-group">
                                  <label htmlFor="contract_end">Contract End Date</label>
                                  <input type="date" id="contract_end" value={form.contract_end} onChange={handleChange} />
                                </div>
                              </>
                            )}

                            {!isEditing && (
                              <div className="field-group">
                                <label htmlFor="userPassword">Password</label>
                                <input type="text" id="userPassword" value={form.password} onChange={handleChange} required />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="user-form-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
                        <button type="button" className="secondary-btn" id="cancelEditBtn" onClick={resetForm} style={{ padding: '0.6rem 1.5rem' }}>
                          Cancel
                        </button>
                        <button type="submit" className="primary-btn" id="saveUserBtn" style={{ padding: '0.6rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                          {isEditing ? "Update User" : "Save User"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="panel" style={{ marginTop: isModalOpen ? '0' : '2rem' }}>
                {notification && !isModalOpen && (
                  <div style={{
                    padding: '12px 16px',
                    marginBottom: '1rem',
                    borderRadius: '6px',
                    backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: notification.type === 'success' ? '#166534' : '#991b1b',
                    border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 500
                  }}>
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit' }}>&times;</button>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0 }}>System Users</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                      onClick={() => { resetForm(); setIsModalOpen(true); }}
                      style={{ padding: '0.6rem 1.2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Register User
                    </button>
                    <input
                      type="text"
                      placeholder="Search Users..."
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); loadUsers(e.target.value); }}
                      className="search-bar"
                      style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px', minWidth: '300px' }}
                    />
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>National ID</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Branch</th>
                        <th>Role</th>
                        <th>Contract Type</th>
                        <th>Education Level</th>
                        <th>Payment Method</th>
                        <th>Payment Number</th>
                        <th>Lifespan</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="usersTableBody">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>{user.national_id || "-"}</td>
                          <td>{user.name}</td>
                          <td>{user.email || "-"}</td>
                          <td>{user.phone_number || "-"}</td>
                          <td>{user.branch || "-"}</td>
                          <td>{roleNameById(user.roleId)}</td>
                          <td>{user.contract_type || "-"}</td>
                          <td>{user.education_level || "-"}</td>
                          <td>{user.payment_method || "-"}</td>
                          <td>{user.payment_number || "-"}</td>
                          <td style={{ fontSize: '0.9em' }}>
                            ({user.contract_start ? new Date(user.contract_start).toLocaleDateString() : "?"} to {user.contract_end ? new Date(user.contract_end).toLocaleDateString() : "?"})
                          </td>
                          <td>
                            {user.status_request ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <span className={`status-badge ${user.status.toLowerCase()}`} style={{
                                  backgroundColor: user.status === 'ACTIVE' ? '#dcfce7' : user.status === 'LOCKED' ? '#ffedd5' : user.status === 'BLOCKED' ? '#fee2e2' : undefined,
                                  color: user.status === 'ACTIVE' ? '#166534' : user.status === 'LOCKED' ? '#9a3412' : user.status === 'BLOCKED' ? '#991b1b' : undefined,
                                }}>{user.status === 'ACTIVE' ? 'Active' : user.status === 'LOCKED' ? 'Locked' : user.status === 'BLOCKED' ? 'Blocked' : user.status}</span>
                                <span className="status-badge warning" style={{ fontSize: '0.8em', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                  Req: {user.status_request}
                                </span>
                              </div>
                            ) : (
                              <span className={`status-badge ${user.status.toLowerCase()}`} style={{
                                backgroundColor: user.status === 'ACTIVE' ? '#dcfce7' : user.status === 'LOCKED' ? '#ffedd5' : user.status === 'BLOCKED' ? '#fee2e2' : undefined,
                                color: user.status === 'ACTIVE' ? '#166534' : user.status === 'LOCKED' ? '#9a3412' : user.status === 'BLOCKED' ? '#991b1b' : undefined,
                              }}>{user.status === 'ACTIVE' ? 'Active' : user.status === 'LOCKED' ? 'Locked' : user.status === 'BLOCKED' ? 'Blocked' : user.status}</span>
                            )}
                          </td>
                          <td>
                            <div className="actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <button className="link-btn primary" onClick={() => editUser(user.id)}>Edit</button>
                              <button className="link-btn warning" onClick={() => resetUserPassword(user.id)}>Reset Auth</button>
                              <button className="link-btn delete" onClick={() => deleteUser(user.id)}>Delete</button>

                              {user.status !== 'LOCKED' && (
                                <button className="link-btn warning" style={{ color: '#9a3412', borderColor: '#9a3412' }} onClick={() => handleDirectStatusChange(user.id, 'LOCKED')}>Lock</button>
                              )}
                              {user.status !== 'BLOCKED' && (
                                <button className="link-btn delete" onClick={() => handleDirectStatusChange(user.id, 'BLOCKED')}>Block</button>
                              )}
                              {user.status !== 'ACTIVE' && (
                                <button className="link-btn primary" style={{ color: '#166534', borderColor: '#166534' }} onClick={() => handleDirectStatusChange(user.id, 'ACTIVE')}>Activate</button>
                              )}

                              {user.status_request && (
                                <select
                                  style={{ padding: '4px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85em', background: '#fef3c7', borderColor: '#fcd34d', fontWeight: 'bold' }}
                                  defaultValue=""
                                  onChange={(e) => { handleStatusApproval(user.id, e.target.value as any); e.target.value = ""; }}
                                >
                                  <option value="" disabled>Request from HR</option>
                                  <option value="APPROVE_PENDING">✓ Approve</option>
                                  <option value="REJECT_PENDING">✗ Reject</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ══ DATA MANAGEMENT ══ */}
          {activeSection === "data" && (
            <section id="data" className="section active">
              <div className="panel">
                <h2>Reserve Force Data Tables</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Table Name</th>
                        <th>Key Fields</th>
                        <th>Records</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody id="dataTablesBody">
                      {dataTableRows.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>{row.keys}</td>
                          <td>{row.count}</td>
                          <td>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ══ ROLE MANAGEMENT ══ */}
          {activeSection === "roles" && (
            <section id="roles" className="section active">
              {/* ROLE FORM */}
              <div className="panel" style={{ marginBottom: '2rem' }}>
                <h2>Role Form</h2>
                <form className="form-grid" onSubmit={saveRole}>
                  <div className="field-group">
                    <label>Role Name</label>
                    <input
                      type="text"
                      placeholder="Super Admin / Admin / User / Auditor"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label>Status</label>
                    <select
                      value={roleStatus}
                      onChange={(e) => setRoleStatus(e.target.value)}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="primary-btn">Save Role</button>
                    <button type="button" className="secondary-btn" onClick={resetRoleForm}>Cancel</button>
                  </div>
                </form>
              </div>

              {/* ROLES TABLE */}
              <div className="panel">
                <h2>System Roles</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Role Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(role => (
                        <tr key={role.id}>
                          <td>{role.name}</td>
                          <td>
                            <span className={`status-badge ${role.status.toLowerCase()}`} style={{
                              backgroundColor: role.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                              color: role.status === 'ACTIVE' ? '#166534' : '#991b1b',
                            }}>
                              {role.status}
                            </span>
                          </td>
                          <td>
                            <div className="actions">
                              <button className="link-btn primary" onClick={() => editRole(role.id)}>Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ══ BRANCH & CATEGORY SETTINGS ══ */}
          {activeSection === "branch-category" && (
            <section id="branch-category" className="section active">
              <div className="panel" style={{ marginBottom: '2rem' }}>
                <h2>Branch Setup Form</h2>
                <form className="form-grid" onSubmit={saveBranch}>
                  <div className="field-group">
                    <label htmlFor="branchName">Branch Name</label>
                    <input id="branchName" type="text" placeholder="e.g., Kigali Central" value={branchForm.name} onChange={handleBranchChange} required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="hubId">Branch ID</label>
                    <input id="hubId" type="text" placeholder="e.g., 101" value={branchForm.hubId} onChange={handleBranchChange} required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="province">Province</label>
                    <select id="province" value={branchForm.province} onChange={handleBranchChange} required>
                      {Object.keys(districtMap).map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="district">District</label>
                    <select id="district" value={branchForm.district} onChange={handleBranchChange} required>
                      {(districtMap[branchForm.province || "Kigali City"] || []).map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field-group">
                    <label htmlFor="branchStatus">Status</label>
                    <select id="branchStatus" value={branchForm.status} onChange={handleBranchChange} required>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="primary-btn">{isEditingBranch ? "Update Branch" : "Save Branch"}</button>
                    <button type="button" className="secondary-btn" onClick={() => { setBranchForm({ id: 0, name: "", hubId: "", province: "Kigali City", district: "Nyarugenge", status: "ACTIVE" }); setIsEditingBranch(false); }}>Cancel</button>
                  </div>
                </form>
              </div>

              <div className="panel" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>System Branches</h2>
                  <input
                    type="text"
                    placeholder="Search Branch Name, ID or Status..."
                    value={branchSearch}
                    onChange={(e) => setBranchSearch(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '300px' }}
                  />
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Branch Name</th>
                        <th>Branch ID</th>
                        <th>Province</th>
                        <th>District</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {branches
                        .filter(b => 
                          b.name.toLowerCase().includes(branchSearch.toLowerCase()) || 
                          b.hubId.toString().includes(branchSearch) || 
                          b.status.toLowerCase().includes(branchSearch.toLowerCase())
                        )
                        .map(item => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.hubId}</td>
                          <td>{item.province || "N/A"}</td>
                          <td>{item.district || "N/A"}</td>
                          <td>
                            <span className={`status-badge ${item.status.toLowerCase()}`} style={{
                              backgroundColor: item.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                              color: item.status === 'ACTIVE' ? '#166534' : '#991b1b',
                            }}>{item.status}</span>
                          </td>
                          <td>
                            <div className="actions">
                              <button className="link-btn primary" onClick={() => editBranch(item.id)}>Edit</button>
                              <button className="link-btn delete" onClick={() => deleteBranch(item.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel" style={{ marginBottom: '2rem' }}>
                <h2>Category Setup Form</h2>
                <form className="form-grid" onSubmit={saveCategory}>
                  <div className="field-group">
                    <label htmlFor="categoryName">Category Name</label>
                    <input id="categoryName" type="text" placeholder="e.g., Officer" value={categoryForm.name} onChange={handleCategoryChange} required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="categoryCode">Category Code</label>
                    <input id="categoryCode" type="text" placeholder="e.g., OFC" value={categoryForm.code} onChange={handleCategoryChange} required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="categoryStatus">Status</label>
                    <select id="categoryStatus" value={categoryForm.status} onChange={handleCategoryChange} required>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="primary-btn">{isEditingCategory ? "Update Category" : "Save Category"}</button>
                    <button type="button" className="secondary-btn" onClick={() => { setCategoryForm({ id: 0, name: "", code: "", status: "ACTIVE" }); setIsEditingCategory(false); }}>Cancel</button>
                  </div>
                </form>
              </div>

              <div className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>System Categories</h2>
                  <input
                    type="text"
                    placeholder="Search Category Name, Code or Status..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minWidth: '300px' }}
                  />
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Category Code</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories
                        .filter(c => 
                          c.name.toLowerCase().includes(categorySearch.toLowerCase()) || 
                          c.code.toLowerCase().includes(categorySearch.toLowerCase()) || 
                          c.status.toLowerCase().includes(categorySearch.toLowerCase())
                        )
                        .map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.code}</td>
                          <td>
                            <span className={`status-badge ${item.status.toLowerCase()}`} style={{
                              backgroundColor: item.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                              color: item.status === 'ACTIVE' ? '#166534' : '#991b1b',
                            }}>{item.status}</span>
                          </td>
                          <td>
                            <div className="actions">
                              <button className="link-btn primary" onClick={() => editCategory(item.id)}>Edit</button>
                              <button className="link-btn delete" onClick={() => deleteCategory(item.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}