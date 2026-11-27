import type { ApiRequest } from '@/services/shared/api';
import { postJson } from '@/services/shared/api';

export type Shift = { id: string; name: string; startTimeLocal: string; endTimeLocal: string; timezone: string; graceMinutes: number };
export type ShiftInput = Omit<Shift, 'id'>;

export const shiftService = {
  list: (api: ApiRequest) => api<Shift[]>('business/attendance/shifts'),
  create: (api: ApiRequest, data: ShiftInput) => postJson<Shift>(api, 'business/attendance/shifts', data),
  assignEmployee: (api: ApiRequest, id: string, shiftTemplateId: string | null) => api(`business/attendance/employees/${id}/shift`, { method: 'PATCH', body: JSON.stringify({ shiftTemplateId }) }),
  assignDepartment: (api: ApiRequest, id: string, shiftTemplateId: string | null) => api(`business/attendance/departments/${id}/default-shift`, { method: 'PATCH', body: JSON.stringify({ shiftTemplateId }) }),
};
