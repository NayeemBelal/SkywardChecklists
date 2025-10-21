import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { roomTemplateService } from '@/services/roomTemplateService';
import { translateToSpanish } from '@/lib/serverTranslate';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const templateId = parseInt(id as string);

  if (isNaN(templateId)) {
    return res.status(400).json({ error: 'Invalid template ID' });
  }

  try {
    switch (req.method) {
      case 'POST':
        const { description, description_es, task_description, sort_order } = req.body;
        
        // Validation
        if (!description || !description.trim()) {
          return res.status(400).json({ 
            error: 'Description is required' 
          });
        }

        // Translate description to Spanish if not already provided
        let finalDescription_es = description_es;
        let translationWarning: string | null = null;
        
        if (!finalDescription_es) {
          finalDescription_es = await translateToSpanish(description.trim());
          translationWarning = finalDescription_es === null ? 'Translation to Spanish failed. Task saved in English only.' : null;
        }

        await roomTemplateService.addTaskToTemplate(templateId, {
          description: description.trim(),
          description_es: finalDescription_es,
          task_description: task_description?.trim(),
          sort_order
        });
        
        // Return updated template with tasks
        const template = await roomTemplateService.getTemplateById(templateId);
        res.status(201).json({
          ...template,
          warning: translationWarning
        });
        break;

      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Room Template Tasks API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

