import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { data: sites, error } = await supabase
      .from('app_sites')
      .select('id, name')
      .order('name');

    if (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Basic caching for faster dropdown loads
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(sites || []);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}




