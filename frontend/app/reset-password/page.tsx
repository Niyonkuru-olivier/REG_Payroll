"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import "../globals.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const passwordRule =
    "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.";
  const checks = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength =
    passedChecks <= 2 ? "Weak" : passedChecks <= 4 ? "Medium" : "Strong";

  const isStrongPassword = (value: string): boolean => {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value)
    );
  };

  useEffect(() => {
    const verifyToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get("token") || "";
      setToken(tokenFromUrl);

      if (!tokenFromUrl) {
        setError("Missing reset token.");
        setValidating(false);
        return;
      }

      try {
        await apiFetch(`/auth/reset-password/verify?token=${encodeURIComponent(tokenFromUrl)}`);
        setTokenValid(true);
      } catch {
        setError("Reset token is invalid or expired.");
      } finally {
        setValidating(false);
      }
    };
    verifyToken();
  }, []);

  const handleSubmit = async () => {
    if (!isStrongPassword(password)) {
      setError(passwordRule);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      });
      router.push("/?reset=success");
    } catch {
      setError(
        "Failed to reset password. Token may be expired, invalid, or the password may match your current one.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <main>
        <section className="panel">
          <h2>Reset Password</h2>
          {validating && <p>Verifying token...</p>}
          {!validating && !tokenValid && <p style={{ color: "red" }}>{error}</p>}
          {!validating && tokenValid && (
            <div className="modal-body" style={{ maxWidth: "420px", paddingLeft: 0 }}>
              <div className="form-field">
                <label>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <small>{passwordRule}</small>
                <p>
                  Strength: <strong>{strength}</strong>
                </p>
                <ul style={{ marginTop: "0.25rem", paddingLeft: "1.25rem" }}>
                  {!checks.minLength && <li>At least 8 characters</li>}
                  {!checks.uppercase && <li>At least one uppercase letter</li>}
                  {!checks.lowercase && <li>At least one lowercase letter</li>}
                  {!checks.number && <li>At least one number</li>}
                  {!checks.special && <li>At least one special character</li>}
                </ul>
              </div>
              <div className="form-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <button className="btn btn-primary" onClick={handleSubmit}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
