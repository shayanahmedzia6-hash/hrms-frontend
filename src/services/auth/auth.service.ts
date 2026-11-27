import { responseJson, type ApiRequest } from "@/services/shared/api";

export type Account = {
  id: string;
  email: string;
  businessId: string | null;
  accountType: "platform" | "business";
};

export type LoginCredentials = { identifier: string; password: string; mfaCode?: string };
export type LoginResponse =
  | { mfaRequired: true }
  | { mfaRequired: false; accessToken: string; account: Account };

export const authService = {
  login: (values: LoginCredentials) => responseJson<LoginResponse>(fetch("/api/v1/auth/login", {
    method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
  })),
  refresh: () => responseJson<{ accessToken: string }>(fetch("/api/v1/auth/refresh", { method: "POST", credentials: "include" })),
  logout: () => fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" }),
  acceptInvitation: (token: string, password: string) => responseJson<{ accepted: true }>(fetch("/api/v1/auth/invitations/accept", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }),
  })),
};

export const securityService = {
  mfaStatus: (api: ApiRequest) => api<{ enabled: boolean }>("auth/mfa"),
  setupMfa: (api: ApiRequest, currentPassword: string) => api<{ secret: string }>("auth/mfa/setup", { method: "POST", body: JSON.stringify({ currentPassword }) }),
  activateMfa: (api: ApiRequest, code: string) => api<{ recoveryCodes: string[] }>("auth/mfa/activate", { method: "POST", body: JSON.stringify({ code }) }),
  disableMfa: (api: ApiRequest, currentPassword: string, code: string) => api<void>("auth/mfa/disable", { method: "POST", body: JSON.stringify({ currentPassword, code }) }),
  changePassword: (api: ApiRequest, currentPassword: string, newPassword: string) => api<void>("auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword, newPassword }) }),
};
