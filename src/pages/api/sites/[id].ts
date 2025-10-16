import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { SiteRepository } from '@/lib/repositories/siteRepository';
import crypto from 'crypto';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const siteRepository = new SiteRepository();

  // Validate ID
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }

  const siteId = parseInt(id);
  if (isNaN(siteId)) {
    return res.status(400).json({ error: 'Site ID must be a number' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const site = await siteRepository.findById(siteId);
        if (!site) {
          return res.status(404).json({ error: 'Site not found' });
        }
        res.status(200).json(site);
        break;

      case 'PUT':
        const { name, pin } = req.body;
        
        // Check if site exists
        const existingSite = await siteRepository.findById(siteId);
        if (!existingSite) {
          return res.status(404).json({ error: 'Site not found' });
        }

        // Validation
        if (!name || !pin) {
          return res.status(400).json({ 
            error: 'Name and pin are required' 
          });
        }

        if (name.trim().length < 2) {
          return res.status(400).json({ 
            error: 'Name must be at least 2 characters' 
          });
        }

        if (!/^\d{6}$/.test(pin)) {
          return res.status(400).json({ 
            error: 'PIN must be exactly 6 digits' 
          });
        }

        // Hash the PIN
        const pin_hash = crypto.createHash('sha256').update(pin).digest('hex');

        const updatedSite = await siteRepository.update(siteId, { name, pin_hash });
        res.status(200).json(updatedSite);
        break;

      case 'DELETE':
        // Check if site exists
        const siteToDelete = await siteRepository.findById(siteId);
        if (!siteToDelete) {
          return res.status(404).json({ error: 'Site not found' });
        }

        await siteRepository.delete(siteId);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Site API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
