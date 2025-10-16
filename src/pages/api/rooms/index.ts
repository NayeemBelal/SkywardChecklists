import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { RoomRepository } from '@/lib/repositories/roomRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  const roomRepository = new RoomRepository(supabaseAdmin);

  try {
    switch (req.method) {
      case 'GET':
        const rooms = await roomRepository.findAll();
        res.status(200).json(rooms);
        break;

      case 'POST':
        const { zone_id, name, description } = req.body;
        
        // Validation
        if (!zone_id || !name) {
          return res.status(400).json({ 
            error: 'Zone ID and name are required' 
          });
        }

        if (name.trim().length < 1) {
          return res.status(400).json({ 
            error: 'Name must be at least 1 character' 
          });
        }

        if (typeof zone_id !== 'number') {
          return res.status(400).json({ 
            error: 'Zone ID must be a number' 
          });
        }

        const newRoom = await roomRepository.create({ 
          zone_id, 
          name: name.trim(), 
          description: description?.trim() || null 
        });
        res.status(201).json(newRoom);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Rooms API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
