import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { roomTemplateService } from '@/services/roomTemplateService';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { id } = req.query;
  const templateId = parseInt(id as string);

  if (isNaN(templateId)) {
    res.status(400).json({ error: 'Invalid template ID' });
    return;
  }

  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    const { zoneId } = req.body;

    // Validation
    if (!zoneId || typeof zoneId !== 'number') {
      res.status(400).json({ 
        error: 'Zone ID is required and must be a number' 
      });
      return;
    }

    const result = await roomTemplateService.createRoomFromTemplate(templateId, zoneId);
    res.status(201).json(result);
    return;
  } catch (error) {
    console.error('Use Room Template API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
  }
});

