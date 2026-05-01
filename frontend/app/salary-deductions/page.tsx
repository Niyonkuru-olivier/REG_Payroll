"use client";
import './globals.css'
import { useState } from "react";

export default function SalaryDeductionsPage() {
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

  return (
    <div className="page-wrap">
      {/* HEADER */}
      <header className="topbar">
        <div>
          <h1>Salary Deductions Setup</h1>
          <p>Super Admin configuration for deduction categories and rules</p>
        </div>
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
                    <button onClick={() => editCategory(c)}>Edit</button>
                    <button onClick={() => deleteCategory(c.id)}>Delete</button>
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
                    <button onClick={() => editRule(r)}>Edit</button>
                    <button onClick={() => deleteRule(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
}