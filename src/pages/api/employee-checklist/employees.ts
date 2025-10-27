import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { siteId } = req.query;
    if (!siteId || Array.isArray(siteId)) {
      return res.status(400).json({ error: 'siteId is required' });
    }

    const siteIdNum = parseInt(siteId, 10);
    if (isNaN(siteIdNum)) {
      return res.status(400).json({ error: 'siteId must be a number' });
    }

    // We want employees assigned to zones OR rooms within this site

    // 1. Get employees assigned to zones in this site
    const { data: zoneEmployeesData, error: zoneError } = await supabase
      .from('app_zone_employees')
      .select(`
        app_employees!inner(id, full_name),
        app_zones!inner(id, site_id)
      `)
      .eq('app_zones.site_id', siteIdNum);

    if (zoneError) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // 2. Get employees assigned to rooms in zones in this site
    const { data: roomEmployeesData, error: roomError } = await supabase
      .from('app_room_employees')
      .select(`
        app_employees!inner(id, full_name),
        app_rooms!inner(id, zone_id, app_zones!inner(id, site_id))
      `)
      .eq('app_rooms.app_zones.site_id', siteIdNum);

    if (roomError) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Deduplicate employees by id (they might be assigned to multiple zones/rooms)
    const seen = new Set<number>();
    const employees = [] as Array<{ id: number; full_name: string }>;

    // Add employees from zone assignments
    for (const row of zoneEmployeesData || []) {
      const emp = (row as Record<string, unknown>).app_employees as { id: number; full_name: string };
      if (emp && !seen.has(emp.id)) {
        seen.add(emp.id);
        employees.push(emp);
      }
    }

    // Add employees from room assignments
    for (const row of roomEmployeesData || []) {
      const emp = (row as Record<string, unknown>).app_employees as { id: number; full_name: string };
      if (emp && !seen.has(emp.id)) {
        seen.add(emp.id);
        employees.push(emp);
      }
    }

    // Disable caching for dynamic employee data that changes based on site selection
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json(employees);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}


