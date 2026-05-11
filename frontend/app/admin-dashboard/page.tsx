"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  History, 
  UserPlus, 
  LogOut, 
  RefreshCw, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X,
  AlertCircle,
  Scissors,
  CheckCircle,
  CheckCircle2,
  Percent,
  Calculator,
  ChevronRight,
  Info,
  Clock
} from "lucide-react";
import "./globals.css";
import regLogo from "../../REG_Logo.png";
import { getLoggedUser, isRoleAllowedForRoute } from "../../lib/auth";
import { apiFetchAuth } from "../../lib/api";

/* ── TYPES ── */
interface User {
  id: number;
  national_id: string;
  name: string;
  email: string;
  phone_number: string;
  branch?: string;
  payment_method?: string;
  payment_number?: string;
  status: string;
  category?: string;
  contract_type?: string;
  contract_start?: string;
  contract_end?: string;
  education_level?: string;
  username?: string;
  password?: string;
  status_request?: string | null;
}

interface Category {
  id: number;
  name: string;
  code: string;
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
  accountNo: string;
  status: string;
}

const initialPayments: Payment[] = [
  {
    id: 1, month: 3, year: 2026, days: 30, grossAmount: 850000,
    deductedAmount: 120000, paidNetAmount: 730000, employeeId: 1, categoryId: 1,
    accountNo: "1002003001", status: "PAID",
  },
];

