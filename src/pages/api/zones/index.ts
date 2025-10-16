import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { ZoneRepository } from '@/lib/repositories/zoneRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  const zoneRepository = new ZoneRepository(supabaseAdmin);

  try {
    switch (req.method) {
      case 'GET':
        const zones = await zoneRepository.findAll();
        res.status(200).json(zones);
        break;

      case 'POST':
        const { site_id, name, description } = req.body;
        
        // Validation
        if (!site_id || !name) {
          return res.status(400).json({ 
            error: 'Site ID and name are required' 
          });
        }

        if (name.trim().length < 1) {
          return res.status(400).json({ 
            error: 'Name must be at least 1 character' 
          });
        }

        if (typeof site_id !== 'number') {
          return res.status(400).json({ 
            error: 'Site ID must be a number' 
          });
        }

        const newZone = await zoneRepository.create({ 
          site_id, 
          name: name.trim(), 
          description: description?.trim() || null 
        });
        res.status(201).json(newZone);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Zones API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
