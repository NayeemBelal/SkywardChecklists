import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { TaskTemplateRepository } from '@/lib/repositories/taskTemplateRepository';
import { getSupabaseAdmin } from '@/lib/supabase';
import { translateToSpanish } from '@/lib/serverTranslate';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const templateRepository = new TaskTemplateRepository(supabaseAdmin);

  try {
    switch (req.method) {
      case 'GET':
        const { search, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const offset = (pageNum - 1) * limitNum;

        const result = await templateRepository.findAll(
          search as string,
          limitNum,
          offset
        );
        
        res.status(200).json(result);
        break;

      case 'POST':
        const { name, description } = req.body;
        
        // Validation
        if (!name || !description) {
          res.status(400).json({ 
            error: 'Name and description are required' 
          });
          return;
        }

        if (name.trim().length < 1) {
          res.status(400).json({ 
            error: 'Name must be at least 1 character' 
          });
          return;
        }

        if (description.trim().length < 1) {
          res.status(400).json({ 
            error: 'Description must be at least 1 character' 
          });
          return;
        }

        // Check for duplicate description
        const isDuplicate = await templateRepository.checkDuplicateDescription(description.trim());
        if (isDuplicate) {
          res.status(400).json({ 
            error: 'A template with this description already exists' 
          });
          return;
        }

        // Translate description to Spanish
        const description_es = await translateToSpanish(description.trim());
        const translationWarning = description_es === null ? 'Translation to Spanish failed. Template saved in English only.' : null;

        const newTemplate = await templateRepository.create({ 
          name: name.trim(),
          description: description.trim(),
          description_es
        });
        res.status(201).json({
          template: newTemplate,
          warning: translationWarning
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Task Templates API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
