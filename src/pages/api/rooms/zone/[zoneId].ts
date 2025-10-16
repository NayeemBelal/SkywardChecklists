import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { RoomRepository } from '@/lib/repositories/roomRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { zoneId } = req.query;
  const supabaseAdmin = getSupabaseAdmin();
  const roomRepository = new RoomRepository(supabaseAdmin);

  // Validate zoneId
  if (!zoneId || Array.isArray(zoneId)) {
    return res.status(400).json({ error: 'Invalid zone ID' });
  }

  const zoneIdNum = parseInt(zoneId);
  if (isNaN(zoneIdNum)) {
    return res.status(400).json({ error: 'Zone ID must be a number' });
  }

  try {
    if (req.method === 'GET') {
      const rooms = await roomRepository.findByZoneId(zoneIdNum);
      res.status(200).json(rooms);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Rooms by Zone API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
