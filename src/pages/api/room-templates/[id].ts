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
      case 'GET':
        const template = await roomTemplateService.getTemplateById(templateId);
        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }
        res.status(200).json(template);
        break;

      case 'PUT':
        const { name, description, tasks, cascadeUpdate } = req.body;
        
        // Validation
        if (!name || !name.trim()) {
          return res.status(400).json({ 
            error: 'Name is required' 
          });
        }

        // Translate room template name to Spanish when name changes
        const name_es = await translateToSpanish(name.trim());
        const translationWarning = name_es === null ? 'Translation to Spanish failed. Template saved in English only.' : null;

        // Translate task descriptions to Spanish if tasks are provided
        let translatedTasks = tasks || [];
        if (tasks && tasks.length > 0) {
          translatedTasks = [];
          for (const task of tasks) {
            const taskDescription_es = await translateToSpanish(task.description);
            translatedTasks.push({
              ...task,
              description_es: taskDescription_es
            });
          }
        }

        const result = await roomTemplateService.updateTemplate(
          templateId,
          { name: name.trim(), description: description?.trim() },
          translatedTasks,
          cascadeUpdate || false
        );
        res.status(200).json({
          ...result,
          warning: translationWarning
        });
        break;

      case 'DELETE':
        const { cascadeDelete } = req.body;
        
        const deleteResult = await roomTemplateService.deleteTemplate(
          templateId,
          cascadeDelete || false
        );
        res.status(200).json(deleteResult);
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Room Template API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

