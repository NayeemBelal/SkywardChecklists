import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { roomTemplateService } from '@/services/roomTemplateService';
import { translateToSpanish } from '@/lib/serverTranslate';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const templates = await roomTemplateService.getTemplatesWithUsageCount();
        res.status(200).json(templates);
        break;

      case 'POST':
        const { name, description, tasks } = req.body;
        
        // Validation
        if (!name || !name.trim()) {
          return res.status(400).json({ 
            error: 'Name is required' 
          });
        }

        // Translate room template name to Spanish
        const name_es = await translateToSpanish(name.trim());
        const translationWarning = name_es === null ? 'Translation to Spanish failed. Template saved in English only.' : null;

        // Translate task descriptions to Spanish
        const translatedTasks = [];
        for (const task of tasks || []) {
          const taskDescription_es = await translateToSpanish(task.description);
          translatedTasks.push({
            ...task,
            description_es: taskDescription_es
          });
        }

        const newTemplate = await roomTemplateService.createTemplate(
          { name: name.trim(), description: description?.trim() },
          translatedTasks
        );
        
        res.status(201).json({
          ...newTemplate,
          warning: translationWarning
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Room Templates API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

