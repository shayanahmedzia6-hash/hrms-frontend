'use client';

import { useState, type FormEvent } from 'react';
import { FormGrid, FormSection } from '@/components/ui/form-section';
import { MinimalTable } from '@/components/ui/minimal-table';
import { FloatButton } from '@/components/ui/float-button';
import { peopleService, type Department } from '@/services/organization/people.service';
import { useAuth } from '@/components/auth/auth-provider';

export function DepartmentPanel({ departments, canManage, reload }: {
  departments: Department[]; canManage: boolean; reload: () => Promise<void>;
}) {
  const { api } = useAuth();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      await peopleService.addDepartment(api, { name, code });
      await reload(); setName(''); setCode(''); setAdding(false);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not create department'); }
    finally { setBusy(false); }
  }

  return <FormSection title="Departments" description="Every employee must belong to a department. Departments are shared across your business."
    action={canManage && <FloatButton compact variant="outline" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : 'Add department'}</FloatButton>}>
    {adding && <form onSubmit={(event) => void submit(event)} className="record-form">
      <FormGrid>
        <label className="field">Department name<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder="Human Resources" /></label>
        <label className="field">Code<input required minLength={2} maxLength={20} value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="HR" /></label>
      </FormGrid>
      {error && <p className="form-error" role="alert">{error}</p>}
      <FloatButton type="submit" variant="solid" compact disabled={busy}>{busy ? 'Saving...' : 'Save department'}</FloatButton>
    </form>}
    <MinimalTable headings={['Department', 'Code', 'Status']} empty="No departments yet. Create one before adding employees." isEmpty={departments.length === 0}>
      {departments.map((department) => <tr key={department.id}>
        <td><strong>{department.name}</strong></td><td>{department.code}</td>
        <td><span className="record-status">{department.active ? 'Active' : 'Inactive'}</span></td>
      </tr>)}
    </MinimalTable>
  </FormSection>;
}
