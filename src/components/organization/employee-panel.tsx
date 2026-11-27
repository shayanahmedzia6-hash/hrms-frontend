'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { FloatButton } from '@/components/ui/float-button';
import { FormGrid, FormSection } from '@/components/ui/form-section';
import { MinimalTable } from '@/components/ui/minimal-table';
import { peopleService, type Department, type Employee, type Transfer } from '@/services/organization/people.service';
import type { Branch, User } from '@/services/organization/organization.service';

type Props = { employees: Employee[]; departments: Department[]; branches: Branch[]; users: User[]; canManage: boolean; canLink: boolean; reload: () => Promise<void> };

export function EmployeePanel({ employees, departments, branches, users, canManage, canLink, reload }: Props) {
  const { api } = useAuth();
  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState(''); const [code, setCode] = useState('');
  const [branchId, setBranchId] = useState(''); const [departmentId, setDepartmentId] = useState('');
  const [jobTitle, setJobTitle] = useState(''); const [phone, setPhone] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [linkUserId, setLinkUserId] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [toBranch, setToBranch] = useState(''); const [toDepartment, setToDepartment] = useState('');
  const [reason, setReason] = useState('');
  const [history, setHistory] = useState<Transfer[]>([]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');

  const branchName = (id: string) => branches.find((branch) => branch.id === id)?.name ?? 'Unknown branch';
  const departmentName = (id: string) => departments.find((dept) => dept.id === id)?.name ?? 'Unknown department';
  const filtered = useMemo(() => employees.filter((employee) =>
    (!filterBranch || employee.branchId === filterBranch) &&
    `${employee.employeeCode} ${employee.fullName} ${employee.jobTitle ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  ), [employees, filterBranch, search]);
  const availableUsers = users.filter((user) => !employees.some((employee) => employee.userId === user.id));

  useEffect(() => {
    if (!selected) return;
    let active = true;
    void peopleService.transferHistory(api, selected.id).then((items) => { if (active) setHistory(items); }).catch(() => { if (active) setHistory([]); });
    return () => { active = false; };
  }, [api, selected]);

  async function submitEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await peopleService.addEmployee(api, { branchId, primaryDepartmentId: departmentId, employeeCode: code,
        fullName: name, ...(jobTitle ? { jobTitle } : {}), ...(phone ? { phone } : {}), ...(hireDate ? { hireDate } : {}), ...(linkUserId ? { userId: linkUserId } : {}) });
      await reload(); setAdding(false); setName(''); setCode(''); setJobTitle(''); setPhone(''); setHireDate(''); setLinkUserId('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not add employee'); }
    finally { setBusy(false); }
  }

  async function submitTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError('');
    try {
      await peopleService.transferEmployee(api, selected.id, { toBranchId: toBranch, toDepartmentId: toDepartment, ...(reason ? { reason } : {}) });
      await reload(); setSelected(null); setHistory([]); setReason('');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Transfer failed'); }
    finally { setBusy(false); }
  }

  return <FormSection title="Employees" description="One primary branch and department per employee; previous assignments are retained."
    action={canManage && <FloatButton variant="outline" compact onClick={() => { setAdding(!adding); setSelected(null); }}>{adding ? 'Cancel' : 'Add employee'}</FloatButton>}>
    {adding && <form className="record-form" onSubmit={(event) => void submitEmployee(event)}>
      <h3>New employee</h3>
      <FormGrid>
        <label className="field">Full name<input required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="field">Employee ID<input required minLength={2} maxLength={30} value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="EMP-001" /></label>
        <label className="field">Primary branch<select required value={branchId} onChange={(event) => setBranchId(event.target.value)}><option value="">Choose branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <label className="field">Department<select required value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}><option value="">Choose department</option>{departments.filter((dept) => dept.active).map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></label>
        <label className="field">Job title (optional)<input value={jobTitle} maxLength={100} onChange={(event) => setJobTitle(event.target.value)} /></label>
        <label className="field">Phone (optional)<input value={phone} maxLength={40} onChange={(event) => setPhone(event.target.value)} /></label>
        <label className="field">Hire date (optional)<input type="date" value={hireDate} onChange={(event) => setHireDate(event.target.value)} /></label>
        {canLink && <label className="field">Login account (optional)<select value={linkUserId} onChange={(event) => setLinkUserId(event.target.value)}><option value="">No account yet</option>{availableUsers.map((user) => <option key={user.id} value={user.id}>{user.email}</option>)}</select></label>}
      </FormGrid>
      {error && <p role="alert" className="form-error">{error}</p>}
      <FloatButton type="submit" variant="solid" compact disabled={busy || !departments.length || !branches.length}>{busy ? 'Saving...' : 'Create employee'}</FloatButton>
    </form>}

    <div className="record-filters">
      <input aria-label="Search employees" placeholder="Search name, ID or job title" value={search} onChange={(event) => setSearch(event.target.value)} />
      <select aria-label="Filter by branch" value={filterBranch} onChange={(event) => setFilterBranch(event.target.value)}><option value="">All accessible branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
    </div>
    <MinimalTable headings={['Employee', 'Department', 'Branch', 'Status', '']} isEmpty={filtered.length === 0} empty={employees.length ? 'No matching employees.' : 'No employees yet. Add your first employee above.'}>
      {filtered.map((employee) => <tr key={employee.id}>
        <td><strong>{employee.fullName}</strong><span className="record-subline">{employee.employeeCode} · {employee.jobTitle ?? 'No job title'}</span></td>
        <td>{departmentName(employee.primaryDepartmentId)}</td><td>{branchName(employee.branchId)}</td>
        <td><span className="record-status">{employee.status}</span></td>
        <td><button type="button" className="record-link" onClick={() => { setSelected(employee); setAdding(false); setToBranch(employee.branchId); setToDepartment(employee.primaryDepartmentId); setError(''); }}>Details</button></td>
      </tr>)}
    </MinimalTable>

    {selected && <div className="record-detail"><div className="record-detail-heading"><div><h3>{selected.fullName}</h3><p>{selected.employeeCode} · {branchName(selected.branchId)} · {departmentName(selected.primaryDepartmentId)}</p></div>
      <button type="button" className="record-link" onClick={() => { setSelected(null); setError(''); }}>Close</button></div>
      <p className="record-subline">Login account: {users.find((user) => user.id === selected.userId)?.email ?? (selected.userId ? 'Linked' : 'Not linked')}</p>
      {canLink && !selected.userId && <div className="record-form">
        <h3>Link existing login account</h3>
        <FormGrid><label className="field">Unlinked user<select required value={linkUserId} onChange={(event) => setLinkUserId(event.target.value)}><option value="">Choose account</option>{availableUsers.map((user) => <option key={user.id} value={user.id}>{user.email}</option>)}</select></label></FormGrid>
        {error && <p className="form-error" role="alert">{error}</p>}
        <FloatButton type="button" variant="solid" compact disabled={busy || !linkUserId} onClick={() => { setBusy(true); setError(''); void peopleService.linkAccount(api, selected.id, linkUserId).then(() => reload()).then(() => { setSelected(null); setLinkUserId(''); }).catch((failure) => setError(failure instanceof Error ? failure.message : 'Link failed')).finally(() => setBusy(false)); }}>Link account</FloatButton>
      </div>}
      {canManage && <form className="record-form" onSubmit={(event) => void submitTransfer(event)}>
        <h3>Change branch or department</h3><FormGrid>
          <label className="field">New branch<select required value={toBranch} onChange={(event) => setToBranch(event.target.value)}>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
          <label className="field">New department<select required value={toDepartment} onChange={(event) => setToDepartment(event.target.value)}>{departments.filter((dept) => dept.active).map((dept) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select></label>
          <label className="field">Reason (optional)<input value={reason} maxLength={300} onChange={(event) => setReason(event.target.value)} placeholder="Branch transfer" /></label>
        </FormGrid>
        {error && <p className="form-error" role="alert">{error}</p>}
        <FloatButton type="submit" variant="solid" compact disabled={busy || (toBranch === selected.branchId && toDepartment === selected.primaryDepartmentId)}>{busy ? 'Transferring...' : 'Save transfer'}</FloatButton>
      </form>}
      <h3>Transfer history</h3>
      <MinimalTable headings={['Date', 'From', 'To', 'Reason']} isEmpty={history.length === 0} empty="No transfers recorded.">
        {history.map((item) => <tr key={item.id}><td>{new Date(item.transferredAt).toLocaleDateString()}</td><td>{branchName(item.fromBranchId)}</td><td>{branchName(item.toBranchId)}</td><td>{item.reason ?? '—'}</td></tr>)}
      </MinimalTable>
    </div>}
  </FormSection>;
}
