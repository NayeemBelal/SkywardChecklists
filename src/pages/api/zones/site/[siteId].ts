import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { ZoneRepository } from '@/lib/repositories/zoneRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { siteId } = req.query;
  const supabaseAdmin = getSupabaseAdmin();
  const zoneRepository = new ZoneRepository(supabaseAdmin);

  // Validate siteId
  if (!siteId || Array.isArray(siteId)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }

  const siteIdNum = parseInt(siteId);
  if (isNaN(siteIdNum)) {
    return res.status(400).json({ error: 'Site ID must be a number' });
  }

  try {
    if (req.method === 'GET') {
      const zones = await zoneRepository.findBySiteId(siteIdNum);
      res.status(200).json(zones);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Zones by Site API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
