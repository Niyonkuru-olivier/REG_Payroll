"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  useEffect(() => {
    const loggedUser = getLoggedUser();
    const role = loggedUser?.role || "";
    if (!isRoleAllowedForRoute(role, "/admin-dashboard")) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiFetchAuth<any>("/stats/users");
        setStats(data);
      } catch { }
    };
    loadStats();
  }, []);

  const [activeSection, setActiveSection] = useState<"overview" | "employees" | "payments">("overview");

  // Users State
  const [users, setUsers] = useState<User[]>([]);
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

  // App lookups natively cached if needed (or manually provided in UI)
  const appBranch = ["Kigali", "Musanze", "Rusizi"];
  const appCategory = ["manager", "officer", "casual worker", "Soldier"];
  const appContractTypes = ["Permanent", "Fixed Term"];

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
    } catch { }
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
    const isDuplicate = users.some(u =>
      u.id !== editId && (
        u.national_id === userForm.national_id ||
        u.email === userForm.email ||
        u.phone_number === userForm.phone_number ||
        (u.username && u.username === generatedUsername) ||
        (userForm.payment_number && u.payment_number === userForm.payment_number)
      )
    );
    if (isDuplicate) {
      showNotification('error', "Error: National ID, Username, Email, Telephone Number, or Payment Number, there is one already exists for another user.");
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
          <button className={`nav-item${activeSection === "overview" ? " active" : ""}`} onClick={() => setActiveSection("overview")}>Overview</button>
          <button className={`nav-item${activeSection === "employees" ? " active" : ""}`} onClick={() => setActiveSection("employees")}>Employees</button>
          <button className={`nav-item${activeSection === "payments" ? " active" : ""}`} onClick={() => setActiveSection("payments")}>Payments</button>
          <Link className="nav-link" href="/payment-history">Payment History</Link>
          <Link className="nav-link" href="/employee-management">Employee Management</Link>
          <Link className="nav-link" href="/monthly-payment-processing">Monthly Payment Processing</Link>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className="content">
        <header className="topbar">
          <h1>Admin Dashboard</h1>
          <button className="logout-btn" id="logoutBtn" onClick={() => router.push("/")}>Logout</button>
        </header>

        <main className="main-content">
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
                    <button type="button" onClick={resetUserForm} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
                    <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>{isEditingUser ? "Edit Employee Details" : "Create New Employee"}</h2>
                    
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
                        {appBranch.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="field-group">
                      <label htmlFor="category">Category</label>
                      <select id="category" value={userForm.category} onChange={handleUserChange}>
                        <option value="">Select Category</option>
                        {appCategory.map((c) => <option key={c} value={c}>{c}</option>)}
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
                  <h2 style={{ margin: 0 }}>Employee Portal Database</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => { resetUserForm(); setIsModalOpen(true); }}
                      style={{ padding: '0.6rem 1.2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> Register Employee
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
              <div className="panel">
                <h2>Payment Actions Currently Offline</h2>
                <p>System redirect logic applies.</p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}