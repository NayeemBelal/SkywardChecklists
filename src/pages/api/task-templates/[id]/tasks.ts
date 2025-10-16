import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { TaskTemplateRepository } from '@/lib/repositories/taskTemplateRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  const templateRepository = new TaskTemplateRepository(supabaseAdmin);

  try {
    const { id } = req.query;
    const templateId = parseInt(id as string);

    if (isNaN(templateId)) {
      res.status(400).json({ error: 'Invalid template ID' });
      return;
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const result = await templateRepository.getTasksUsingTemplate(templateId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Task Template Tasks API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
