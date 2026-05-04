"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { apiFetchAuth } from "../../lib/api";

interface Role {
  id: number;
  name: string;
  status: string;
}

export default function RoleManagement() {
  const router = useRouter();
  const pathname = usePathname();

  const [roles, setRoles] = useState<Role[]>([]);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleStatus, setRoleStatus] = useState("ACTIVE");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadSystemData = async () => {
    try {
      const fetchedRoles = await apiFetchAuth<any[]>("/roles");
      if (fetchedRoles) {
        setRoles(fetchedRoles.map(r => ({ id: r.role_id, name: r.role_name, status: r.status })));
      }
    } catch {}
  };

  useEffect(() => {
    loadSystemData();
  }, []);

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

  async function deleteRole(id: number) {
    if (!confirm("Are you sure you want to permanently delete this role?")) return;
    try {
      await apiFetchAuth(`/roles/${id}`, { method: "DELETE" });
      showNotification('success', 'Role deleted successfully');
      loadSystemData();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete role');
    }
  }

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-title">Reserve Force Payroll</div>
        <nav className="sidebar-nav">
          <Link className={`nav-link ${pathname === "/super-admin-dashboard" ? "active" : ""}`} href="/super-admin-dashboard">Overview</Link>
          <Link className={`nav-link ${pathname === "/user-management" ? "active" : ""}`} href="/user-management">User Management</Link>
          <Link className={`nav-link ${pathname === "/data-management" ? "active" : ""}`} href="/data-management">Data Management</Link>
          <Link className={`nav-link ${pathname === "/role-management" ? "active" : ""}`} href="/role-management">Role Management</Link>
          <Link className={`nav-link ${pathname === "/payment-history" ? "active" : ""}`} href="/payment-history">Payment History</Link>
          <Link className={`nav-link ${pathname === "/employee-management" ? "active" : ""}`} href="/employee-management">Employee Management</Link>
          <Link className={`nav-link ${pathname === "/salary-deductions" ? "active" : ""}`} href="/salary-deductions">Salary Deductions</Link>
          <Link className={`nav-link ${pathname === "/branch-management" ? "active" : ""}`} href="/branch-management">Branch Management</Link>
          <Link className={`nav-link ${pathname === "/category-management" ? "active" : ""}`} href="/category-management">Category Management</Link>
        </nav>
      </aside>

      {/* ── CONTENT ── */}
      <div className="content">
        <header className="topbar">
          <h1>Super Admin Dashboard</h1>
          <button id="logoutBtn" className="logout-btn" onClick={() => router.push("/")}>Logout</button>
        </header>

        <main className="main-content">
          <section id="roles" className="section active">
            {notification && (
              <div style={{ padding: '12px 16px', marginBottom: '1rem', borderRadius: '6px', backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2', color: notification.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 500 }}>
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit' }}>&times;</button>
              </div>
            )}
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
                            <button className="link-btn delete" onClick={() => deleteRole(role.id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
