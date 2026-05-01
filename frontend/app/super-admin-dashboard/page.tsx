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
  hubId: number;
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
const initialRoles: Role[] = [
  { id: 1, name: "Super Admin", status: "ACTIVE" },
  { id: 2, name: "Admin", status: "ACTIVE" },
  { id: 3, name: "User", status: "ACTIVE" },
  { id: 4, name: "Auditor", status: "ACTIVE" },
];

const initialUsers: User[] = [];

const appCategories: Category[] = [{ id: 1, name: "Officer", code: "OFC", status: "ACTIVE" }, { id: 2, name: "Soldier", code: "SLD", status: "ACTIVE" }];
const appSalary: Salary[] = [{ id: 1, categoryId: 1, grossAmount: 850000, deductions: 120000, netAmount: 730000, status: "ACTIVE" }];
const appDeductionCategory: DeductionCategory[] = [{ id: 1, name: "Tax", status: "ACTIVE" }, { id: 2, name: "Insurance", status: "ACTIVE" }];
const appSalaryDeductions: SalaryDeduction[] = [{ id: 1, salaryId: 1, deductionCategoryId: 1, percentage: 12, status: "ACTIVE" }];
const appContractType: ContractType[] = [{ id: 1, name: "Permanent", status: "ACTIVE" }, { id: 2, name: "Fixed Term", status: "ACTIVE" }];
const appBranch: Branch[] = [{ id: 1, name: "Kigali Branch", hubId: 1, status: "ACTIVE" }];
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
  roleId: 3,
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
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "data">("overview");
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [roles] = useState<Role[]>(initialRoles);
  const [form, setForm] = useState({ ...blankForm });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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
          status: u.is_active ? "ACTIVE" : u.is_locked ? "LOCKED" : "BLOCKED",
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
    setForm({ ...blankForm, roleId: roles[0]?.id ?? 1 });
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
      showNotification('error', "Please fill all mandatory fields (Name, Email, National ID, Phone Number).");
      return;
    }

    const generatedUsername = form.username || form.email.split("@")[0];

    // Primary key constraint check
    const isDuplicate = users.some(u =>
      u.id !== form.id && (
        u.national_id === form.national_id ||
        u.email === form.email ||
        u.phone_number === form.phone_number ||
        (u.username && u.username === generatedUsername) ||
        (form.payment_number && u.payment_number === form.payment_number)
      )
    );
    if (isDuplicate) {
      showNotification('error', "Error: National ID, Username, Email, Telephone Number, or Payment Number there is one already exists for another user.");
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
          <Link className="nav-link" href="/role-management">Role Management</Link>
          <Link className="nav-link" href="/branch-category-settings">Branch &amp; Category Settings</Link>
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
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontWeight: 500
                      }}>
                        <span>{notification.message}</span>
                        <button type="button" onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit' }}>&times;</button>
                      </div>
                    )}
                    <form id="userForm" className="user-form" onSubmit={saveUser}>
                      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem' }}>
                    <div className="field-group">
                      <label htmlFor="national_id">National ID *</label>
                      <input type="text" id="national_id" value={form.national_id} onChange={handleChange} required />
                    </div>
                    <div className="field-group">
                      <label htmlFor="userName">Name *</label>
                      <input type="text" id="userName" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="field-group">
                      <label htmlFor="userUsername">Username</label>
                      <input type="text" id="userUsername" value={form.username} onChange={handleChange} />
                    </div>
                    <div className="field-group">
                      <label htmlFor="date_of_birth">Date of Birth</label>
                      <input type="date" id="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
                    </div>
                    <div className="field-group">
                      <label htmlFor="email">Email *</label>
                      <input type="email" id="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="field-group">
                      <label htmlFor="phone_number">Telephone *</label>
                      <input type="text" id="phone_number" value={form.phone_number} onChange={handleChange} required />
                    </div>
                    <div className="field-group">
                      <label htmlFor="branch">Branch</label>
                      <select id="branch" value={form.branch} onChange={handleChange}>
                        <option value="">Select Branch</option>
                        <option value="Musanze">Musanze</option>
                        <option value="Kigali">Kigali</option>
                        <option value="Rusizi">Rusizi</option>
                        {appBranch.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
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
                      <label htmlFor="userRole">Role *</label>
                      <select id="userRole" value={form.roleId} onChange={handleChange} required>
                        {roles.filter((r) => r.status === "ACTIVE").map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
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
                        <option value="">Select</option>
                        <option value="manager">manager</option>
                        <option value="officer">officer</option>
                        <option value="casual worker">casual worker</option>
                        {appCategories.map(c => <option key={"cat-" + c.id} value={c.name}>{c.name}</option>)}
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
                    {!isEditing && (
                      <div className="field-group">
                        <label htmlFor="userPassword">Password</label>
                        <input type="text" id="userPassword" value={form.password} onChange={handleChange} required />
                      </div>
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Branch</th>
                        <th>Role</th>
                        <th>Contract Type</th>
                        <th>Education Level</th>
                        <th>Pay Method</th>
                        <th>Pay Number</th>
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
                                <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>
                                <span className="status-badge warning" style={{ fontSize: '0.8em', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                  Req: {user.status_request}
                                </span>
                              </div>
                            ) : (
                              <span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span>
                            )}
                          </td>
                          <td>
                            <div className="actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <button className="link-btn primary" onClick={() => editUser(user.id)}>Edit</button>
                              <button className="link-btn warning" onClick={() => resetUserPassword(user.id)}>Reset Auth</button>
                              <button className="link-btn delete" onClick={() => deleteUser(user.id)}>Delete</button>
                              
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

        </main>
      </div>
    </div>
  );
}