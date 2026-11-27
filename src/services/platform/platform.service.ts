import type { ApiRequest } from "@/services/shared/api";
import { postJson } from "@/services/shared/api";

export type Business = {
  id: string; name: string; code: string; currency: string; status: string;
  branchLimit: number; activeBranchCount: number; subscriptionPlanCode: string;
};
export type InitialBranch = { code: string; name: string; timezone: string };
export type AdminInvitation = { email: string; invitationToken: string; expiresAt: string };
export type CreatedBusiness = { businessId: string; adminInvitation: AdminInvitation | null };
export type CreateBusiness = {
  code: string; name: string; currency: string; timezone: string; subscriptionPlanCode: string;
  branchLimit: number; branches: InitialBranch[]; adminEmail?: string;
};

export const platformService = {
  listBusinesses: (api: ApiRequest) => api<Business[]>("platform/businesses"),
  createBusiness: (api: ApiRequest, input: CreateBusiness) => postJson<CreatedBusiness>(api, "platform/businesses", input),
  addBranch: (api: ApiRequest, businessId: string, input: InitialBranch) => postJson<void>(api, `platform/businesses/${businessId}/branches`, input),
  inviteAdmin: (api: ApiRequest, businessId: string, email: string) => postJson<AdminInvitation>(api, `platform/businesses/${businessId}/admin-invitations`, { adminEmail: email }),
};
