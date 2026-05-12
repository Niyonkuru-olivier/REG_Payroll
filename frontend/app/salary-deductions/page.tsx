"use client";
import './globals.css'
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { 
  List,
  LogOut,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import regLogo from "../../REG_Logo.png";

export default function SalaryDeductionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [deductionCategories, setDeductionCategories] = useState([
    { id: 1, name: "Tax", status: "ACTIVE" },
    { id: 2, name: "Insurance", status: "ACTIVE" },
  ]);

  const [salaryDeductions, setSalaryDeductions] = useState([
    { id: 1, salaryId: 1, deductionCategoryId: 1, percentage: 10, status: "ACTIVE" },
    { id: 2, salaryId: 2, deductionCategoryId: 2, percentage: 5, status: "ACTIVE" },
  ]);

  const [salaryList] = useState([
    { id: 1, label: "Officer - Gross 850,000" },
    { id: 2, label: "Soldier - Gross 620,000" },
  ]);

  // forms state
  const [catForm, setCatForm] = useState({
    id: 0,
    name: "",
    status: "ACTIVE",
  });

  const [ruleForm, setRuleForm] = useState({
    id: 0,
    salaryId: 0,
    deductionCategoryId: 0,
    percentage: 0,
    status: "ACTIVE",
  });

  // helpers
  const getCategoryName = (id: number) =>
    deductionCategories.find((c) => c.id === id)?.name || "Unknown";

  const resetCategoryForm = () => {
    setCatForm({ id: 0, name: "", status: "ACTIVE" });
  };

  const resetRuleForm = () => {
    setRuleForm({
      id: 0,
      salaryId: 0,
      deductionCategoryId: 0,
      percentage: 0,
      status: "ACTIVE",
    });
  };

  // CRUD CATEGORY
  const saveCategory = (e: React.FormEvent) => {
    e.preventDefault();

    if (!catForm.name) return;

    if (catForm.id) {
      setDeductionCategories((prev) =>
        prev.map((c) => (c.id === catForm.id ? catForm : c))
      );
    } else {
      const newId =
        deductionCategories.length > 0
          ? Math.max(...deductionCategories.map((c) => c.id)) + 1
          : 1;

      setDeductionCategories([...deductionCategories, { ...catForm, id: newId }]);
    }

    resetCategoryForm();
  };

  const deleteCategory = (id: number) => {
    setDeductionCategories((prev) => prev.filter((c) => c.id !== id));
    setSalaryDeductions((prev) =>
      prev.filter((r) => r.deductionCategoryId !== id)
    );
  };

  const editCategory = (cat: any) => {
    setCatForm(cat);
  };

  // CRUD RULES
  const saveRule = (e: React.FormEvent) => {
    e.preventDefault();

    if (ruleForm.percentage < 0 || ruleForm.percentage > 100) return;

    if (ruleForm.id) {
      setSalaryDeductions((prev) =>
        prev.map((r) => (r.id === ruleForm.id ? ruleForm : r))
      );
    } else {
      const newId =
        salaryDeductions.length > 0
          ? Math.max(...salaryDeductions.map((r) => r.id)) + 1
          : 1;

      setSalaryDeductions([...salaryDeductions, { ...ruleForm, id: newId }]);
    }

    resetRuleForm();
  };

  const deleteRule = (id: number) => {
    setSalaryDeductions((prev) => prev.filter((r) => r.id !== id));
  };

  const editRule = (rule: any) => {
    setRuleForm(rule);
  };

  const CategoryActions = ({ category }: { category: any }) => (
    <div className="dropdown-container">
      <button className="dropdown-trigger">
        <MoreVertical size={18} />
      </button>
      <div className="dropdown-menu">
        <button className="dropdown-item" onClick={() => editCategory(category)}>
          <Edit size={16} /> Edit Category
        </button>
        <div className="dropdown-divider"></div>
        <button className="dropdown-item delete" onClick={() => deleteCategory(category.id)}>
          <Trash2 size={16} /> Delete Category
        </button>
      </div>
    </div>
  );

  const RuleActions = ({ rule }: { rule: any }) => (
    <div className="dropdown-container">
      <button className="dropdown-trigger">
        <MoreVertical size={18} />
      </button>
      <div className="dropdown-menu">
        <button className="dropdown-item" onClick={() => editRule(rule)}>
          <Edit size={16} /> Edit Rule
        </button>
        <div className="dropdown-divider"></div>
        <button className="dropdown-item delete" onClick={() => deleteRule(rule.id)}>
          <Trash2 size={16} /> Delete Rule
        </button>
      </div>
    </div>
  );

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
        <div className="sidebar-subtitle">Super Admin Portal</div>
        <nav className="sidebar-nav">
          <Link className={`nav-link ${pathname === "/super-admin-dashboard" ? "active" : ""}`} href="/super-admin-dashboard">
            <LayoutDashboard size={18} /> Overview
          </Link>
          <Link className={`nav-link ${pathname === "/user-management" ? "active" : ""}`} href="/user-management">
            <Users size={18} /> User Management
          </Link>
          <Link className={`nav-link ${pathname === "/data-management" ? "active" : ""}`} href="/data-management">
            <Database size={18} /> Data Management
          </Link>
          <Link className={`nav-link ${pathname === "/role-management" ? "active" : ""}`} href="/role-management">
            <ShieldCheck size={18} /> Role Management
          </Link>
          <Link className={`nav-link ${pathname === "/payment-history" ? "active" : ""}`} href="/payment-history">
            <History size={18} /> Payment History
          </Link>
          <Link className={`nav-link ${pathname === "/employee-management" ? "active" : ""}`} href="/employee-management">
            <UserPlus size={18} /> Employee Management
          </Link>
          <Link className={`nav-link ${pathname === "/salary-deductions" ? "active" : ""}`} href="/salary-deductions">
            <Scissors size={18} /> Salary Deductions
          </Link>
          <Link className={`nav-link ${pathname === "/branch-management" ? "active" : ""}`} href="/branch-management">
            <MapPin size={18} /> Branch Management
          </Link>
          <Link className={`nav-link ${pathname === "/category-management" ? "active" : ""}`} href="/category-management">
            <List size={18} /> Category Management
          </Link>
        </nav>
      </aside>

      <div className="content">
        <header className="topbar">
          <h1>Salary Deductions Setup</h1>
          <button id="logoutBtn" className="logout-btn" onClick={() => router.push("/")}>
            <LogOut size={18} /> Logout
          </button>
        </header>

      <main className="main-content">

        {/* CATEGORY FORM */}
        <section className="panel">
          <h2>Deduction Category</h2>

          <form className="form-grid" onSubmit={saveCategory}>
            <input
              value={catForm.name}
              onChange={(e) =>
                setCatForm({ ...catForm, name: e.target.value })
              }
              placeholder="Tax / Insurance / Pension"
            />

            <select
              value={catForm.status}
              onChange={(e) =>
                setCatForm({ ...catForm, status: e.target.value })
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <button type="submit" className="primary-btn">
              Save Category
            </button>

            <button type="button" onClick={resetCategoryForm}>
              Cancel
            </button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {deductionCategories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.status}</td>
                  <td>
                    <CategoryActions category={c} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* RULES */}
        <section className="panel">
          <h2>Salary Deduction Rules</h2>

          <form className="form-grid" onSubmit={saveRule}>
            <select
              value={ruleForm.salaryId}
              onChange={(e) =>
                setRuleForm({ ...ruleForm, salaryId: Number(e.target.value) })
              }
            >
              <option value="">Select Salary</option>
              {salaryList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              value={ruleForm.deductionCategoryId}
              onChange={(e) =>
                setRuleForm({
                  ...ruleForm,
                  deductionCategoryId: Number(e.target.value),
                })
              }
            >
              <option value="">Select Category</option>
              {deductionCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={ruleForm.percentage}
              onChange={(e) =>
                setRuleForm({
                  ...ruleForm,
                  percentage: Number(e.target.value),
                })
              }
              placeholder="Percentage"
            />

            <select
              value={ruleForm.status}
              onChange={(e) =>
                setRuleForm({ ...ruleForm, status: e.target.value })
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <button type="submit">Save Rule</button>
            <button type="button" onClick={resetRuleForm}>
              Cancel
            </button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Salary</th>
                <th>Category</th>
                <th>%</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {salaryDeductions.map((r) => (
                <tr key={r.id}>
                  <td>
                    {salaryList.find((s) => s.id === r.salaryId)?.label}
                  </td>
                  <td>{getCategoryName(r.deductionCategoryId)}</td>
                  <td>{r.percentage}%</td>
                  <td>{r.status}</td>
                  <td>
                    <RuleActions rule={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
      </div>
    </div>
  );
}