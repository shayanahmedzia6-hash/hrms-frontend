"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { securityService } from "@/services/auth/auth.service";
import { FloatButton } from "@/components/ui/float-button";
import { useHydrated } from "@/hooks/use-hydrated";

export default function SettingsPage() {
  const { api, logout, logoutAll, session } = useAuth();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useHydrated();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [mfaPassword, setMfaPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    void securityService.mfaStatus(api).then((state) => {
      if (active) setMfaEnabled(state.enabled);
    });
    return () => {
      active = false;
    };
  }, [api]);

  const activeAppearance = mounted ? (theme === "system" ? resolvedTheme : theme) : undefined;

  async function beginMfa() {
    setError("");
    setBusy(true);
    try {
      const result = await securityService.setupMfa(api, mfaPassword);
      setMfaSecret(result.secret);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to start setup");
    } finally {
      setBusy(false);
    }
  }

  async function activateMfa() {
    setError("");
    setBusy(true);
    try {
      const result = await securityService.activateMfa(api, mfaCode);
      setRecoveryCodes(result.recoveryCodes);
      setMfaEnabled(true);
      setMfaSecret("");
      setMfaPassword("");
      setMfaCode("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to enable two-step verification");
    } finally {
      setBusy(false);
    }
  }

  async function disableMfa() {
    setError("");
    setBusy(true);
    try {
      await securityService.disableMfa(api, mfaPassword, mfaCode);
      await logoutAll().catch(() => undefined);
      router.replace("/login");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to disable two-step verification");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await securityService.changePassword(api, currentPassword, newPassword);
      await logoutAll().catch(() => undefined);
      router.replace("/login");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to change password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="eyebrow">Account settings</p>
      <h1 className="page-heading">My access & preferences</h1>
      <p className="page-lead">
        Manage appearance, password and sessions. Role and branch access are managed by your business administrator.
      </p>
      {error ? <p role="alert" className="form-error subsection">{error}</p> : null}
      <div className="admin-grid">
        <section className="admin-panel">
          <h2>Appearance</h2>
          <p>Choose light or dark mode. You can also switch quickly with the moon button in the header.</p>
          <div className="button-row">
            <FloatButton
              type="button"
              variant="outline"
              className={activeAppearance === "light" ? "is-selected" : ""}
              onClick={() => setTheme("light")}
            >
              <Sun size={16} /> Light
            </FloatButton>
            <FloatButton
              type="button"
              variant="solid"
              className={activeAppearance === "dark" ? "is-selected" : ""}
              onClick={() => setTheme("dark")}
            >
              <Moon size={16} /> Dark
            </FloatButton>
          </div>
        </section>

        <section className="admin-panel">
          <h2>My Access</h2>
          <p>
            Permissions are calculated from your active role grants on the backend. Changes made by your administrator
            apply to the next request.
          </p>
          {session?.account.accountType === "platform" ? (
            <div className="admin-list-item">
              <strong>Platform Super Admin</strong>
              <span>Platform-wide administration</span>
            </div>
          ) : (
            <div className="admin-list">
              {Object.entries(session?.permissions ?? {})
                .filter(([, scope]) => Boolean(scope))
                .map(([permission, scope]) => (
                  <div className="admin-list-item" key={permission}>
                    <div>
                      <strong>{permission}</strong>
                      <span>
                        {scope && typeof scope === "object" && scope.branchIds === null
                          ? "Entire business"
                          : scope && typeof scope === "object"
                            ? `${scope.branchIds?.length ?? 0} assigned branch(es)`
                            : ""}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section className="admin-panel">
          <h2>Change password</h2>
          <form className="form-stack" onSubmit={(event) => void changePassword(event)}>
            <label>
              Current password
              <input
                type="password"
                required
                value={currentPassword}
                autoComplete="current-password"
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <label>
              New password (12+ characters)
              <input
                type="password"
                minLength={12}
                required
                value={newPassword}
                autoComplete="new-password"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <FloatButton type="submit" variant="solid" disabled={busy}>
              Change password and sign out
            </FloatButton>
          </form>
        </section>

        <section className="admin-panel">
          <h2>Sign out from all devices</h2>
          <p>
            Revoke every refresh session and previously issued access token for your account. You must sign in again on
            each device.
          </p>
          <FloatButton
            type="button"
            variant="outline"
            onClick={() => void logoutAll().then(() => router.replace("/login"))}
          >
            Sign out all devices
          </FloatButton>
        </section>

        <section className="admin-panel">
          <h2>Two-step verification</h2>
          <p>
            Status: {mfaEnabled === null ? "Loading…" : mfaEnabled ? "Enabled" : "Not enabled"}. Use a standard TOTP
            authenticator app.
          </p>
          {recoveryCodes.length > 0 ? (
            <div className="form-stack">
              <p>
                Save these recovery codes now. All older sessions have been invalidated; sign in again using your
                authenticator.
              </p>
              <pre className="code-box">{recoveryCodes.join("\n")}</pre>
              <FloatButton
                type="button"
                variant="solid"
                onClick={() => void logout().then(() => router.replace("/login"))}
              >
                I saved the codes — sign out
              </FloatButton>
            </div>
          ) : null}
          <div className="form-stack">
            {!mfaEnabled && !mfaSecret ? (
              <>
                <label>
                  Current password
                  <input
                    type="password"
                    value={mfaPassword}
                    onChange={(e) => setMfaPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                <FloatButton type="button" variant="outline" disabled={busy || !mfaPassword} onClick={() => void beginMfa()}>
                  Set up authenticator
                </FloatButton>
              </>
            ) : null}
            {mfaSecret ? (
              <>
                <p>Add this setup key to your authenticator. It changes every 30 seconds.</p>
                <div className="code-box">{mfaSecret}</div>
                <label>
                  6-digit authenticator code
                  <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} autoComplete="one-time-code" />
                </label>
                <FloatButton
                  type="button"
                  variant="solid"
                  disabled={busy || mfaCode.length !== 6}
                  onClick={() => void activateMfa()}
                >
                  Verify and enable
                </FloatButton>
              </>
            ) : null}
            {mfaEnabled ? (
              <>
                <label>
                  Current password
                  <input
                    type="password"
                    value={mfaPassword}
                    onChange={(e) => setMfaPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                <label>
                  Authenticator or recovery code
                  <input value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} autoComplete="one-time-code" />
                </label>
                <FloatButton
                  type="button"
                  variant="outline"
                  disabled={busy || !mfaPassword || !mfaCode}
                  onClick={() => void disableMfa()}
                >
                  Disable two-step verification
                </FloatButton>
              </>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
