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

    // We only want employees assigned to a zone within this site
    // Query app_zone_employees with inner joins to app_employees and app_zones, filter by site_id
    const { data, error } = await supabase
      .from('app_zone_employees')
      .select(`
        app_employees!inner(id, full_name),
        app_zones!inner(id, site_id)
      `)
      .eq('app_zones.site_id', siteIdNum);

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Deduplicate employees by id in case they are assigned to multiple zones
    const seen = new Set<number>();
    const employees = [] as Array<{ id: number; full_name: string }>;
    for (const row of data || []) {
      const emp = (row as Record<string, unknown>).app_employees as { id: number; full_name: string };
      if (emp && !seen.has(emp.id)) {
        seen.add(emp.id);
        employees.push(emp);
      }
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(employees);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}


