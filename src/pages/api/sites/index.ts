import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { SiteRepository } from '@/lib/repositories/siteRepository';
import crypto from 'crypto';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const siteRepository = new SiteRepository();

  try {
    switch (req.method) {
      case 'GET':
        const sites = await siteRepository.findAll();
        res.status(200).json(sites);
        break;

      case 'POST':
        const { name, pin } = req.body;
        
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

        const newSite = await siteRepository.create({ name, pin_hash });
        res.status(201).json(newSite);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Sites API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
