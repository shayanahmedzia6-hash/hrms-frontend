import type { ApiRequest } from '@/services/shared/api';
import { postJson } from '@/services/shared/api';

export type Department = { id: string; code: string; name: string; active: boolean; defaultShiftTemplateId: string | null };
export type Employee = {
  id: string; businessId: string; branchId: string; primaryDepartmentId: string;
  employeeCode: string; fullName: string; userId: string | null;
  jobTitle: string | null; phone: string | null; hireDate: string | null;
  status: 'active' | 'inactive' | 'terminated'; shiftTemplateId: string | null;
};
export type Transfer = {
  id: string; fromBranchId: string; toBranchId: string;
  fromDepartmentId: string; toDepartmentId: string;
  transferredByUserId: string; transferredAt: string; reason: string | null;
};
export type EmployeeInput = {
  branchId: string; primaryDepartmentId: string; employeeCode: string; fullName: string;
  userId?: string; jobTitle?: string; phone?: string; hireDate?: string;
};

export const peopleService = {
  listDepartments: (api: ApiRequest) => api<Department[]>('business/organization/departments'),
  addDepartment: (api: ApiRequest, input: { name: string; code: string }) => postJson<Department>(api, 'business/organization/departments', input),
  listEmployees: (api: ApiRequest, branchId?: string) => api<Employee[]>(`business/organization/employees${branchId ? `?branchId=${encodeURIComponent(branchId)}` : ''}`),
  addEmployee: (api: ApiRequest, input: EmployeeInput) => postJson<Employee>(api, 'business/organization/employees', input),
  updateEmployee: (api: ApiRequest, id: string, input: { fullName?: string; jobTitle?: string | null; phone?: string | null; status?: Employee['status'] }) => api<Employee>(`business/organization/employees/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  transferEmployee: (api: ApiRequest, id: string, input: { toBranchId: string; toDepartmentId: string; reason?: string }) => postJson<Employee>(api, `business/organization/employees/${id}/transfer`, input),
  transferHistory: (api: ApiRequest, id: string) => api<Transfer[]>(`business/organization/employees/${id}/transfers`),
  linkAccount: (api: ApiRequest, employeeId: string, userId: string) => postJson<Employee>(api, `business/organization/employees/${employeeId}/link-account`, { userId }),
};
