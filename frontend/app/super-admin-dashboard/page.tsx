"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import { apiFetchAuth } from "../../lib/api";
import { getLoggedUser } from "../../lib/auth";
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



interface Payment {
  id: number;
  month: number;
  year: number;
  days: number;
  grossAmount: number;
  deductedAmount: number;
  paidNetAmount: number;
  employeeId: number;
  categoryId: number;
  salaryId: number;
  status: string;
}

import regLogo from "../../REG_Logo.png";

const appPayment: Payment[] = [{ id: 1, month: 3, year: 2026, days: 30, grossAmount: 850000, deductedAmount: 120000, paidNetAmount: 730000, employeeId: 1, categoryId: 1, salaryId: 1, status: "PAID" }];

export default function SuperAdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    lockedUsers: 0,
    totalEmployees: 0,
    activeRoles: 0,
  });
  const [usersByRole, setUsersByRole] = useState<
    Array<{ role: string; _count: { role: number } }>
  >([]);
  const [userName, setUserName] = useState("");


  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [stats, byRole] = await Promise.all([
          apiFetchAuth<{
            totalUsers: number;
            activeUsers: number;
            blockedUsers: number;
            lockedUsers: number;
            totalEmployees: number;
            activeRoles: number;
          }>("/stats/users"),
          apiFetchAuth<Array<{ role: string; _count: { role: number } }>>("/stats/users-by-role"),
        ]);
        setSummary(stats);
        setUsersByRole(byRole);
      } catch {
        // keep page usable if API temporarily fails
      }
    };
    loadOverview();

    const user = getLoggedUser() as any;
    if (user && user.fullName) {
      setUserName(user.fullName);
    }
  }, []);


  const metrics = [
    { label: "Total Users", value: summary.totalUsers },
    { label: "Total Employees", value: summary.totalEmployees },
    { label: "Payments", value: appPayment.length },
    { label: "Active Roles", value: summary.activeRoles },
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
          <div className="topbar-left">
            <h1>Super Admin Dashboard</h1>
            {userName && <span className="welcome-text">Welcome, {userName}</span>}
          </div>

          <button id="logoutBtn" className="logout-btn" onClick={() => router.push("/")}>
            <LogOut size={18} /> Logout
          </button>
        </header>

        <main className="main-content">
          <section id="overview" className="section active">
            <div className="cards-grid" id="overviewCards">
              {metrics.map((m) => (
                <article className="metric-card" key={m.label}>
                  <h3>{m.label}</h3>
                  <p>{m.value}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}