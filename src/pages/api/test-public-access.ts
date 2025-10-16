import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test public read access for employee checklist
    const { data: sites, error } = await supabase
      .from('app_sites')
      .select('id, name')
      .limit(5);

    if (error) {
      console.error('Public access error:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Public access failed',
        error: error.message 
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Public read access successful',
      data: {
        sites_count: sites?.length || 0,
        sample_sites: sites
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test public access error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
