import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { TaskRepository } from '@/lib/repositories/taskRepository';
import { getSupabaseAdmin } from '@/lib/supabase';
import { translateToSpanish } from '@/lib/serverTranslate';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  const taskRepository = new TaskRepository(supabaseAdmin);

  try {
    switch (req.method) {
      case 'GET':
        const tasks = await taskRepository.findAll();
        res.status(200).json(tasks);
        break;

      case 'POST':
        const { room_id, description, description_es: provided_description_es, task_description, sort_order } = req.body;
        
        // Validation
        if (!room_id || !description) {
          return res.status(400).json({ 
            error: 'Room ID and description are required' 
          });
        }

        if (description.trim().length < 1) {
          return res.status(400).json({ 
            error: 'Description must be at least 1 character' 
          });
        }

        if (typeof room_id !== 'number') {
          return res.status(400).json({ 
            error: 'Room ID must be a number' 
          });
        }

        // Get the next sort order if not provided
        let finalSortOrder = sort_order;
        if (finalSortOrder === undefined) {
          const existingTasks = await taskRepository.findByRoomId(room_id);
          finalSortOrder = existingTasks.length;
        }

        // Translate description to Spanish if not already provided (e.g., from template)
        let description_es = provided_description_es;
        let translationWarning: string | null = null;
        
        if (!description_es) {
          description_es = await translateToSpanish(description.trim());
          translationWarning = description_es === null ? 'Translation to Spanish failed. Task saved in English only.' : null;
        }

        const newTask = await taskRepository.create({ 
          room_id, 
          description: description.trim(),
          description_es,
          task_description: task_description?.trim() || null,
          sort_order: finalSortOrder
        });
        
        res.status(201).json({ 
          task: newTask,
          warning: translationWarning 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Tasks API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
