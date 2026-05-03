"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import regLogo from "../REG_Logo.png";
import { apiFetch } from "../lib/api";
import { getDashboardRouteByRole } from "../lib/auth";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setResetSuccess(params.get("reset") === "success");
  }, []);

  // ROLE ROUTING
  const handleLogin = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: {
          id: number;
          username?: string;
          email: string;
          role: string;
          fullName: string;
          companyId?: number;
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("loggedUser", JSON.stringify(data.user));

      const route = getDashboardRouteByRole(data.user.role);
      if (!route) {
        setError("No dashboard assigned for this role");
        return;
      }

      setOpen(false);
      router.push(route);
    } catch (err: any) {
      let errorMsg = "Login failed. Please use valid credentials.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message) {
          errorMsg = Array.isArray(parsed.message) ? parsed.message.join("\n") : parsed.message;
        }
      } catch (e) {
        if (err.message && err.message.length > 0 && !err.message.startsWith('{')) {
           errorMsg = err.message;
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setError("Please enter your registered email.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: resetEmail }),
      });
      setOpen(false);
      setForgotMode(false);
      const emailQuery = encodeURIComponent(resetEmail.trim());
      router.push(`/forgot-password/check-email?email=${emailQuery}`);
    } catch {
      setError("Unable to submit request now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">

      {/* HEADER */}
      <header className="site-header">
        <div className="brand">
          <div className="company-logo">
          <Image src={regLogo} alt="" width={180} height={90} priority />
          </div>
          <div className="brand-copy">
            <span className="brand-eyebrow">Rwanda Energy Group</span>
            <span className="brand-text">Reserve Force Payroll System</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Login
        </button>
      </header>

      {/* MAIN */}
      <main>
        {resetSuccess && (
          <section className="overview-item" style={{ marginBottom: "1rem" }}>
            <p>Password updated successfully. Please login with your new password.</p>
          </section>
        )}
        <section className="hero" aria-labelledby="landingTitle">
          
          <p className="eyebrow">Secure Payroll Platform</p>

          <h1 id="landingTitle">
            Manage reserve force payroll with confidence.
          </h1>

          <p className="hero-text">
            Centralized management for employees, salary categories,
            deductions, payments, and access control.
          </p>

          <button className="btn hero-login" onClick={() => setOpen(true)}>
            Login
          </button>
        </section>

        <section className="system-overview">
          <article className="overview-item">
            <h2>Core Modules</h2>
            <p>
              Employee records, salary setup, deduction rules, and monthly payments.
            </p>
          </article>

          <article className="overview-item">
            <h2>Role Based Access</h2>
            <p>
              Unified authentication for Super Admin and all system users.
            </p>
          </article>

          <article className="overview-item">
            <h2>Audit Ready</h2>
            <p>
              Consistent status tracking and timestamps across all reserve force tables.
            </p>
          </article>
        </section>

        <footer className="site-footer">
          <small>Confidential system access only.</small>
        </footer>
      </main>

      {/* LOGIN MODAL */}
      {open && (
        <div className="modal-overlay open" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-header">
              <h2>System Login</h2>
              <button className="close-btn" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {!forgotMode ? (
                <>
                  <div className="form-field">
                    <label>Username or Email</label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label>Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {error && <p style={{ color: "red" }}>{error}</p>}
                  {message && <p style={{ color: "green" }}>{message}</p>}

                  <button className="btn btn-primary" onClick={handleLogin}>
                    {loading ? "Signing in..." : "Login"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setForgotMode(true);
                      setError("");
                      setMessage("");
                    }}
                  >
                    Forgot Password?
                  </button>
                </>
              ) : (
                <>
                  <div className="form-field">
                    <label>Registered Email</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  {message && <p style={{ color: "green" }}>{message}</p>}
                  <button className="btn btn-primary" onClick={handleForgotPassword}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setForgotMode(false);
                      setError("");
                      setMessage("");
                    }}
                  >
                    Back to Login
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}