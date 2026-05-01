"use client";

import './globals.css'
import { useState } from "react";

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([
    { id: 1, name: "Super Admin", status: "ACTIVE" },
    { id: 2, name: "Admin", status: "ACTIVE" },
    { id: 3, name: "User", status: "ACTIVE" },
    { id: 4, name: "Auditor", status: "ACTIVE" }
  ]);

  const [roleId, setRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleStatus, setRoleStatus] = useState("ACTIVE");

  function resetForm() {
    setRoleId(null);
    setRoleName("");
    setRoleStatus("ACTIVE");
  }

  function saveRole(e: React.FormEvent) {
    e.preventDefault();

    if (!roleName.trim()) return;

    if (roleId) {
      setRoles(prev =>
        prev.map(role =>
          role.id === roleId
            ? { ...role, name: roleName, status: roleStatus }
            : role
        )
      );
    } else {
      const nextId = roles.length
        ? Math.max(...roles.map(r => r.id)) + 1
        : 1;

      setRoles(prev => [
        ...prev,
        { id: nextId, name: roleName, status: roleStatus }
      ]);
    }

    resetForm();
  }

  function editRole(id: number) {
    const role = roles.find(r => r.id === id);
    if (!role) return;

    setRoleId(role.id);
    setRoleName(role.name);
    setRoleStatus(role.status);
  }

  function deleteRole(id: number) {
    setRoles(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="page-wrap">

      {/* HEADER */}
      <header className="topbar">
        <div>
          <h1>Role Management</h1>
          <p>Super Admin setup module for role definitions and status control</p>
        </div>

        <div className="topbar-actions">
          <a className="nav-link" href="/super-admin-dashboard">
            Super Admin Dashboard
          </a>
          <a className="logout-link" href="/">
            Logout
          </a>
        </div>
      </header>

      <main className="main-content">

        {/* FORM */}
        <section className="panel">
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
              <button type="submit" className="primary-btn">
                Save Role
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>

          </form>
        </section>

        {/* TABLE */}
        <section className="panel">
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
                    <td>{role.status}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="link-btn"
                          onClick={() => editRole(role.id)}
                        >
                          Edit
                        </button>

                        <button
                          className="link-btn delete"
                          onClick={() => deleteRole(role.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </section>

      </main>
    </div>
  );
}