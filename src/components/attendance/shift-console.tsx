'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FloatButton } from '@/components/ui/float-button';
import { FormGrid, FormSection } from '@/components/ui/form-section';
import { MinimalTable } from '@/components/ui/minimal-table';
import { shiftService, type Shift } from '@/services/attendance/shift.service';
import { peopleService, type Employee, type Department } from '@/services/organization/people.service';

export function ShiftConsole() {
  const { api, can, session } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [name, setName] = useState(''); const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('18:30'); const [timezone, setTimezone] = useState('Asia/Karachi');
  const [grace, setGrace] = useState(30);
  const [departmentId, setDepartmentId] = useState(''); const [departmentShift, setDepartmentShift] = useState('');
  const [employeeId, setEmployeeId] = useState(''); const [employeeShift, setEmployeeShift] = useState('');
  const canManage = can('attendance.manage');
  const businessWide = canManage && Boolean(session?.permissions && !('platform' in session.permissions) && session.permissions['attendance.manage']?.branchIds === null);
  const canSeeEmployees = can('organization.read');

  const reload = useCallback(async () => {
    const [items, depts, staff] = await Promise.all([
      shiftService.list(api),
      canSeeEmployees ? peopleService.listDepartments(api) : Promise.resolve([] as Department[]),
      canSeeEmployees ? peopleService.listEmployees(api) : Promise.resolve([] as Employee[]),
    ]);
    setShifts(items); setDepartments(depts); setEmployees(staff);
  }, [api, canSeeEmployees]);

  useEffect(() => {
    let active = true;
    void Promise.all([
      shiftService.list(api),
      canSeeEmployees ? peopleService.listDepartments(api) : Promise.resolve([] as Department[]),
      canSeeEmployees ? peopleService.listEmployees(api) : Promise.resolve([] as Employee[]),
    ]).then(([items, depts, staff]) => { if (active) { setShifts(items); setDepartments(depts); setEmployees(staff); } })
      .catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : 'Could not load shifts'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, canSeeEmployees]);

  async function submit(event: FormEvent<HTMLFormElement>, save: () => Promise<void>) {
    event.preventDefault(); setError(''); setNotice(''); setBusy(true);
    try { await save(); await reload(); setNotice('Saved successfully.'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not save shift'); }
    finally { setBusy(false); }
  }

  return <div className="record-page">
    <p className="eyebrow">Attendance setup</p><h1 className="page-heading">Shifts & flexibility</h1>
    <p className="page-lead">A grace period controls when a check-in becomes late. Shift timings remain unchanged.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    {notice && <p className="form-success">{notice}</p>}
    {loading ? <section className="record-panel">Loading shift settings...</section> : <>
      <FormSection title="Shift templates" description="Business-level templates can be assigned to departments or individual employees.">
        <MinimalTable headings={['Shift', 'Hours', 'Grace period', 'Timezone']} isEmpty={!shifts.length} empty="No shifts configured yet. Create a shift to assign work hours.">
          {shifts.map((shift) => <tr key={shift.id}>
            <td><strong>{shift.name}</strong></td><td>{shift.startTimeLocal} – {shift.endTimeLocal}</td>
            <td>{shift.graceMinutes} minutes</td><td>{shift.timezone}</td>
          </tr>)}
        </MinimalTable>
      </FormSection>

      {businessWide && <FormSection title="Create shift" description="Example: 10:00 start with 30 minutes grace means late starts after 10:30.">
        <form className="record-form" onSubmit={(event) => void submit(event, async () => {
          await shiftService.create(api, { name, startTimeLocal: start, endTimeLocal: end, timezone, graceMinutes: grace }); setName('');
        })}>
          <FormGrid>
            <label className="field">Shift name<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Morning shift" /></label>
            <label className="field">Timezone<input required value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Asia/Karachi" /></label>
            <label className="field">Start time<input required type="time" value={start} onChange={(event) => setStart(event.target.value)} /></label>
            <label className="field">End time<input required type="time" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
            <label className="field">Grace minutes (0–180)<input required type="number" min={0} max={180} value={grace} onChange={(event) => setGrace(Number(event.target.value))} /></label>
          </FormGrid>
          <FloatButton type="submit" variant="solid" compact disabled={busy}>{busy ? 'Saving...' : 'Create shift'}</FloatButton>
        </form>
      </FormSection>}

      {businessWide && canSeeEmployees && <FormSection title="Department default" description="Employees inherit this shift unless they have an individual override.">
        <form className="record-form" onSubmit={(event) => void submit(event, async () => {
          await shiftService.assignDepartment(api, departmentId, departmentShift || null);
        })}>
          <FormGrid>
            <label className="field">Department<select required value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}><option value="">Choose department</option>{departments.map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></label>
            <label className="field">Default shift<select value={departmentShift} onChange={(event) => setDepartmentShift(event.target.value)}><option value="">No default</option>{shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name}</option>)}</select></label>
          </FormGrid>
          <FloatButton type="submit" variant="solid" compact disabled={busy || !departmentId}>Save department default</FloatButton>
        </form>
        <MinimalTable headings={['Department', 'Default shift']} isEmpty={!departments.length} empty="No departments defined.">
          {departments.map((dept) => <tr key={dept.id}><td>{dept.name}</td><td>{shifts.find((shift) => shift.id === dept.defaultShiftTemplateId)?.name ?? 'Not assigned'}</td></tr>)}
        </MinimalTable>
      </FormSection>}

      {canManage && canSeeEmployees && <FormSection title="Individual override" description="Set an employee-specific shift, or clear it to use their department default.">
        <form className="record-form" onSubmit={(event) => void submit(event, async () => {
          await shiftService.assignEmployee(api, employeeId, employeeShift || null);
        })}>
          <FormGrid>
            <label className="field">Employee<select required value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}><option value="">Choose employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} · {employee.employeeCode}</option>)}</select></label>
            <label className="field">Shift override<select value={employeeShift} onChange={(event) => setEmployeeShift(event.target.value)}><option value="">Use department default</option>{shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name}</option>)}</select></label>
          </FormGrid>
          <FloatButton type="submit" variant="solid" compact disabled={busy || !employeeId}>Save override</FloatButton>
        </form>
        <MinimalTable headings={['Employee', 'Effective shift', 'Source']} isEmpty={!employees.length} empty="No employees available to assign.">
          {employees.map((employee) => {
            const dept = departments.find((item) => item.id === employee.primaryDepartmentId);
            const effective = employee.shiftTemplateId ?? dept?.defaultShiftTemplateId;
            return <tr key={employee.id}><td>{employee.fullName}</td><td>{shifts.find((item) => item.id === effective)?.name ?? 'Unassigned'}</td><td>{employee.shiftTemplateId ? 'Individual' : 'Department/default'}</td></tr>;
          })}
        </MinimalTable>
      </FormSection>}
    </>}
  </div>;
}
