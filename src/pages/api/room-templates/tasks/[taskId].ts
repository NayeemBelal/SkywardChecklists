import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { roomTemplateService } from '@/services/roomTemplateService';
import { translateToSpanish } from '@/lib/serverTranslate';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { taskId } = req.query;
  const templateTaskId = parseInt(taskId as string);

  if (isNaN(templateTaskId)) {
    res.status(400).json({ error: 'Invalid task ID' });
    return;
  }

  try {
    switch (req.method) {
      case 'PUT':
        const { description, description_es, task_description, cascadeUpdate } = req.body;
        
        const updates: {
          description?: string;
          description_es?: string | null;
          task_description?: string;
        } = {};
        let translationWarning: string | null = null;

        if (description !== undefined) {
          if (!description.trim()) {
            res.status(400).json({ error: 'Description cannot be empty' });
            return;
          }
          updates.description = description.trim();
          
          // Re-translate to Spanish when description changes
          const translatedDescription_es = await translateToSpanish(description.trim());
          updates.description_es = translatedDescription_es;
          translationWarning = translatedDescription_es === null ? 'Translation to Spanish failed. Task saved in English only.' : null;
        }

        if (description_es !== undefined) {
          updates.description_es = description_es?.trim() || null;
        }

        if (task_description !== undefined) {
          updates.task_description = task_description?.trim();
        }

        await roomTemplateService.updateTemplateTask(
          templateTaskId,
          updates,
          cascadeUpdate || false
        );
        res.status(200).json({ 
          success: true,
          warning: translationWarning
        });
        return;

      case 'DELETE':
        const { cascadeDelete } = req.body;
        
        await roomTemplateService.deleteTemplateTask(
          templateTaskId,
          cascadeDelete || false
        );
        res.status(200).json({ success: true });
        return;

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }
  } catch (error) {
    console.error('Room Template Task API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

