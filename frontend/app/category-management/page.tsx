"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { apiFetchAuth } from "../../lib/api";

interface Category {
  id: number;
  name: string;
  code: string;
  status: string;
}

export default function CategoryManagement() {
  const router = useRouter();
  const pathname = usePathname();

  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categoryForm, setCategoryForm] = useState({ id: 0, name: "", code: "", status: "ACTIVE" });
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadSystemData = async () => {
    try {
      const fetchedCategories = await apiFetchAuth<any[]>("/categories");
      if (fetchedCategories) {
        setCategories(fetchedCategories.map(c => ({ id: c.category_id, name: c.category_name, code: c.category_code, status: c.status })));
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
    const isInUse = users.some(u => u.category === c.name || u.profile?.category === c.name);
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
          <section id="category" className="section active">
            {notification && (
              <div style={{ padding: '12px 16px', marginBottom: '1rem', borderRadius: '6px', backgroundColor: notification.type === 'success' ? '#dcfce7' : '#fee2e2', color: notification.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 500 }}>
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'inherit' }}>&times;</button>
              </div>
            )}

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
        </main>
      </div>
    </div>
  );
}
