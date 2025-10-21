import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { TaskRepository } from '@/lib/repositories/taskRepository';
import { getSupabaseAdmin } from '@/lib/supabase';
import { translateToSpanish } from '@/lib/serverTranslate';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const supabaseAdmin = getSupabaseAdmin();
  const taskRepository = new TaskRepository(supabaseAdmin);

  // Validate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  const taskId = parseInt(id);
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Task ID must be a number' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const task = await taskRepository.findById(taskId);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(task);
        break;

      case 'PUT':
        const updateData = req.body;
        
        // Check if task exists
        const existingTask = await taskRepository.findById(taskId);
        if (!existingTask) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Prepare update data, preserving existing values for fields not being updated
        const taskUpdateData: { description?: string; description_es?: string | null; task_description?: string; sort_order?: number } = {};
        let translationWarning: string | null = null;
        
        if (updateData.description !== undefined) {
          if (!updateData.description || updateData.description.trim().length < 1) {
            return res.status(400).json({ 
              error: 'Description is required and must be at least 1 character' 
            });
          }
          const trimmedDescription = updateData.description.trim();
          taskUpdateData.description = trimmedDescription;
          
          // Re-translate to Spanish when description changes
          const description_es = await translateToSpanish(trimmedDescription);
          taskUpdateData.description_es = description_es;
          translationWarning = description_es === null ? 'Translation to Spanish failed. Task saved in English only.' : null;
        }
        
        if (updateData.task_description !== undefined) {
          taskUpdateData.task_description = updateData.task_description?.trim() || undefined;
        }
        
        if (updateData.sort_order !== undefined) {
          taskUpdateData.sort_order = updateData.sort_order;
        }

        const updatedTask = await taskRepository.update(taskId, taskUpdateData);
        res.status(200).json({
          task: updatedTask,
          warning: translationWarning
        });
        break;

      case 'DELETE':
        // Check if task exists
        const taskToDelete = await taskRepository.findById(taskId);
        if (!taskToDelete) {
          return res.status(404).json({ error: 'Task not found' });
        }

        try {
          await taskRepository.delete(taskId);
          res.status(204).end();
        } catch (deleteError) {
          if (deleteError instanceof Error && deleteError.message.includes('existing assignments')) {
            return res.status(400).json({ 
              error: 'Cannot delete task with existing assignments' 
            });
          }
          throw deleteError;
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Task API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
