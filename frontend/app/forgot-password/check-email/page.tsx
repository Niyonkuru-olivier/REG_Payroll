"use client";

import Link from "next/link";
import { useMemo } from "react";

export default function CheckEmailPage() {
  const email = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("email") || "";
  }, []);

  return (
    <div className="page-wrap">
      <main>
        <section className="panel" style={{ maxWidth: "640px", margin: "2rem auto" }}>
          <h2>Check your email</h2>
          <p>
            If an account exists for <strong>{email || "your email address"}</strong>, we sent a
            password reset link.
          </p>
          <p>Please open the link in your email and follow the steps to set a new password.</p>
          <p>The link expires in 1 hour for security.</p>
          <Link className="btn btn-primary" href="/">
            Back to Login
          </Link>
        </section>
      </main>
    </div>
  );
}
