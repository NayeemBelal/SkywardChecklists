import { Site, Employee } from '@/types';

export const employeeInterfaceService = {
  async getSites(): Promise<Pick<Site, 'id' | 'name'>[]> {
    const res = await fetch('/api/employee-checklist/sites');
    if (!res.ok) throw new Error('Failed to load sites');
    return res.json();
  },

  async getEmployeesBySite(siteId: number): Promise<Pick<Employee, 'id' | 'full_name'>[]> {
    const res = await fetch(`/api/employee-checklist/employees?siteId=${siteId}`);
    if (!res.ok) throw new Error('Failed to load employees');
    return res.json();
  },

  async getTasksForEmployee(siteId: number, employeeId: number): Promise<Array<{id:number; description:string; description_es:string|null; room:{id:number; name:string}|null; zone:{id:number; name:string}|null}>> {
    const res = await fetch(`/api/employee-checklist/tasks?siteId=${siteId}&employeeId=${employeeId}`);
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
  }
};


