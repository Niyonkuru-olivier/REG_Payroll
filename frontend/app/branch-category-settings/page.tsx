"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./globals.css";

/* ── TYPES ── */
interface Branch {
  id: number;
  name: string;
  hubId: number;
  status: string;
}

interface Category {
  id: number;
  name: string;
  code: string;
  status: string;
}

/* ── INITIAL DATA ── */
const initialBranches: Branch[] = [
  { id: 1, name: "Kigali Branch", hubId: 1, status: "ACTIVE" },
  { id: 2, name: "Musanze Branch", hubId: 1, status: "ACTIVE" },
];

const initialCategories: Category[] = [
  { id: 1, name: "Officer", code: "OFC", status: "ACTIVE" },
  { id: 2, name: "Soldier", code: "SLD", status: "ACTIVE" },
];

/* ── BLANK FORMS ── */
const blankBranch = { id: 0, name: "", hubId: 1, status: "ACTIVE" };
const blankCategory = { id: 0, name: "", code: "", status: "ACTIVE" };

/* ══════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════ */
export default function BranchCategorySettings() {
  const router = useRouter();

  /* ── Branch state ── */
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [branchForm, setBranchForm] = useState({ ...blankBranch });
  const [isEditingBranch, setIsEditingBranch] = useState(false);

  /* ── Category state ── */
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoryForm, setCategoryForm] = useState({ ...blankCategory });
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  /* ════════════════════════
     BRANCH HANDLERS
  ════════════════════════ */
  const handleBranchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setBranchForm((prev) => ({
      ...prev,
      [id === "branchName"   ? "name"   :
       id === "hubId"        ? "hubId"  :
       id === "branchStatus" ? "status" : id]:
      id === "hubId" ? Number(value) : value,
    }));
  };

  const resetBranchForm = () => {
    setBranchForm({ ...blankBranch });
    setIsEditingBranch(false);
  };

  const editBranch = (id: number) => {
    const item = branches.find((b) => b.id === id);
    if (!item) return;
    setBranchForm({ id: item.id, name: item.name, hubId: item.hubId, status: item.status });
    setIsEditingBranch(true);
  };

  const deleteBranch = (id: number) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
  };

  const saveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim() || isNaN(branchForm.hubId)) return;

    if (isEditingBranch && branchForm.id) {
      setBranches((prev) =>
        prev.map((b) => (b.id === branchForm.id ? { ...b, ...branchForm } : b))
      );
    } else {
      const nextId = branches.length
        ? Math.max(...branches.map((b) => b.id)) + 1
        : 1;
      setBranches((prev) => [
        ...prev,
        { id: nextId, name: branchForm.name, hubId: branchForm.hubId, status: branchForm.status },
      ]);
    }
    resetBranchForm();
  };

  /* ════════════════════════
     CATEGORY HANDLERS
  ════════════════════════ */
  const handleCategoryChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [id === "categoryName"   ? "name"   :
       id === "categoryCode"   ? "code"   :
       id === "categoryStatus" ? "status" : id]:
      id === "categoryCode" ? value.toUpperCase() : value,
    }));
  };

  const resetCategoryForm = () => {
    setCategoryForm({ ...blankCategory });
    setIsEditingCategory(false);
  };

  const editCategory = (id: number) => {
    const item = categories.find((c) => c.id === id);
    if (!item) return;
    setCategoryForm({ id: item.id, name: item.name, code: item.code, status: item.status });
    setIsEditingCategory(true);
  };

  const deleteCategory = (id: number) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const saveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim() || !categoryForm.code.trim()) return;

    if (isEditingCategory && categoryForm.id) {
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryForm.id ? { ...c, ...categoryForm } : c))
      );
    } else {
      const nextId = categories.length
        ? Math.max(...categories.map((c) => c.id)) + 1
        : 1;
      setCategories((prev) => [
        ...prev,
        { id: nextId, name: categoryForm.name, code: categoryForm.code, status: categoryForm.status },
      ]);
    }
    resetCategoryForm();
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="page-wrap">
      {/* ── TOPBAR ── */}
      <header className="topbar">
        <div>
          <h1>Branch &amp; Category Settings</h1>
          <p>Super Admin setup for branch and payroll category structures</p>
        </div>
        <div className="topbar-actions">
          <Link className="nav-link" href="/super-admin-dashboard">
            Super Admin Dashboard
          </Link>
          <Link className="logout-link" href="/">
            Logout
          </Link>
        </div>
      </header>

      <main className="main-content">

        {/* ══ BRANCH SETUP ══ */}
        <section className="panel">
          <h2>Branch Setup</h2>
          <form id="branchForm" className="form-grid" onSubmit={saveBranch}>
            <div className="field-group">
              <label htmlFor="branchName">Branch Name</label>
              <input
                id="branchName"
                type="text"
                value={branchForm.name}
                onChange={handleBranchChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="hubId">Hub ID</label>
              <input
                id="hubId"
                type="number"
                min="1"
                value={branchForm.hubId}
                onChange={handleBranchChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="branchStatus">Status</label>
              <select
                id="branchStatus"
                value={branchForm.status}
                onChange={handleBranchChange}
                required
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {isEditingBranch ? "Update Branch" : "Save Branch"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                id="cancelBranchBtn"
                onClick={resetBranchForm}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>Hub ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="branchesBody">
                {branches.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.hubId}</td>
                    <td>{item.status}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="link-btn"
                          onClick={() => editBranch(item.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="link-btn delete"
                          onClick={() => deleteBranch(item.id)}
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

        {/* ══ CATEGORY SETUP ══ */}
        <section className="panel">
          <h2>Category Setup</h2>
          <form id="categoryForm" className="form-grid" onSubmit={saveCategory}>
            <div className="field-group">
              <label htmlFor="categoryName">Category Name</label>
              <input
                id="categoryName"
                type="text"
                value={categoryForm.name}
                onChange={handleCategoryChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="categoryCode">Code</label>
              <input
                id="categoryCode"
                type="text"
                value={categoryForm.code}
                onChange={handleCategoryChange}
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="categoryStatus">Status</label>
              <select
                id="categoryStatus"
                value={categoryForm.status}
                onChange={handleCategoryChange}
                required
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {isEditingCategory ? "Update Category" : "Save Category"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                id="cancelCategoryBtn"
                onClick={resetCategoryForm}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="categoriesBody">
                {categories.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.code}</td>
                    <td>{item.status}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="link-btn"
                          onClick={() => editCategory(item.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="link-btn delete"
                          onClick={() => deleteCategory(item.id)}
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