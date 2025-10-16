import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { TaskRepository } from '@/lib/repositories/taskRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const taskRepository = new TaskRepository(supabaseAdmin);

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { taskIds } = req.body;
    
    // Validation
    if (!Array.isArray(taskIds)) {
      res.status(400).json({ 
        error: 'taskIds must be an array' 
      });
      return;
    }

    if (taskIds.length === 0) {
      res.status(400).json({ 
        error: 'taskIds array cannot be empty' 
      });
      return;
    }

    // Update sort order for each task
    const updatePromises = taskIds.map((taskId: number, index: number) => {
      return taskRepository.update(taskId, { sort_order: index });
    });

    await Promise.all(updatePromises);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Task Reorder API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});


