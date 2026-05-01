"use client";

import './globals.css';
import { useEffect, useState } from "react";

export default function RoleDashboardPage() {
  const [role, setRole] = useState("User");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("role");
    if (r) setRole(r);
  }, []);

  return (
    <div className="role-dashboard-body">
      <main className="role-card">
        <h1>{role} Dashboard</h1>

        <p>
          Your dashboard can be extended here with role-specific modules when
          needed.
        </p>

        <div className="role-actions">
          <a href="/payment-history" className="role-btn">
            Payment History
          </a>

          <a href="/index" className="role-btn logout">
            Logout
          </a>
        </div>
      </main>
    </div>
  );
}