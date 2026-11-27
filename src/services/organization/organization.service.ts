import type { ApiRequest } from "@/services/shared/api";
import { postJson } from "@/services/shared/api";

export type Branch = { id: string; code: string; name: string; timezone: string };
export type Role = { id: string; name: string; isSystem: boolean; permissions: string[] };
export type User = { id: string; email: string; status: string };
export type Grant = { id: string; userId: string; roleId: string; scopeType: "business" | "branch"; branchId: string | null };
export type Invite = { email: string; invitationToken: string; expiresAt: string };
export type ScopeInput = { roleId: string; scopeType: "business" | "branch"; branchId?: string };

export const organizationService = {
  listBranches: (api: ApiRequest) => api<Branch[]>("business/branches"),
  listRoles: (api: ApiRequest) => api<Role[]>("business/roles"),
  listPermissions: (api: ApiRequest) => api<string[]>("business/permissions"),
  listUsers: (api: ApiRequest) => api<User[]>("business/users"),
  listGrants: (api: ApiRequest) => api<Grant[]>("business/grants"),
  addBranch: (api: ApiRequest, input: { code: string; name: string; timezone: string }) => postJson<void>(api, "business/branches", input),
  inviteUser: (api: ApiRequest, input: ScopeInput & { email: string }) => postJson<Invite>(api, "business/invitations", input),
  createRole: (api: ApiRequest, name: string, permissions: string[]) => postJson<void>(api, "business/roles", { name, permissions }),
  grantRole: (api: ApiRequest, input: ScopeInput & { userId: string }) => postJson<void>(api, "business/grants", input),
  revokeGrant: (api: ApiRequest, grantId: string) => api<void>(`business/grants/${grantId}/revoke`, { method: "PATCH" }),
};
