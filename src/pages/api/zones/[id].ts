import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { ZoneRepository } from '@/lib/repositories/zoneRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const supabaseAdmin = getSupabaseAdmin();
  const zoneRepository = new ZoneRepository(supabaseAdmin);

  // Validate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid zone ID' });
  }

  const zoneId = parseInt(id);
  if (isNaN(zoneId)) {
    return res.status(400).json({ error: 'Zone ID must be a number' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const zone = await zoneRepository.findById(zoneId);
        if (!zone) {
          return res.status(404).json({ error: 'Zone not found' });
        }
        res.status(200).json(zone);
        break;

      case 'PUT':
        const { name, description } = req.body;
        
        // Check if zone exists
        const existingZone = await zoneRepository.findById(zoneId);
        if (!existingZone) {
          return res.status(404).json({ error: 'Zone not found' });
        }

        // Validation
        if (!name) {
          return res.status(400).json({ 
            error: 'Name is required' 
          });
        }

        if (name.trim().length < 1) {
          return res.status(400).json({ 
            error: 'Name must be at least 1 character' 
          });
        }

        const updatedZone = await zoneRepository.update(zoneId, { 
          name: name.trim(), 
          description: description?.trim() || null 
        });
        res.status(200).json(updatedZone);
        break;

      case 'DELETE':
        // Check if zone exists
        const zoneToDelete = await zoneRepository.findById(zoneId);
        if (!zoneToDelete) {
          return res.status(404).json({ error: 'Zone not found' });
        }

        // Delete zone - database CASCADE will automatically delete all rooms, tasks, and assignments
        await zoneRepository.delete(zoneId);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Zone API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