const blankPayment = {
  month: 1, year: new Date().getFullYear(), days: 30,
  grossAmount: 0, deductedAmount: 0,
  employeeId: 0, status: "PAID",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, blockedUsers: 0, lockedUsers: 0 });
  const [fullName, setFullName] = useState("");
  const [currentLoggedUser, setCurrentLoggedUser] = useState<any>(null);


  useEffect(() => {
    const user = getLoggedUser();
    const role = user?.role || "";
    if (user) {
      setCurrentLoggedUser(user);
      setFullName((user as any).name || (user as any).username || "Admin");
    }
    if (!isRoleAllowedForRoute(role, "/admin-dashboard")) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiFetchAuth<any>("/stats/users");
        setStats(data);
      } catch (err) { 
        handleApiError(err, "loading dashboard stats"); 
      }
    };
    loadStats();
  }, []);

  const [activeSection, setActiveSection] = useState<"overview" | "employees" | "payments" | "salary-settings">("overview");

  // Salary Settings State
  const [posts, setPosts] = useState<any[]>([]);
  const [salaryComponents, setSalaryComponents] = useState<any[]>([]);
  const [salaryConfigs, setSalaryConfigs] = useState<any[]>([]);
  const [deductionSettings, setDeductionSettings] = useState<{ categoryId: string | number, deductions: any[] } | null>(null);
  const [salarySubSection, setSalarySubSection] = useState<"categories" | "deductions" | "components" | "posts">("categories");
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryForm, setSalaryForm] = useState<any>({ type: 'category-config', data: {} });

  // Deduction Editing State
  const [editingDeductionIdx, setEditingDeductionIdx] = useState<number | null>(null);
  const [editDeductionData, setEditDeductionData] = useState<{ id?: number, deduction_name: string, percentage: number, is_enabled: boolean } | null>(null);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);

  // Payroll State
  const [payrollBatches, setPayrollBatches] = useState<any[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [eligibleEmployees, setEligibleEmployees] = useState<any[]>([]);
  const [selectedEligibleIds, setSelectedEligibleIds] = useState<Set<number>>(new Set());
  const [eligibleSearch, setEligibleSearch] = useState("");
  const [eligibleCategoryFilter, setEligibleCategoryFilter] = useState("All");
  const [isFetchingEligible, setIsFetchingEligible] = useState(false);
  const [isProcessingPayroll, setIsProcessingPayroll] = useState(false);
  const [payrollForm, setPayrollForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });

  const resetPayrollBatch = async (batchId: number, skipConfirm = false) => {
    if (!skipConfirm && !confirm("Are you sure you want to reset this payroll batch? This will delete all generated payslips for this period.")) return;
    try {
      await apiFetchAuth(`/payroll/batches/${batchId}/reset`, { method: 'POST' });
      showNotification('success', 'Payroll batch reset successfully. You can now run it again.');
      await loadPayrollData();
      return true;
    } catch (err: any) { 
      handleApiError(err, "resetting payroll batch"); 
      return false;
    }
  };



  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userForm, setUserForm] = useState<Partial<User>>({
    national_id: "", name: "", username: "", email: "", phone_number: "", password: "Reg@12345",
    branch: "", payment_method: "", payment_number: "",
    category: "", contract_type: "", contract_start: "", contract_end: "", education_level: ""
  });
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApiError = (err: any, context: string) => {
    console.error(`Error ${context}:`, err);
    let errorMsg = err.message || `An error occurred while ${context}.`;

    try {
      const parsed = JSON.parse(errorMsg);
      if (parsed.statusCode === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("loggedUser");
        router.replace("/");
        return;
      }
      if (parsed.message) {
        errorMsg = Array.isArray(parsed.message) ? parsed.message.join(", ") : parsed.message;
      }
    } catch (e) {
      if (errorMsg.includes("401") || errorMsg.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("loggedUser");
        router.replace("/");
        return;
      }
    }

    showNotification('error', errorMsg);
  };


  const appContractTypes = ["Permanent", "Fixed Term"];

  const loadSystemData = async () => {
    try {
      const loggedUser = getLoggedUser() as any;
      const userId = loggedUser?.id || loggedUser?.userId;

      const [fetchedBranches, fetchedCategories, currentUser] = await Promise.all([
        apiFetchAuth<any[]>("/branches"),
        apiFetchAuth<any[]>("/categories"),
        userId ? apiFetchAuth<any>(`/users/${userId}`) : Promise.resolve(null)
      ]);

      let allowedBranches: string[] | "All" = "All";
      if (currentUser && currentUser.profile && currentUser.profile.branch) {
        if (currentUser.profile.branch !== "All") {
          allowedBranches = currentUser.profile.branch.split(',').map((b: string) => b.trim()).filter(Boolean);
        }
      }

      if (fetchedBranches) {
        let finalBranches = fetchedBranches.map(b => ({
          id: b.branch_id,
          name: b.branch_name,
          hubId: b.branch_code,
          province: b.province,
          district: b.district,
          status: b.status === "Approved" ? "ACTIVE" : b.status
        }));

        if (allowedBranches !== "All") {
          finalBranches = finalBranches.filter((b: any) => allowedBranches.includes(b.name));
        }

        setBranches(finalBranches);
      }
      if (fetchedCategories) {
        setCategories(fetchedCategories.map(c => ({
          id: c.category_id,
          name: c.category_name,
          code: c.category_code,
          status: c.status
        })));
      }
    } catch (err) { 
      handleApiError(err, "loading system data");
    }
  };

  const loadSalaryData = async () => {
    try {
      const [fetchedPosts, fetchedComponents, fetchedConfigs] = await Promise.all([
        apiFetchAuth<any[]>("/posts"),
        apiFetchAuth<any[]>("/salary-components"),
        apiFetchAuth<any[]>("/salary-settings/configurations")
      ]);
      if (fetchedPosts) setPosts(fetchedPosts);
      if (fetchedComponents) setSalaryComponents(fetchedComponents);
      if (fetchedConfigs) setSalaryConfigs(fetchedConfigs);
      // We don't load global deductions anymore as they are per category
    } catch (err) { 
      handleApiError(err, "loading salary data");
    }
  };

  const handlePaySelected = async () => {
    if (selectedEligibleIds.size === 0) return;
    setIsProcessingPayroll(true);
    try {
      const payload = {
        month: Number(payrollForm.month),
        year: Number(payrollForm.year),
        employeeIds: Array.from(selectedEligibleIds)
      };
      await apiFetchAuth("/payroll/run", {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('success', `Payment processed for ${selectedEligibleIds.size} employees.`);
      await loadPayrollData();
    } catch (err) {
      handleApiError(err, "processing selected payments");
    } finally {
      setIsProcessingPayroll(false);
    }
  };

  const handlePayAll = async () => {
    if (eligibleEmployees.length === 0) return;
    if (!confirm(`Are you sure you want to process payment for ALL ${eligibleEmployees.length} eligible employees?`)) return;
    setIsProcessingPayroll(true);
    try {
      const payload = {
        month: Number(payrollForm.month),
        year: Number(payrollForm.year)
      };
      await apiFetchAuth("/payroll/run", {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showNotification('success', `Payroll processed for all eligible employees.`);
      await loadPayrollData();
    } catch (err) {
      handleApiError(err, "processing bulk payroll");
    } finally {
      setIsProcessingPayroll(false);
    }
  };

  const loadEligibleEmployees = async () => {
    setIsFetchingEligible(true);
    try {
      const data = await apiFetchAuth<any[]>("/payroll/eligible", {
        method: 'POST',
        body: JSON.stringify({
          month: Number(payrollForm.month),
          year: Number(payrollForm.year)
        })
      });
      setEligibleEmployees(data || []);
      setSelectedEligibleIds(new Set());
    } catch (err) {
      handleApiError(err, "loading eligible employees");
    } finally {
      setIsFetchingEligible(false);
    }
  };

  const loadPayrollData = async () => {
    try {
      const [batches, payslips] = await Promise.all([
        apiFetchAuth<any[]>("/payroll/batches"),
        apiFetchAuth<any[]>("/payroll/payslips")
      ]);
      if (batches) setPayrollBatches(batches);
      if (payslips) setPaymentRecords(payslips);
      await loadEligibleEmployees();
    } catch (err) { 
      handleApiError(err, "loading payroll data");
    }
  };


  const loadUsers = async (q = "") => {
    try {
      const authUsers = await apiFetchAuth<any[]>(`/users?role=Employee&q=${encodeURIComponent(q)}`);
      if (authUsers) {
        const mappedUsers = authUsers.map((u: any) => ({
          id: u.user_id,
          name: u.full_name || u.username,
          username: u.username || "",
          national_id: u.national_id || u.profile?.national_id || "",
          email: u.email || "",
          phone_number: u.phone_number || u.profile?.phone_number || "",
          branch: u.branch || u.profile?.branch || "",
          payment_method: u.payment_method || u.profile?.payment_method || "",
          payment_number: u.payment_number || u.profile?.payment_number || "",
          status: u.status || u.profile?.status || (u.is_active ? "ACTIVE" : u.is_locked ? "LOCKED" : "BLOCKED"),
          category: u.category || u.profile?.category || "",
          contract_type: u.contract_type || u.profile?.contract_type || "",
          contract_start: u.contract_start || u.profile?.contract_start || "",
          contract_end: u.contract_end || u.profile?.contract_end || "",
          education_level: u.education_level || u.profile?.education_level || "",
          status_request: u.profile?.status_request || null,
        }));
        setUsers(mappedUsers);
      }
    } catch (err) { 
      handleApiError(err, "loading employees");
    }
  };

  useEffect(() => {
    loadUsers();
    loadSystemData();
    if (activeSection === "salary-settings") loadSalaryData();
    if (activeSection === "payments") loadPayrollData();
  }, [activeSection]);


  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const resetUserForm = () => {
    setUserForm({
      national_id: "", name: "", username: "", email: "", phone_number: "", password: "Reg@12345",
      branch: "", payment_method: "", payment_number: "",
      category: "", contract_type: "", contract_start: "", contract_end: "", education_level: ""
    });
    setIsEditingUser(false);
    setEditId(null);
    setIsModalOpen(false);
  };

  const editUser = (u: User) => {
    setUserForm({
      national_id: u.national_id || "", name: u.name, username: u.username || "", email: u.email || "",
      phone_number: u.phone_number || "", branch: u.branch || "",
      payment_method: u.payment_method || "", payment_number: u.payment_number || "",
      category: u.category || "", contract_type: u.contract_type || "", education_level: u.education_level || "",
      contract_start: u.contract_start ? new Date(u.contract_start).toISOString().split('T')[0] : "",
      contract_end: u.contract_end ? new Date(u.contract_end).toISOString().split('T')[0] : "",
      password: "",
    });
    setIsEditingUser(true);
    setEditId(u.id);
    setIsModalOpen(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    const generatedUsername = userForm.username || userForm.email?.split("@")[0] || "";

    if (!userForm.name || !userForm.national_id || !userForm.email || !userForm.phone_number) {
      showNotification('error', 'Please fill all mandatory fields (Name, Email, National ID, Phone Number).');
      return;
    }

    // Primary key constraint check
    const errors: string[] = [];
    users.forEach(u => {
      if (u.id === editId) return;
      if (userForm.national_id && u.national_id === userForm.national_id) errors.push("National ID already exists.");
      if (userForm.email && u.email === userForm.email) errors.push("Email already exists.");
      if (userForm.phone_number && u.phone_number === userForm.phone_number) errors.push("Telephone Number already exists.");
      if (generatedUsername && u.username === generatedUsername) errors.push("Username already exists.");
      if (userForm.payment_number && u.payment_number === userForm.payment_number) errors.push("Payment Number already exists.");
    });

    if (errors.length > 0) {
      const uniqueErrors = Array.from(new Set(errors));
      showNotification('error', uniqueErrors.join("\n"));
      return;
    }

    try {
      const { name, ...restForm } = userForm;
      const payload = {
        ...restForm,
        full_name: name,
        role: "Employee",
        username: generatedUsername,
      };
      if (isEditingUser && editId) {
        // Exclude password from update if it's empty
        if (!payload.password) delete payload.password;
        await apiFetchAuth(`/users/${editId}`, {
          method: "PUT", body: JSON.stringify(payload),
        });
        showNotification('success', "Employee details updated successfully.");
      } else {
        await apiFetchAuth(`/users`, {
          method: "POST", body: JSON.stringify({ ...payload, password: userForm.password || "Reg@12345", status: "ACTIVE" }),
        });
        showNotification('success', "Employee created successfully.");
      }
      resetUserForm();
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

  const requestStatusUpdate = async (userId: number, requestedStatus: string) => {
    if (!requestedStatus) return;
    const confirmAsk = confirm(`Change Status to ${requestedStatus}? This requires SuperAdmin approval.`);
    if (!confirmAsk) return;

    try {
      await apiFetchAuth(`/users/status`, {
        method: "PATCH",
        body: JSON.stringify({ userId, status: "PENDING", reason: `Request to ${requestedStatus}` })
      });
      alert(`Status set to PENDING. Awaiting SuperAdmin to approve: ${requestedStatus}`);
      loadUsers(searchQuery);
    } catch {
      alert("Error requesting status update. Ensure API is online.");
    }
  };

  /* ── payments state ── */
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [payForm, setPayForm] = useState<{ id: number } & typeof blankPayment>({ id: 0, ...blankPayment });
  const [isEditingPay, setIsEditingPay] = useState(false);

  const handlePayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    // same parsing...
  };
  const resetPayForm = () => { setIsEditingPay(false); };
  const editPayment = (id: number) => { setIsEditingPay(true); };
  const deletePayment = (id: number) => { };
  const savePayment = (e: React.FormEvent) => { e.preventDefault(); };

  /* ── overview metrics ── */
  const overviewCards = [
    { label: "Total Platform Users", value: stats.totalUsers },
    { label: "Active Users", value: stats.activeUsers },
    { label: "Blocked Users", value: stats.blockedUsers },
    { label: "Locked Users", value: stats.lockedUsers },
  ];

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Image src={regLogo} alt="REG Logo" width={200} height={100} priority />
          </div>
        </div>
        <div className="sidebar-title">Reserve Force Payroll</div>
        <div className="sidebar-subtitle">Admin (HR) Portal</div>
        <nav className="sidebar-nav">
          <button className={`nav-item${activeSection === "overview" ? " active" : ""}`} onClick={() => setActiveSection("overview")}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button className={`nav-item${activeSection === "employees" ? " active" : ""}`} onClick={() => setActiveSection("employees")}>
            <Users size={18} /> Employees
          </button>
          <button className={`nav-item${activeSection === "payments" ? " active" : ""}`} onClick={() => setActiveSection("payments")}>
            <CreditCard size={18} /> Payments
          </button>
          <button className={`nav-item${activeSection === "salary-settings" ? " active" : ""}`} onClick={() => setActiveSection("salary-settings")}>
            <Settings size={18} /> Salary Settings
          </button>
          <Link className="nav-link" href="/payment-history">
            <History size={18} /> Payment History
          </Link>

          <Link className="nav-link" href="/employee-management">Employee Management</Link>
          <Link className="nav-link" href="/monthly-payment-processing">Monthly Payment Processing</Link>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Admin Dashboard</h1>
            {fullName && <span className="welcome-text">Welcome, {fullName}</span>}
          </div>
          <button className="logout-btn" id="logoutBtn" onClick={() => router.push("/")}>
            <LogOut size={18} /> Logout
          </button>
        </header>

        <main className="main-content">
          {/* Global Notification */}
          {notification && !isModalOpen && !isSalaryModalOpen && !isDeductionModalOpen && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: notification.type === 'success' ? '#166534' : '#991b1b',
              border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 500,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit' }}>&times;</button>
            </div>
          )}
          {/* ══ OVERVIEW ══ */}
          {activeSection === "overview" && (
            <section id="overview" className="section active">
              <div id="overviewCards" className="cards-grid">
                {overviewCards.map((card) => (
                  <article className="metric-card" key={card.label}>
                    <h3>{card.label}</h3>
                    <p>{card.value}</p>
                  </article>
                ))}
              </div>
              <div className="panel" style={{ marginTop: '2rem' }}>
                <h2>Admin Scope</h2>
                <p>Manage branch-level employees, contract lifespans, and payments. Status modifications require SuperAdmin approvals (PENDING hooks).</p>
              </div>
            </section>
          )}

          {/* ══ EMPLOYEES ══ */}
          {activeSection === "employees" && (
            <section id="employees" className="section active">
              {/* Employee Form Modal */}
              {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                  <div className="panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                    <button type="button" onClick={resetUserForm} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>
                      <X size={24} />
                    </button>
                    <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>{isEditingUser ? "Edit Employee Details" : "Create New Employee"}</h2>

                    {/* Notification inside modal is handled separately below if needed */}

                    <form id="employeeForm" onSubmit={saveUser}>
                      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem' }}>
                        <div className="field-group">
                          <label htmlFor="national_id">National ID *</label>
                          <input id="national_id" type="text" value={userForm.national_id} onChange={handleUserChange} required />
                        </div>
                        <div className="field-group">
                          <label htmlFor="name">Full Name *</label>
                          <input id="name" type="text" value={userForm.name} onChange={handleUserChange} required />
                        </div>
                        <div className="field-group">
                          <label htmlFor="username">Username</label>
                          <input id="username" type="text" value={userForm.username} onChange={handleUserChange} />
                        </div>
                        <div className="field-group">
                          <label htmlFor="email">Email *</label>
                          <input id="email" type="email" value={userForm.email} onChange={handleUserChange} required />
                        </div>
                        <div className="field-group">
                          <label htmlFor="phone_number">Phone *</label>
                          <input id="phone_number" type="text" value={userForm.phone_number} onChange={handleUserChange} required />
                        </div>
                        <div className="field-group">
                          <label htmlFor="branch">Branch</label>
                          <select id="branch" value={userForm.branch} onChange={handleUserChange}>
                            <option value="">Select Branch</option>
                            {branches.filter(b => b.status === "ACTIVE").length === 0 ? (
                              <option value="" disabled>No branches available</option>
                            ) : (
                              branches.filter(b => b.status === "ACTIVE").map(b => <option key={b.id} value={b.name}>{b.name}</option>)
                            )}
                          </select>
                        </div>
                        <div className="field-group">
                          <label htmlFor="category">Category</label>
                          <select id="category" value={userForm.category} onChange={handleUserChange}>
                            <option value="">Select Category</option>
                            {categories.filter(c => c.status === "ACTIVE").map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div className="field-group">
                          <label htmlFor="contract_type">Contract Type</label>
                          <select id="contract_type" value={userForm.contract_type} onChange={handleUserChange}>
                            <option value="">Select Type</option>
                            {appContractTypes.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="field-group">
                          <label htmlFor="payment_method">Payment Method</label>
                          <select id="payment_method" value={userForm.payment_method} onChange={handleUserChange}>
                            <option value="">Select</option>
                            <option value="Telephone">Telephone</option>
                            <option value="Bank account">Bank account</option>
                          </select>
                        </div>
                        <div className="field-group">
                          <label htmlFor="payment_number">Payment Number (Account)</label>
                          <input id="payment_number" type="text" value={userForm.payment_number} onChange={handleUserChange} />
                        </div>
                        <div className="field-group">
                          <label htmlFor="education_level">Education Level</label>
                          <select id="education_level" value={userForm.education_level} onChange={handleUserChange}>
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
                          <input id="contract_start" type="date" value={userForm.contract_start} onChange={handleUserChange} />
                        </div>
                        <div className="field-group">
                          <label htmlFor="contract_end">Contract End Date</label>
                          <input id="contract_end" type="date" value={userForm.contract_end} onChange={handleUserChange} />
                        </div>
                        {!isEditingUser && (
                          <div className="field-group">
                            <label htmlFor="password">Password</label>
                            <input id="password" type="text" value={userForm.password} onChange={handleUserChange} required />
                          </div>
                        )}
                      </div>

                      <div className="user-form-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #eaeaea', paddingTop: '1.5rem' }}>
                        <button type="button" className="secondary-btn" onClick={resetUserForm} style={{ padding: '0.6rem 1.5rem' }}>Cancel</button>
                        <button type="submit" className="primary-btn" style={{ padding: '0.6rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
                          {isEditingUser ? "Update Employee" : "Register Employee"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Employees Table */}
              <div className="panel" style={{ marginTop: isModalOpen ? '0' : '2rem' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0 }}>Employee Portal Database</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                      onClick={() => { resetUserForm(); setIsModalOpen(true); }}
                      style={{ padding: '0.6rem 1.2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <UserPlus size={18} /> Register Employee
                    </button>
                    <input
                      type="text"
                      placeholder="Search Branch, Name, Email..."
                      className="search-bar"
                      style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px', minWidth: '300px' }}
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); loadUsers(e.target.value); }}
                    />
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>National ID</th>
                        <th>Phone</th>
                        <th>Branch</th>
                        <th>Category</th>
                        <th>Contract Type</th>
                        <th>Education Level</th>
                        <th>Pay Method</th>
                        <th>Pay Number</th>
                        <th>Lifespan</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? <tr><td colSpan={12} style={{ textAlign: 'center', padding: '1rem' }}>No Employees Found.</td></tr> : null}
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.national_id || "-"}</td>
                          <td>{u.phone_number || "-"}</td>
                          <td>{u.branch || "-"}</td>
                          <td>{u.category || "-"}</td>
                          <td>{u.contract_type || "-"}</td>
                          <td>{u.education_level || "-"}</td>
                          <td>{u.payment_method || "-"}</td>
                          <td>{u.payment_number || "-"}</td>
                          <td style={{ fontSize: '0.9em' }}>
                            ({u.contract_start ? new Date(u.contract_start).toLocaleDateString() : "?"} to {u.contract_end ? new Date(u.contract_end).toLocaleDateString() : "?"})
                          </td>
                          <td>
                            {u.status_request ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                <span className={`status-badge ${u.status.toLowerCase()}`}>
                                  {u.status}
                                </span>
                                <span className="status-badge warning" style={{ fontSize: '0.8em', backgroundColor: '#fef3c7', color: '#92400e' }}>
                                  Pending: {u.status_request}
                                </span>
                              </div>
                            ) : (
                              <span className={`status-badge ${u.status.toLowerCase()}`}>
                                {u.status}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="actions" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                              <button className="link-btn primary" onClick={() => editUser(u)} style={{ cursor: 'pointer', background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Edit Details</button>

                              {/* STATUS APPROVAL INTERCEPTOR */}
                              <select
                                style={{ padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
                                defaultValue=""
                                onChange={(e) => { requestStatusUpdate(u.id, e.target.value); e.target.value = ""; }}
                              >
                                <option value="" disabled>Change Status (Requires Approval)</option>
                                <option value="ACTIVE">Activate</option>
                                <option value="LOCKED">Lock</option>
                                <option value="BLOCKED">Block</option>
                              </select>
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

          {/* ══ PAYMENTS ══ */}
          {activeSection === "payments" && (
            <section id="payments" className="section active">
              {/* Context & Month Selector */}
              <div className="panel" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
                  <div>
                    <h2 style={{ margin: 0, color: '#111827' }}>Payroll Processing</h2>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                      Branch: <strong style={{ color: '#0369a1' }}>{currentLoggedUser?.branch || "Main HQ"}</strong>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <select 
                        value={payrollForm.month} 
                        onChange={(e) => {
                          const m = Number(e.target.value);
                          setPayrollForm({ ...payrollForm, month: m });
                          // Force reload eligible
                        }}
                        style={{ border: 'none', background: 'transparent', padding: '0.5rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        value={payrollForm.year} 
                        onChange={(e) => setPayrollForm({ ...payrollForm, year: Number(e.target.value) })}
                        style={{ border: 'none', background: 'transparent', padding: '0.5rem', width: '80px', fontSize: '0.875rem', fontWeight: 600, borderLeft: '1px solid #d1d5db' }}
                      />
                    </div>
                    <button className="primary-btn" onClick={loadPayrollData} disabled={isFetchingEligible} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}>
                      <RefreshCw size={18} className={isFetchingEligible ? 'spin' : ''} /> Refresh
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="search-bar" style={{ flex: 1, minWidth: '250px' }}>
                     <Search size={18} />
                     <input 
                       type="text" 
                       placeholder="Search eligible employees..." 
                       value={eligibleSearch}
                       onChange={(e) => setEligibleSearch(e.target.value)}
                     />
                   </div>
                   <select 
                     className="filter-select"
                     value={eligibleCategoryFilter}
                     onChange={(e) => setEligibleCategoryFilter(e.target.value)}
                     style={{ minWidth: '160px' }}
                   >
                     <option value="All">All Categories</option>
                     {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                   <select className="filter-select" style={{ minWidth: '160px' }}>
                     <option value="All">All Statuses</option>
                     <option value="Eligible">Eligible</option>
                     <option value="Processing">Processing</option>
                   </select>
                </div>
              </div>

              {/* Eligible List */}
              <div className="panel" style={{ border: '1px solid #e0f2fe', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0ea5e9' }}></div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Eligible for Payment</h2>
                    <span className="status-badge info">{eligibleEmployees.length} Waiting</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      className="primary-btn" 
                      style={{ background: '#059669', borderColor: '#059669' }}
                      disabled={isProcessingPayroll || selectedEligibleIds.size === 0}
                      onClick={handlePaySelected}
                    >
                      <CheckCircle size={18} /> Pay Selected ({selectedEligibleIds.size})
                    </button>
                    <button 
                      className="primary-btn" 
                      style={{ background: '#0284c7' }}
                      disabled={isProcessingPayroll || eligibleEmployees.length === 0}
                      onClick={handlePayAll}
                    >
                      <Users size={18} /> Pay All Employees
                    </button>
                  </div>
                </div>

                <div className="table-wrap">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>
                          <input 
                            type="checkbox" 
                            checked={eligibleEmployees.length > 0 && selectedEligibleIds.size === eligibleEmployees.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEligibleIds(new Set(eligibleEmployees.map(emp => emp.id)));
                              } else {
                                setSelectedEligibleIds(new Set());
                              }
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Full Name</th>
                        <th>Category</th>
                        <th>Payment Method</th>
                        <th style={{ textAlign: 'right' }}>Gross (RWF)</th>
                        <th style={{ textAlign: 'right' }}>Deductions</th>
                        <th style={{ textAlign: 'right' }}>Net Salary</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isFetchingEligible ? (
                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}><div className="loader"></div> Loading eligibility...</td></tr>
                      ) : eligibleEmployees.length === 0 ? (
                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                          <div style={{ marginBottom: '1rem' }}><Users size={48} opacity={0.2} /></div>
                          No employees eligible for payment in {new Date(0, payrollForm.month - 1).toLocaleString('default', { month: 'long' })} {payrollForm.year}.
                        </td></tr>
                      ) : (
                        eligibleEmployees
                          .filter(emp => {
                            const matchesSearch = emp.fullName.toLowerCase().includes(eligibleSearch.toLowerCase()) || emp.id.toString().includes(eligibleSearch);
                            const matchesCat = eligibleCategoryFilter === "All" || emp.category === eligibleCategoryFilter;
                            return matchesSearch && matchesCat;
                          })
                          .map(emp => (
                          <tr key={emp.id} className={selectedEligibleIds.has(emp.id) ? "selected-row" : ""}>
                            <td>
                              <input 
                                type="checkbox" 
                                checked={selectedEligibleIds.has(emp.id)}
                                onChange={() => {
                                  const next = new Set(selectedEligibleIds);
                                  if (next.has(emp.id)) next.delete(emp.id);
                                  else next.add(emp.id);
                                  setSelectedEligibleIds(next);
                                }}
                              />
                            </td>
                            <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>#{emp.id}</td>
                            <td style={{ fontWeight: 600 }}>{emp.fullName}</td>
                            <td><span className="status-badge" style={{ background: '#f3f4f6', color: '#4b5563' }}>{emp.category}</span></td>
                            <td style={{ fontSize: '0.875rem' }}>
                              <div style={{ fontWeight: 500 }}>{emp.paymentMethod}</div>
                              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{emp.paymentNumber}</div>
                            </td>
                            <td style={{ textAlign: 'right', color: '#374151' }}>{emp.grossSalary.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', color: '#dc2626' }}>{emp.totalDeductions.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                              {emp.netSalary.toLocaleString()}
                            </td>
                            <td>
                              <span className="status-badge warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={12} /> {emp.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment History Panel */}
              <div className="panel" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Payment History (Payslips)</h2>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Category</th>
                        <th>Payment Method</th>
                        <th>Account/Phone Number</th>
                        <th style={{ textAlign: 'right' }}>Net Salary (RWF)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = paymentRecords.filter(r => {
                          if (!r.payroll_batches) return false;
                          const d = new Date(r.payroll_batches.pay_period_start);
                          const bMonth = r.payroll_batches.pay_period_start.includes('T') ? d.getUTCMonth() + 1 : d.getMonth() + 1;
                          const bYear = r.payroll_batches.pay_period_start.includes('T') ? d.getUTCFullYear() : d.getFullYear();
                          return bMonth === Number(payrollForm.month) && bYear === Number(payrollForm.year);
                        });

                        if (filtered.length === 0) {
                          return <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No processed payments found for this period.</td></tr>;
                        }

                        return filtered.map((record) => (
                          <tr key={record.id}>
                            <td style={{ fontWeight: 600 }}>{record.employees?.full_name || (record.employees?.first_name ? `${record.employees.first_name} ${record.employees.last_name}` : 'N/A')}</td>
                            <td><span className="status-badge" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>{record.employees?.category || record.employees?.employee_categories?.category_name || 'N/A'}</span></td>
                            <td>{record.employees?.payment_profile?.payment_method || record.employees?.payment_method || 'N/A'}</td>
                            <td style={{ fontFamily: 'monospace' }}>
                              {record.employees?.payment_profile?.account_number || record.employees?.payment_profile?.phone_number || record.employees?.payment_number || '-'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                              {Number(record.net_payable || record.net_salary).toLocaleString()}
                            </td>
                            <td>
                              <span className={`status-badge ${record.payment_status?.toLowerCase() || 'pending'}`}>
                                {record.payment_status}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {activeSection === "salary-settings" && (
            <section id="salary-settings" className="section active">
              <div className="salary-settings-nav" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2.5rem' 
              }}>
                {[
                  { id: 'categories', label: 'Category Configuration', icon: <Calculator size={32} />, desc: 'Base salary & allowances' },
                  { id: 'deductions', label: 'Deduction Settings', icon: <Percent size={32} />, desc: 'Per-category deductions' },
                  { id: 'components', label: 'Advanced Components', icon: <Settings size={32} />, desc: 'Custom rules & logic' }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setSalarySubSection(tab.id as any)}
                    className={`salary-nav-card ${salarySubSection === tab.id ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '1.5rem',
                      background: salarySubSection === tab.id ? '#3b82f6' : '#fff',
                      color: salarySubSection === tab.id ? '#fff' : '#1f2937',
                      border: '1px solid',
                      borderColor: salarySubSection === tab.id ? '#3b82f6' : '#e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: salarySubSection === tab.id ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ marginBottom: '0.75rem', color: salarySubSection === tab.id ? '#fff' : '#3b82f6' }}>{tab.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{tab.label}</span>
                    <span style={{ fontSize: '0.85rem', opacity: salarySubSection === tab.id ? 0.9 : 0.6 }}>{tab.desc}</span>
                  </button>
                ))}
              </div>

              {salarySubSection === "categories" && (
                <div className="panel" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '2rem' }}>
                  <div style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#1a202c', marginBottom: '0.5rem' }}>Category-Based Salary Structure</h2>
                    <p style={{ color: '#718096', fontSize: '0.95rem' }}>Define the base salary and standard allowances for each employee category level.</p>
                  </div>
                  <div className="table-wrap" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: '#f8fafc' }}>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>Category</th>
                          <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>Basic Salary</th>
                          <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>Allowances</th>
                          <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>Gross Salary</th>
                          <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>Deduction</th>
                          <th style={{ textAlign: 'right', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>Net Salary</th>
                          <th style={{ textAlign: 'center', padding: '1rem', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: 600 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat, idx) => {
                          const config = salaryConfigs.find(c => c.category_id === cat.id);
                          const gross = config ? (Number(config.gross_salary)) : 0;
                          const net = config ? (Number(config.net_salary)) : 0;
                          const deduction = gross - net;
                          return (
                            <tr key={cat.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fcfcfd', borderBottom: '1px solid #edf2f7' }}>
                              <td style={{ padding: '1rem', fontWeight: 700, color: '#2d3748' }}>{cat.name}</td>
                              <td style={{ padding: '1rem', textAlign: 'right', color: '#3182ce', fontWeight: 600 }}>{config ? Number(config.basic_salary).toLocaleString() : '-'}</td>
                              <td style={{ padding: '1rem', textAlign: 'right', color: '#4a5568' }}>{config ? (Number(config.transport_allowance) + Number(config.housing_allowance) + Number(config.meal_allowance) + Number(config.performance_bonus)).toLocaleString() : '-'}</td>
                              <td style={{ padding: '1rem', textAlign: 'right', color: '#1a202c', fontWeight: 700 }}>{config && config.gross_salary ? Number(config.gross_salary).toLocaleString() : '-'}</td>
                              <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{config ? deduction.toLocaleString() : '-'}</td>
                              <td style={{ padding: '1rem', textAlign: 'right', color: '#059669', fontWeight: 700 }}>{config && config.net_salary ? Number(config.net_salary).toLocaleString() : '-'}</td>
                              <td style={{ padding: '1rem', textAlign: 'center' }}>
                                <button className="link-btn primary" style={{
                                  padding: '0.4rem 1rem',
                                  borderRadius: '6px',
                                  background: '#ebf4ff',
                                  color: '#3182ce',
                                  border: 'none',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }} onClick={() => {
                                  setSalaryForm({ type: 'category-config', data: config || { category_id: cat.id, basic_salary: 0 } });
                                  setIsSalaryModalOpen(true);
                                }}>Edit Settings</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {salarySubSection === "deductions" && (
                <div className="deductions-container" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                  <div className="panel" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '2rem' }}>
                    <div style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h2 style={{ fontSize: '1.5rem', color: '#1a202c', marginBottom: '0.5rem' }}>Category Deduction Settings</h2>
                        <p style={{ color: '#718096', fontSize: '0.95rem' }}>Manage specific deduction percentages for each employee category level.</p>
                      </div>
                      <div className="category-select-wrapper">
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4a5568', display: 'block', marginBottom: '0.5rem' }}>Select Category</label>
                        <select 
                          className="category-selector"
                          style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '2px solid #e2e8f0', minWidth: '200px' }}
                          onChange={async (e) => {
                            const catId = e.target.value;
                            if (catId) {
                              try {
                                const data = await apiFetchAuth<any[]>(`/salary-settings/deductions?categoryId=${catId}`);
                                setDeductionSettings({ categoryId: catId, deductions: data || [] });
                              } catch (err) {
                                handleApiError(err, "loading deductions");
                              }
                            } else {
                              setDeductionSettings(null);
                            }
                          }}
                        >
                          <option value="">-- Choose Category --</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {deductionSettings ? (
                      <>
                        <div className="add-deduction-form" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem', border: '1px dashed #cbd5e0' }}>
                          <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#2d3748' }}>Add New Deduction Rule</h4>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div className="field-group" style={{ flex: 2 }}>
                              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deduction Name</label>
                              <input type="text" id="new_deduction_name" placeholder="e.g. RSSB, TAX, Union Fee" style={{ width: '100%', padding: '0.6rem' }} />
                            </div>
                            <div className="field-group" style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Percentage (%)</label>
                              <input type="number" id="new_deduction_perc" placeholder="0.00" step="0.01" style={{ width: '100%', padding: '0.6rem' }} />
                            </div>
                            <button 
                              className="primary-btn" 
                              style={{ height: '38px', background: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                              onClick={() => {
                                const nameInput = document.getElementById('new_deduction_name') as HTMLInputElement;
                                const percInput = document.getElementById('new_deduction_perc') as HTMLInputElement;
                                if (!nameInput.value || !percInput.value) return;
                                
                                const newD = { deduction_name: nameInput.value, percentage: Number(percInput.value), is_enabled: true };
                                setDeductionSettings(prev => prev ? { 
                                  ...prev, 
                                  deductions: [...prev.deductions, newD] 
                                } : null);
                                nameInput.value = '';
                                percInput.value = '';
                              }}
                            >
                              <Plus size={16} /> Add Rule
                            </button>
                          </div>
                        </div>

                        <div className="deductions-list">
                          <h4 style={{ color: '#4a5568', marginBottom: '1rem' }}>Active Deduction Rules</h4>
                          <div className="table-wrap">
                            <table style={{ width: '100%' }}>
                              <thead>
                                <tr>
                                  <th style={{ textAlign: 'left' }}>Deduction Name</th>
                                  <th style={{ textAlign: 'right' }}>Percentage (%)</th>
                                  <th style={{ textAlign: 'center' }}>Status</th>
                                  <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(!deductionSettings.deductions || deductionSettings.deductions.length === 0) ? (
                                  <tr><td colSpan={4} style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>No deductions defined for this category.</td></tr>
                                ) : (
                                  deductionSettings.deductions.map((d: any, idx: number) => (
                                    <tr key={d.id || `ded-${idx}`}>
                                      <td style={{ fontWeight: 600 }}>{d.deduction_name}</td>
                                      <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>{Number(d.percentage).toFixed(2)}%</td>
                                      <td style={{ textAlign: 'center' }}>
                                        <span style={{ 
                                          padding: '0.25rem 0.75rem', 
                                          borderRadius: '20px', 
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          background: d.is_enabled ? '#dcfce7' : '#fee2e2',
                                          color: d.is_enabled ? '#166534' : '#991b1b'
                                        }}>
                                          {d.is_enabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                          <button 
                                            onClick={() => {
                                              setEditingDeductionIdx(idx);
                                              setEditDeductionData({ ...d });
                                              setIsDeductionModalOpen(true);
                                            }}
                                            style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                          >
                                            <Edit size={16} /> Edit
                                          </button>
                                          <button 
                                            onClick={() => {
                                              if (confirm("Remove this deduction rule?")) {
                                                const newDs = (deductionSettings?.deductions || []).filter((_: any, i: number) => i !== idx);
                                                setDeductionSettings(prev => prev ? { ...prev, deductions: newDs } : null);
                                              }
                                            }}
                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #edf2f7', paddingTop: '2rem' }}>
                          <button className="primary-btn" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem 2rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            backgroundColor: '#3b82f6',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)'
                          }} onClick={async () => {
                            try {
                              await apiFetchAuth('/salary-settings/deductions', { 
                                method: 'POST', 
                                body: JSON.stringify({ 
                                  category_id: deductionSettings.categoryId,
                                  deductions: deductionSettings.deductions 
                                }) 
                              });
                              showNotification('success', 'Deduction settings updated and salaries recalculated');
                              loadSalaryData();
                            } catch (err) { handleApiError(err, 'updating deductions'); }
                          }}>
                            <Save size={18} /> Save All Changes
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '4rem', textAlign: 'center', color: '#a0aec0' }}>
                        <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p>Please select a category above to manage its deductions.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {salarySubSection === "components" && (
                <div className="panel" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '2rem' }}>
                  <div style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#1a202c', marginBottom: '0.5rem' }}>Advanced Salary Components</h2>
                    <p style={{ color: '#718096', fontSize: '0.95rem' }}>Global earnings and deductions that are allocated across the system.</p>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Component Name</th>
                          <th>Code</th>
                          <th>Type</th>
                          <th>Calc Type</th>
                          <th style={{ textAlign: 'right' }}>Default Value</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryComponents.length === 0 ? (
                          <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>No advanced components found.</td></tr>
                        ) : (
                          salaryComponents.map((comp) => (
                            <tr key={comp.component_id}>
                              <td style={{ fontWeight: 600 }}>{comp.component_name}</td>
                              <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{comp.component_code}</code></td>
                              <td>
                                <span style={{ 
                                  padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                  background: comp.component_type === 'Earning' ? '#dcfce7' : '#fee2e2',
                                  color: comp.component_type === 'Earning' ? '#166534' : '#991b1b'
                                }}>{comp.component_type}</span>
                              </td>
                              <td>{comp.calculation_type}</td>
                              <td style={{ textAlign: 'right' }}>{comp.calculation_type === 'Percentage' ? `${comp.default_value}%` : Number(comp.default_value).toLocaleString()}</td>
                              <td>
                                <span className={`status-badge ${comp.is_active ? 'active' : 'blocked'}`}>
                                  {comp.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </section>
          )}

        </main>
      </div>

      {isSalaryModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '500px', borderRadius: '15px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#111827', fontSize: '1.25rem' }}>Configure Category Salary</h2>
              <button onClick={() => setIsSalaryModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="form-grid" style={{ display: 'grid', gap: '1rem' }}>
              <div className="field-group">
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Basic Salary (RWF) *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="0"
                    value={salaryForm.data.basic_salary} 
                    onChange={(e) => setSalaryForm({ ...salaryForm, data: { ...salaryForm.data, basic_salary: e.target.value } })} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1rem' }}
                  />
                  {(!salaryForm.data.basic_salary || Number(salaryForm.data.basic_salary) < 1) && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Basic Salary is required and must be at least 1 RWF.</span>
                  )}
                </div>
              </div>
              <div className="field-group">
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Transport Allowance (RWF)</label>
                <input type="number" min="0" value={salaryForm.data.transport_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, data: { ...salaryForm.data, transport_allowance: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="field-group">
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Housing Allowance (RWF)</label>
                <input type="number" min="0" value={salaryForm.data.housing_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, data: { ...salaryForm.data, housing_allowance: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="field-group">
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Meal Allowance (RWF)</label>
                <input type="number" min="0" value={salaryForm.data.meal_allowance} onChange={(e) => setSalaryForm({ ...salaryForm, data: { ...salaryForm.data, meal_allowance: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="field-group">
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Performance Bonus (RWF)</label>
                <input type="number" min="0" value={salaryForm.data.performance_bonus} onChange={(e) => setSalaryForm({ ...salaryForm, data: { ...salaryForm.data, performance_bonus: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
              <button className="secondary-btn" onClick={() => setIsSalaryModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
              <button 
                className="primary-btn" 
                disabled={!salaryForm.data.basic_salary || Number(salaryForm.data.basic_salary) < 1}
                onClick={async () => {
                  try {
                    const basic = Number(salaryForm.data.basic_salary);
                    if (isNaN(basic) || basic < 1) {
                      showNotification('error', 'Basic Salary must be a positive number.');
                      return;
                    }
                    await apiFetchAuth('/salary-settings/configurations', { method: 'POST', body: JSON.stringify(salaryForm.data) });
                    showNotification('success', 'Salary configuration saved and applied to all employees.');
                    setIsSalaryModalOpen(false);
                    loadSalaryData();
                  } catch (err) { handleApiError(err, 'saving configuration'); }
                }}
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', opacity: (!salaryForm.data.basic_salary || Number(salaryForm.data.basic_salary) < 1) ? 0.5 : 1 }}
              >
                Save & Recalculate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deduction Edit Modal */}
      {isDeductionModalOpen && editDeductionData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="panel" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#111827', fontSize: '1.25rem' }}>Edit Deduction Rule</h2>
              <button onClick={() => { setIsDeductionModalOpen(false); setEditingDeductionIdx(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="form-grid" style={{ display: 'grid', gap: '1.2rem' }}>
              <div className="field-group">
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Deduction Name</label>
                <input 
                  type="text" 
                  value={editDeductionData.deduction_name} 
                  onChange={(e) => setEditDeductionData({ ...editDeductionData, deduction_name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div className="field-group">
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Percentage (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editDeductionData.percentage} 
                  onChange={(e) => setEditDeductionData({ ...editDeductionData, percentage: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                />
              </div>
              <div className="field-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <label style={{ color: '#374151', fontWeight: 600, fontSize: '0.875rem' }}>Status:</label>
                <button 
                  onClick={() => setEditDeductionData({ ...editDeductionData, is_enabled: !editDeductionData.is_enabled })}
                  style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: '20px', 
                    border: 'none', 
                    fontWeight: 700,
                    background: editDeductionData.is_enabled ? '#dcfce7' : '#fee2e2',
                    color: editDeductionData.is_enabled ? '#166534' : '#991b1b',
                    cursor: 'pointer'
                  }}
                >
                  {editDeductionData.is_enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
              <button className="secondary-btn" onClick={() => { setIsDeductionModalOpen(false); setEditingDeductionIdx(null); }} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}>Cancel</button>
              <button 
                className="primary-btn" 
                onClick={() => {
                  const newDs = [...(deductionSettings?.deductions || [])];
                  if (editingDeductionIdx !== null) {
                    newDs[editingDeductionIdx] = { ...editDeductionData } as any;
                    setDeductionSettings(prev => prev ? { ...prev, deductions: newDs } : null);
                  }
                  setIsDeductionModalOpen(false);
                  setEditingDeductionIdx(null);
                }}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}