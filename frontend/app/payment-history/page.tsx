"use client";

import'./globals.css';
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Users, 
  Database, 
  ShieldCheck, 
  History, 
  UserPlus, 
  Scissors, 
  MapPin, 
  List,
  LogOut
} from "lucide-react";
import regLogo from "../../REG_Logo.png";

export default function PaymentHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const paymentHistoryData = {
    branch: [
      { id: 1, name: "Kigali Branch" },
      { id: 2, name: "Musanze Branch" }
    ],
    employee: [
      { id: 1, firstName: "Jean", lastName: "K.", branchId: 1 },
      { id: 2, firstName: "Marie", lastName: "U.", branchId: 1 },
      { id: 3, firstName: "Peter", lastName: "N.", branchId: 2 }
    ],
    payment: [
      { id: 1, month: 1, year: 2026, days: 31, grossAmount: 850000, deductedAmount: 120000, paidNetAmount: 730000, employeeId: 1, branchId: 1, payDate: "2026-01-31", status: "PAID" },
      { id: 2, month: 1, year: 2026, days: 31, grossAmount: 620000, deductedAmount: 90000, paidNetAmount: 530000, employeeId: 2, branchId: 1, payDate: "2026-01-31", status: "PAID" },
      { id: 3, month: 2, year: 2026, days: 28, grossAmount: 850000, deductedAmount: 120000, paidNetAmount: 730000, employeeId: 1, branchId: 1, payDate: "2026-02-28", status: "PAID" },
      { id: 4, month: 2, year: 2026, days: 28, grossAmount: 850000, deductedAmount: 120000, paidNetAmount: 730000, employeeId: 3, branchId: 2, payDate: "2026-02-28", status: "CANCELLED" }
    ]
  };

  const [employeeFilter, setEmployeeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  function employeeNameById(id: number) {
    const emp = paymentHistoryData.employee.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
  }

  function branchNameById(id: number) {
    const br = paymentHistoryData.branch.find(b => b.id === id);
    return br ? br.name : "Unknown";
  }

  const filteredPayments = useMemo(() => {
    return paymentHistoryData.payment.filter(item => {
      if (employeeFilter && item.employeeId !== Number(employeeFilter)) return false;
      if (branchFilter && item.branchId !== Number(branchFilter)) return false;
      if (statusFilter && item.status !== statusFilter) return false;
      if (monthFilter && item.month !== Number(monthFilter)) return false;
      if (yearFilter && item.year !== Number(yearFilter)) return false;
      return true;
    });
  }, [employeeFilter, branchFilter, statusFilter, monthFilter, yearFilter]);

  const totalNet = filteredPayments.reduce((sum, p) => sum + p.paidNetAmount, 0);

  function resetFilters() {
    setEmployeeFilter("");
    setBranchFilter("");
    setStatusFilter("");
    setMonthFilter("");
    setYearFilter("");
  }

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
          <h1>Payment History</h1>
          <button id="logoutBtn" className="logout-btn" onClick={() => router.push("/")}>
            <LogOut size={18} /> Logout
          </button>
        </header>

      <main className="main-content">

        {/* FILTERS */}
        <section className="panel">
          <h2>Filters</h2>

          <div className="form-grid">

            <div className="field-group">
              <label>Employee</label>
              <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
                <option value="">All Employees</option>
                {paymentHistoryData.employee.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Branch</label>
              <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                <option value="">All Branches</option>
                {paymentHistoryData.branch.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="field-group">
              <label>Month</label>
              <input
                type="number"
                min={1}
                max={12}
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Year</label>
              <input
                type="number"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button className="primary-btn" onClick={() => {}}>Apply (auto)</button>
              <button type="button" className="secondary-btn" onClick={resetFilters}>
                Reset
              </button>
            </div>

          </div>
        </section>

        {/* TABLE */}
        <section className="panel">
          <h2>Payment Records</h2>

          <div className="summary">
            Showing {filteredPayments.length} record(s), total net paid {totalNet.toLocaleString()}.
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Branch</th>
                  <th>Month/Year</th>
                  <th>Days</th>
                  <th>Gross</th>
                  <th>Deducted</th>
                  <th>Net Paid</th>
                  <th>Status</th>
                  <th>Pay Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map(item => (
                  <tr key={item.id}>
                    <td>{employeeNameById(item.employeeId)}</td>
                    <td>{branchNameById(item.branchId)}</td>
                    <td>{item.month}/{item.year}</td>
                    <td>{item.days}</td>
                    <td>{item.grossAmount.toLocaleString()}</td>
                    <td>{item.deductedAmount.toLocaleString()}</td>
                    <td>{item.paidNetAmount.toLocaleString()}</td>
                    <td>{item.status}</td>
                    <td>{item.payDate}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </section>

      </main>
      </div>
    </div>
  );
}