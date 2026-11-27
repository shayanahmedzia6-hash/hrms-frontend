"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authService } from "@/services/auth/auth.service";
import { FloatButton } from "@/components/ui/float-button";

export default function AcceptInvitePage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setBusy(true);
    try {
      await authService.acceptInvitation(token, password);
      setResult("Your account is ready. Use your email and new password to sign in.");
      setToken("");
      setPassword("");
      setConfirm("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Invitation failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Account activation</p>
        <h1>Accept your invitation</h1>
        <p className="auth-intro">
          Your administrator will provide a one-time invitation code securely. The code expires after seven days.
        </p>
        <form className="form-stack" onSubmit={(event) => void submit(event)}>
          <label>
            Invitation code
            <input required value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" />
          </label>
          <label>
            Create password (12+ characters)
            <input
              type="password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              required
              minLength={12}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          {error ? <p role="alert" className="form-error">{error}</p> : null}
          {result ? <p className="form-success">{result}</p> : null}
          <div className="button-row">
            <FloatButton href="/login" variant="outline">
              Back to login
            </FloatButton>
            <FloatButton type="submit" variant="solid" disabled={busy}>
              {busy ? "Activating…" : "Activate account"}
            </FloatButton>
          </div>
        </form>
        <p className="auth-note">
          Already activated? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
