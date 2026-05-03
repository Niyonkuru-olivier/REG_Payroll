"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./globals.css";
import regLogo from "../../REG_Logo.png";
import { getLoggedUser, isRoleAllowedForRoute } from "../../lib/auth";
import { apiFetchAuth } from "../../lib/api";

// We removed static dummy data here to use dynamic state
/* ── HELPER ── */

/* ══════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════ */
export default function UserDashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"overview" | "profile" | "payments">("overview");
  const [profileStatus, setProfileStatus] = useState("ACTIVE");
  const [userData, setUserData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    national_id: "",
    phone_number: "",
    education_level: "",
    payment_number: "",
    contract_start: "",
    contract_end: "",
    branch: "",
    category: "",
    contract_type: "",
    date_of_birth: ""
  });
  const [notification, setNotification] = useState<{type: 'success'|'error', message: string} | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const loggedUser = getLoggedUser();
    const role = loggedUser?.role || "";
    if (!isRoleAllowedForRoute(role, "/user-dashboard")) {
      router.replace("/");
    }
  }, [router]);

  const loadProfile = async () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("loggedUser");
    if (!raw) return;
    try {
      const logged = JSON.parse(raw) as { id: number };
      const user = await apiFetchAuth<any>(`/users/${logged.id}`);
      setUserData(user);
      if (user.is_locked) setProfileStatus("LOCKED");
      else if (!user.is_active) setProfileStatus("BLOCKED");
      else setProfileStatus("ACTIVE");

      // Set edit form based on the fetched user profile permissions json
      const profile = user.profile || {};
      const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : "";

      setEditForm({
        full_name: user.full_name || "",
        national_id: user.national_id || profile.national_id || "",
        phone_number: user.phone_number || profile.phone_number || "",
        education_level: user.education_level || profile.education_level || "",
        payment_number: user.payment_number || profile.payment_number || "",
        contract_start: formatDate(user.contract_start || profile.contract_start),
        contract_end: formatDate(user.contract_end || profile.contract_end),
        branch: user.branch || profile.branch || "",
        category: user.category || profile.category || "",
        contract_type: user.contract_type || profile.contract_type || "",
        date_of_birth: formatDate(user.date_of_birth || profile.date_of_birth)
      });

      // You can also fetch payments from the backend here if the endpoint exists
      // const userPayments = await apiFetchAuth<any[]>(`/payroll?userId=${logged.id}`);
      // setPayments(userPayments || []);
    } catch {
      showNotification('error', "Failed to load profile.");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.id]: e.target.value });
  };

  const submitEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    try {
      const payload = {
        full_name: editForm.full_name,
        phone_number: editForm.phone_number,
        payment_number: editForm.payment_number
      };
      await apiFetchAuth(`/users/${userData.id || userData.user_id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      showNotification('success', "Profile updated successfully!");
      setIsEditing(false);
      loadProfile();
    } catch (err: any) {
      let errorMsg = err.message || "Failed to update profile.";
      try {
        const parsed = JSON.parse(errorMsg);
        if (parsed.message) {
          errorMsg = Array.isArray(parsed.message) ? parsed.message.join("\n") : parsed.message;
        }
      } catch (e) {
        // Keep default error message
      }
      showNotification('error', errorMsg);
    }
  };

  /* ── Overview metrics ── */
  const totalNetPaid = payments.reduce((sum, p) => sum + (p.paidNetAmount || 0), 0);
  const latestPayment = payments.length ? payments[payments.length - 1] : null;
  const latestMonth = latestPayment ? `${latestPayment.month}/${latestPayment.year}` : "-";

  const overviewCards = [
    { label: "Profile Status", value: profileStatus },
    { label: "Total Payments", value: payments.length },
    { label: "Net Paid Total", value: totalNetPaid.toLocaleString() },
    { label: "Latest Payment", value: latestMonth },
  ];

  /* ── Profile items ── */
  const p = userData?.profile || {};
  const profileItems = [
    { label: "Full Name",       value: userData?.full_name || "-" },
    { label: "National ID",     value: userData?.national_id || p.national_id || "-" },
    { label: "Phone",           value: userData?.phone_number || p.phone_number || "-" },
    { label: "Start Date",      value: userData?.contract_start ? new Date(userData.contract_start).toLocaleDateString() : p.contract_start ? new Date(p.contract_start).toLocaleDateString() : "-" },
    { label: "End Date",        value: userData?.contract_end ? new Date(userData.contract_end).toLocaleDateString() : p.contract_end ? new Date(p.contract_end).toLocaleDateString() : "-" },
    { label: "Branch",          value: userData?.branch || p.branch || "-" },
    { label: "Category",        value: userData?.category || p.category || "-" },
    { label: "Contract Type",   value: userData?.contract_type || p.contract_type || "-" },
    { label: "Education Level", value: userData?.education_level || p.education_level || "-" },
    { label: "Date of Birth",   value: userData?.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString() : p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : "-" },
    { label: "Account No",      value: userData?.payment_number || p.payment_number || "-" },
  ];

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
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
        <div className="sidebar-subtitle">Employee Portal</div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item${activeSection === "overview" ? " active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </button>
          <button
            className={`nav-item${activeSection === "profile" ? " active" : ""}`}
            onClick={() => setActiveSection("profile")}
          >
            My Profile
          </button>
          <button
            className={`nav-item${activeSection === "payments" ? " active" : ""}`}
            onClick={() => setActiveSection("payments")}
          >
            Payment History
          </button>
          <Link className="nav-link" href="/payment-history">
            All Payment Records
          </Link>
        </nav>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="content">
        <header className="topbar">
          <h1>User Dashboard</h1>
          <button
            className="logout-btn"
            id="logoutBtn"
            onClick={() => router.push("/")}
          >
            Logout
          </button>
        </header>

        <main className="main-content">

          {/* ── OVERVIEW ── */}
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
              <article className="panel">
                <h2>Quick Note</h2>
                <p>
                  This portal provides read access to your personal details and salary payment history.
                  Contact your administrator for account or employee record changes.
                </p>
              </article>
            </section>
          )}

          {/* ── PROFILE ── */}
          {activeSection === "profile" && (
            <section id="profile" className="section active">
              {notification && (
                <div className={`notification ${notification.type}`} style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '8px', color: '#fff', background: notification.type === 'success' ? '#059669' : '#dc2626', whiteSpace: 'pre-wrap' }}>
                  {notification.message}
                </div>
              )}
              <article className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2>My Profile</h2>
                  <button className="btn primary" onClick={() => setIsEditing(true)}>+ Edit Profile</button>
                </div>
                <div id="profileGrid" className="profile-grid">
                  {profileItems.map((item) => (
                    <div className="profile-item" key={item.label}>
                      <div className="label" style={{ fontWeight: 'bold', color: '#64748b' }}>{item.label}</div>
                      <div className="value" style={{ fontSize: '1.1em' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {/* EDIT PROFILE MODAL */}
          {isEditing && (
            <div className="modal-overlay-animated" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
              <div className="panel modal-content-animated" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', background: '#ffffff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem', fontWeight: 700 }}>Edit Identity Details</h2>
                  <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#f8fafc', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer', color: '#64748b', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}>&times;</button>
                </div>
                <div className="notification warning" style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.95em', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Restricted Editing</strong>
                    You may only edit your Name, Phone, and Account Number. To modify other details, please contact your Admin or HR.
                  </div>
                </div>
                <form onSubmit={submitEditProfile}>
                  <div className="form-grid">
                    <div className="field-group">
                      <label htmlFor="full_name">Full Name</label>
                      <input type="text" id="full_name" value={editForm.full_name} onChange={handleEditChange} required placeholder="e.g. John Doe" />
                    </div>
                    <div className="field-group">
                      <label htmlFor="phone_number">Phone Number</label>
                      <input type="text" id="phone_number" value={editForm.phone_number} onChange={handleEditChange} required placeholder="e.g. 0780000000" />
                    </div>
                    <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor="payment_number">Account Number</label>
                      <input type="text" id="payment_number" value={editForm.payment_number} onChange={handleEditChange} required placeholder="e.g. 100012345678" />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1', margin: '1rem 0 0.5rem', borderBottom: '1px dashed #e2e8f0' }}></div>
                    <div style={{ gridColumn: '1 / -1', color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Read-only Details</div>

                    {/* Read-only fields */}
                    <div className="field-group">
                      <label htmlFor="national_id">National ID</label>
                      <input type="text" id="national_id" value={editForm.national_id} disabled />
                    </div>
                    <div className="field-group">
                      <label htmlFor="education_level">Education Level</label>
                      <input type="text" id="education_level" value={editForm.education_level} disabled />
                    </div>
                    <div className="field-group">
                      <label htmlFor="contract_start">Start Date</label>
                      <input type="date" id="contract_start" value={editForm.contract_start} disabled />
                    </div>
                    <div className="field-group">
                      <label htmlFor="contract_end">End Date</label>
                      <input type="date" id="contract_end" value={editForm.contract_end} disabled />
                    </div>
                    <div className="field-group">
                      <label htmlFor="branch">Branch</label>
                      <input type="text" id="branch" value={editForm.branch} disabled />
                    </div>
                    <div className="field-group">
                      <label htmlFor="category">Category</label>
                      <input type="text" id="category" value={editForm.category} disabled />
                    </div>
                    <div className="field-group">
                      <label htmlFor="contract_type">Contract Type</label>
                      <input type="text" id="contract_type" value={editForm.contract_type} disabled />
                    </div>
                    <div className="field-group">
                      <label htmlFor="date_of_birth">Date of Birth</label>
                      <input type="date" id="date_of_birth" value={editForm.date_of_birth} disabled />
                    </div>
                  </div>
                  <div className="form-actions" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button type="submit" className="btn primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {activeSection === "payments" && (
            <section id="payments" className="section active">
              <article className="panel">
                <h2>Payment History</h2>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Year</th>
                        <th>Days</th>
                        <th>Gross Amount</th>
                        <th>Deducted Amount</th>
                        <th>Net Paid</th>
                        <th>Status</th>
                        <th>Pay Date</th>
                      </tr>
                    </thead>
                    <tbody id="paymentsBody">
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{payment.month}</td>
                          <td>{payment.year}</td>
                          <td>{payment.days}</td>
                          <td>{payment.grossAmount.toLocaleString()}</td>
                          <td>{payment.deductedAmount.toLocaleString()}</td>
                          <td>{payment.paidNetAmount.toLocaleString()}</td>
                          <td>{payment.status}</td>
                          <td>{payment.payDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}