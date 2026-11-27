'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { organizationService, type Branch, type User } from '@/services/organization/organization.service';
import { peopleService, type Department, type Employee } from '@/services/organization/people.service';
import { DepartmentPanel } from './department-panel';
import { EmployeePanel } from './employee-panel';

export function PeopleConsole() {
  const { api, can, session } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const manage = can('organization.manage');
  const manageDepartments = manage && Boolean(session?.permissions && !('platform' in session.permissions) && session.permissions['organization.manage']?.branchIds === null);
  const canSeeUsers = Boolean(session?.permissions && !('platform' in session.permissions) && session.permissions['users.read']?.branchIds === null);

  const reload = useCallback(async () => {
    const [availableDepartments, availableEmployees, availableBranches, availableUsers] = await Promise.all([
      peopleService.listDepartments(api),
      peopleService.listEmployees(api),
      organizationService.listBranches(api),
      canSeeUsers ? organizationService.listUsers(api) : Promise.resolve([] as User[]),
    ]);
    setDepartments(availableDepartments); setEmployees(availableEmployees); setBranches(availableBranches); setUsers(availableUsers);
  }, [api, canSeeUsers]);

  useEffect(() => {
    let active = true;
    void Promise.all([peopleService.listDepartments(api), peopleService.listEmployees(api), organizationService.listBranches(api), canSeeUsers ? organizationService.listUsers(api) : Promise.resolve([] as User[])])
      .then(([d, e, b, u]) => { if (active) { setDepartments(d); setEmployees(e); setBranches(b); setUsers(u); } })
      .catch((failure) => { if (active) setError(failure instanceof Error ? failure.message : 'Could not load staff data'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [api, canSeeUsers]);

  return <div className="record-page">
    <div className="record-page-heading"><div><p className="eyebrow">Organization</p><h1 className="page-heading">People & departments</h1><p className="page-lead">Staff directory, branch assignments and department structure.</p></div>
      <span className="record-counter">{employees.length} employees</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {loading ? <section className="record-panel">Loading organization records...</section> : <>
      <DepartmentPanel departments={departments} canManage={manageDepartments} reload={reload} />
      <EmployeePanel employees={employees} departments={departments} branches={branches} users={users} canManage={manage} canLink={manageDepartments && canSeeUsers} reload={reload} />
    </>}
  </div>;
}
