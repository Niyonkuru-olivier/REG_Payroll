"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { apiFetchAuth } from "../../lib/api";

interface Branch {
  id: number;
  name: string;
  hubId: string;
  province?: string;
  district?: string;
  status: string;
}

export default function BranchManagement() {
  const router = useRouter();
  const pathname = usePathname();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [branchForm, setBranchForm] = useState({ id: 0, name: "", hubId: "", province: "Kigali City", district: "Nyarugenge", status: "ACTIVE" });
  const [isEditingBranch, setIsEditingBranch] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const districtMap: Record<string, string[]> = {
    "North": ["Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo"],
    "East": ["Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana"],
    "Kigali City": ["Gasabo", "Kicukiro", "Nyarugenge"],
    "South": ["Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango"],
    "West": ["Karongi", "Ngororero", "Nyabihu", "Nyamasheke", "Rubavu", "Rusizi", "Rutsiro"]
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadSystemData = async () => {
    try {
      const fetchedBranches = await apiFetchAuth<any[]>("/branches");
      if (fetchedBranches) {
        setBranches(fetchedBranches.map(b => ({ id: b.branch_id, name: b.branch_name, hubId: b.branch_code, province: b.province, district: b.district, status: b.status === "Approved" ? "ACTIVE" : b.status })));
      }
      const fetchedUsers = await apiFetchAuth<any[]>("/users");
      if (fetchedUsers) {
        setUsers(fetchedUsers);
      }
    } catch {}
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setBranchForm(prev => {
      const next = { ...prev, [id === "branchName" ? "name" : id === "branchStatus" ? "status" : id]: id === "hubId" ? Number(value) : value };
      if (id === "province") {
        next.district = districtMap[value][0];
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
    const isInUse = users.some(u => u.branch === b.name || u.profile?.branch === b.name);
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

  return (
    <div className="app-layout">
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

      <div className="content">
        <header className="topbar">
          <h1>Super Admin Dashboard</h1>
          <button id="logoutBtn" className="logout-btn" onClick={() => router.push("/")}>Logout</button>
        </header>

        <main className="main-content">
          <section id="branch-category" className="section active">
            {notification && (
              <div style={{ padding: '12px 16px', marginBottom: '1rem', borderRadius: '6px', backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2', color: notification.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 500 }}>
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit' }}>&times;</button>
              </div>
            )}
            
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
          </section>
        </main>
      </div>
    </div>
  );
}
