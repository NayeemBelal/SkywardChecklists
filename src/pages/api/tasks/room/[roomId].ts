import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { TaskRepository } from '@/lib/repositories/taskRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomId } = req.query;
  const supabaseAdmin = getSupabaseAdmin();
  const taskRepository = new TaskRepository(supabaseAdmin);

  // Validate roomId
  if (!roomId || Array.isArray(roomId)) {
    return res.status(400).json({ error: 'Invalid room ID' });
  }

  const roomIdNum = parseInt(roomId);
  if (isNaN(roomIdNum)) {
    return res.status(400).json({ error: 'Room ID must be a number' });
  }

  try {
    if (req.method === 'GET') {
      const tasks = await taskRepository.findByRoomId(roomIdNum);
      res.status(200).json(tasks);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Tasks by Room API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


