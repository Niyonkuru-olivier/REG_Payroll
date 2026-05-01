"use client";

import "./globals.css";
import { useState } from "react";

export default function MonthlyPaymentProcessing() {
  const [data, setData] = useState({
    branch: [
      { id: 1, name: "Kigali Branch" },
      { id: 2, name: "Musanze Branch" }
    ],
    employee: [
      { id: 1, firstName: "Jean", lastName: "K.", branchId: 1, categoryId: 1, accountNo: "1002003001" },
      { id: 2, firstName: "Marie", lastName: "U.", branchId: 1, categoryId: 2, accountNo: "1002003002" },
      { id: 3, firstName: "Peter", lastName: "N.", branchId: 2, categoryId: 1, accountNo: "1002003003" }
    ],
    salary: [
      { id: 1, categoryId: 1, grossAmount: 850000, deductions: 120000, status: "ACTIVE" },
      { id: 2, categoryId: 2, grossAmount: 620000, deductions: 90000, status: "ACTIVE" }
    ],
    payment: [] as any[]
  });

  const [form, setForm] = useState({
    processMonth: "",
    processYear: "",
    processDays: "",
    branchId: 1,
    processStatus: "PAID"
  });

  const [summary, setSummary] = useState("No payroll run yet.");

  function handleChange(e: any) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function getBranchName(branchId: number) {
    const branch = data.branch.find((b) => b.id === branchId);
    return branch ? branch.name : "Unknown";
  }

  function getSalaryByCategory(categoryId: number) {
    return data.salary.find(
      (s) => s.categoryId === categoryId && s.status === "ACTIVE"
    );
  }

  function runPayroll(e: any) {
    e.preventDefault();

    const month = Number(form.processMonth);
    const year = Number(form.processYear);
    const days = Number(form.processDays);
    const branchId = Number(form.branchId);
    const status = form.processStatus;

    if (!month || !year || !days || !branchId) return;

    let updatedPayments = data.payment.filter(
      (p) => !(p.month === month && p.year === year && p.branchId === branchId)
    );

    const branchEmployees = data.employee.filter(
      (emp) => emp.branchId === branchId
    );

    let totalNet = 0;

    const payDate = `${year}-${String(month).padStart(2, "0")}-${String(
      Math.min(days, 28)
    ).padStart(2, "0")}`;

    branchEmployees.forEach((emp) => {
      const salary = getSalaryByCategory(emp.categoryId);
      if (!salary) return;

      const paidNetAmount = Math.max(
        salary.grossAmount - salary.deductions,
        0
      );

      totalNet += paidNetAmount;

      const nextId =
        updatedPayments.length > 0
          ? Math.max(...updatedPayments.map((p) => p.id)) + 1
          : 1;

      updatedPayments.push({
        id: nextId,
        month,
        year,
        days,
        grossAmount: salary.grossAmount,
        deductedAmount: salary.deductions,
        paidNetAmount,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        categoryId: emp.categoryId,
        accountNo: emp.accountNo,
        payDate,
        salaryId: salary.id,
        branchId,
        status
      });
    });

    setData({ ...data, payment: updatedPayments });

    setSummary(
      `Run completed for ${month}/${year} (${getBranchName(
        branchId
      )}), status ${status}. Processed ${
        branchEmployees.length
      } employees, total net paid ${totalNet.toLocaleString()}.`
    );
  }

  function resetForm() {
    setForm({
      processMonth: "",
      processYear: "",
      processDays: "",
      branchId: 1,
      processStatus: "PAID"
    });
  }

  return (
    <div className="page-wrap">
      {/* HEADER */}
      <header className="topbar">
        <div>
          <h1>Monthly Payment Processing</h1>
          <p>Admin payroll run module for monthly paid salaries</p>
        </div>

        <div className="topbar-actions">
          <a href="/admin-dashboard" className="nav-link">
            Admin Dashboard
          </a>
          <a href="/" className="logout-link">
            Logout
          </a>
        </div>
      </header>

      <main className="main-content">
        {/* FORM */}
        <section className="panel">
          <h2>Process Monthly Payroll</h2>

          <form className="form-grid" onSubmit={runPayroll}>
            <div className="field-group">
              <label>Month</label>
              <input
                type="number"
                name="processMonth"
                value={form.processMonth}
                onChange={handleChange}
                min="1"
                max="12"
              />
            </div>

            <div className="field-group">
              <label>Year</label>
              <input
                type="number"
                name="processYear"
                value={form.processYear}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Working Days</label>
              <input
                type="number"
                name="processDays"
                value={form.processDays}
                onChange={handleChange}
                min="1"
                max="31"
              />
            </div>

            <div className="field-group">
              <label>Branch</label>
              <select
                name="branchId"
                value={form.branchId}
                onChange={handleChange}
              >
                {data.branch.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Run Status</label>
              <select
                name="processStatus"
                value={form.processStatus}
                onChange={handleChange}
              >
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="primary-btn">Run Payroll</button>
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        {/* RESULTS */}
        <section className="panel">
          <h2>Processed Payments</h2>

          <div className="summary">{summary}</div>

          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month/Year</th>
                <th>Days</th>
                <th>Gross</th>
                <th>Deducted</th>
                <th>Net Paid</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Pay Date</th>
              </tr>
            </thead>

            <tbody>
              {data.payment.map((p) => (
                <tr key={p.id}>
                  <td>{p.employeeName}</td>
                  <td>{p.month}/{p.year}</td>
                  <td>{p.days}</td>
                  <td>{p.grossAmount.toLocaleString()}</td>
                  <td>{p.deductedAmount.toLocaleString()}</td>
                  <td>{p.paidNetAmount.toLocaleString()}</td>
                  <td>{getBranchName(p.branchId)}</td>
                  <td>{p.status}</td>
                  <td>{p.payDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}