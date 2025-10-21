import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { RoomRepository } from '@/lib/repositories/roomRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const supabaseAdmin = getSupabaseAdmin();
  const roomRepository = new RoomRepository(supabaseAdmin);

  // Validate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }

  const roomId = parseInt(id);
  if (isNaN(roomId)) {
    return res.status(400).json({ error: 'Room ID must be a number' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const room = await roomRepository.findById(roomId);
        if (!room) {
          return res.status(404).json({ error: 'Room not found' });
        }
        res.status(200).json(room);
        break;

      case 'PUT':
        const updateData = req.body;
        
        // Check if room exists
        const existingRoom = await roomRepository.findById(roomId);
        if (!existingRoom) {
          return res.status(404).json({ error: 'Room not found' });
        }

        // Prepare update data, preserving existing values for fields not being updated
        const roomUpdateData: { name?: string; description?: string } = {};
        
        if (updateData.name !== undefined) {
          if (!updateData.name || updateData.name.trim().length < 1) {
            return res.status(400).json({ 
              error: 'Name is required and must be at least 1 character' 
            });
          }
          roomUpdateData.name = updateData.name.trim();
        }
        
        if (updateData.description !== undefined) {
          roomUpdateData.description = updateData.description?.trim() || undefined;
        }

        const updatedRoom = await roomRepository.update(roomId, roomUpdateData);
        res.status(200).json(updatedRoom);
        break;

      case 'DELETE':
        // Check if room exists
        const roomToDelete = await roomRepository.findById(roomId);
        if (!roomToDelete) {
          return res.status(404).json({ error: 'Room not found' });
        }

        // Delete room - database CASCADE will automatically delete all tasks and task assignments
        await roomRepository.delete(roomId);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Room API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
