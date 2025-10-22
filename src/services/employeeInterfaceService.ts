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

  async getTasksForEmployee(siteId: number, employeeId: number): Promise<Array<{id:number; description:string; description_es:string|null; task_description:string|null; task_description_es:string|null; frequency: 'daily' | 'weekly' | 'monthly' | null; room:{id:number; name:string}|null; zone:{id:number; name:string}|null}>> {
    const res = await fetch(`/api/employee-checklist/tasks?siteId=${siteId}&employeeId=${employeeId}`);
    if (!res.ok) throw new Error('Failed to load tasks');
    return res.json();
  },

  async getSiteFloorplan(siteId: number): Promise<Array<{id: number; site_id: number; image_path: string; created_at: string; public_url: string}>> {
    const res = await fetch(`/api/employee-checklist/site-floorplan?siteId=${siteId}`);
    if (!res.ok) throw new Error('Failed to load site floorplan');
    return res.json();
  },

  async getZoneFloorplans(zoneIds: number[]): Promise<Array<{zoneId: number; floorplans: Array<{id: number; zone_id: number; image_path: string; created_at: string; public_url: string}>}>> {
    if (zoneIds.length === 0) return [];
    const res = await fetch(`/api/employee-checklist/zone-floorplans?zoneIds=${zoneIds.join(',')}`);
    if (!res.ok) throw new Error('Failed to load zone floorplans');
    return res.json();
  }
};


