"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { apiFetchAuth } from "../../lib/api";
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

/* ── TYPES ── */
interface Role { id: number; name: string; status: string; }
interface Category { id: number; name: string; code: string; status: string; }
interface Salary { id: number; categoryId: number; grossAmount: number; deductions: number; netAmount: number; status: string; }
interface DeductionCategory { id: number; name: string; status: string; }
interface SalaryDeduction { id: number; salaryId: number; deductionCategoryId: number; percentage: number; status: string; }
interface ContractType { id: number; name: string; status: string; }
interface Branch { id: number; name: string; hubId: string; province?: string; district?: string; status: string; }
interface EducationLevel { id: number; name: string; status: string; }
interface Employee { id: number; firstName: string; lastName: string; nationalId: string; branchId: number; categoryId: number; contractTypeId: number; levelId: number; status: string; }
interface Payment { id: number; month: number; year: number; days: number; grossAmount: number; deductedAmount: number; paidNetAmount: number; employeeId: number; categoryId: number; salaryId: number; status: string; }
interface User { id: number; name: string; username: string; national_id: string; roleId: number; status: string; }

/* ── INITIAL DATA ── */
const appCategories: Category[] = [];
const appBranch: Branch[] = [];
const appSalary: Salary[] = [{ id: 1, categoryId: 1, grossAmount: 850000, deductions: 120000, netAmount: 730000, status: "ACTIVE" }];
const appDeductionCategory: DeductionCategory[] = [{ id: 1, name: "Tax", status: "ACTIVE" }, { id: 2, name: "Insurance", status: "ACTIVE" }];
const appSalaryDeductions: SalaryDeduction[] = [{ id: 1, salaryId: 1, deductionCategoryId: 1, percentage: 12, status: "ACTIVE" }];
const appContractType: ContractType[] = [{ id: 1, name: "Permanent", status: "ACTIVE" }, { id: 2, name: "Fixed Term", status: "ACTIVE" }];
const appEducationLevel: EducationLevel[] = [{ id: 1, name: "Diploma", status: "ACTIVE" }, { id: 2, name: "Degree", status: "ACTIVE" }];
const appEmployee: Employee[] = [{ id: 1, firstName: "Jean", lastName: "K.", nationalId: "1199887766554433", branchId: 1, categoryId: 1, contractTypeId: 1, levelId: 2, status: "ACTIVE" }];
const appPayment: Payment[] = [{ id: 1, month: 3, year: 2026, days: 30, grossAmount: 850000, deductedAmount: 120000, paidNetAmount: 730000, employeeId: 1, categoryId: 1, salaryId: 1, status: "PAID" }];

export default function DataManagement() {
  const router = useRouter();
  const pathname = usePathname();

  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedRoles = await apiFetchAuth<any[]>("/roles");
        if (fetchedRoles) {
          setRoles(fetchedRoles.map(r => ({ id: r.role_id, name: r.role_name, status: r.status })));
        }
        const authUsers = await apiFetchAuth<Array<any>>(`/users`);
        if (authUsers) {
          setUsers(authUsers.map(u => ({ id: u.user_id, name: u.full_name || u.username, username: u.username || "", national_id: u.national_id || "", roleId: u.role === "SuperAdmin" ? 1 : u.role === "Employee" ? 3 : 2, status: u.is_locked ? "LOCKED" : !u.is_active ? "BLOCKED" : "ACTIVE" })));
        }
      } catch {}
    };
    loadData();
  }, []);

  /* ── data table rows ── */
  const dataTableRows = [
    { name: "Category", keys: "id, name, code, status", count: appCategories.length, status: "ACTIVE" },
    { name: "Salary", keys: "id, categoryId, grossAmount, netAmount, status", count: appSalary.length, status: "ACTIVE" },
    { name: "Deduction Category", keys: "id, name, status", count: appDeductionCategory.length, status: "ACTIVE" },
    { name: "Salary Deductions", keys: "id, salaryId, deductionCategoryId, percentage", count: appSalaryDeductions.length, status: "ACTIVE" },
    { name: "Contract Type", keys: "id, name, status", count: appContractType.length, status: "ACTIVE" },
    { name: "Branch", keys: "id, name, hubId, status", count: appBranch.length, status: "ACTIVE" },
    { name: "Education Level", keys: "id, name, status", count: appEducationLevel.length, status: "ACTIVE" },
    { name: "Employee", keys: "id, firstName, lastName, branchId, categoryId", count: appEmployee.length, status: "ACTIVE" },
    { name: "Payment", keys: "id, month, year, employeeId, paidNetAmount, status", count: appPayment.length, status: "PAID/CANCELLED" },
    { name: "Role", keys: "id, name, status", count: roles.length, status: "ACTIVE" },
    { name: "User", keys: "id, name, username, roleId, status", count: users.length, status: "ACTIVE/BLOCKED/LOCKED" },
  ];

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

      {/* ── CONTENT ── */}
      <div className="content">
        <header className="topbar">
          <h1>Super Admin Dashboard</h1>
          <button id="logoutBtn" className="logout-btn" onClick={() => router.push("/")}>
            <LogOut size={18} /> Logout
          </button>
        </header>

        <main className="main-content">
          <section id="data" className="section active">
            <div className="panel">
              <h2>Reserve Force Data Tables</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Table Name</th>
                      <th>Key Fields</th>
                      <th>Records</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="dataTablesBody">
                    {dataTableRows.map((row) => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td>{row.keys}</td>
                        <td>{row.count}</td>
                        <td>{row.status}</td>
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
