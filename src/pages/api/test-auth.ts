import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { supabase } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test authenticated database access
    const { data: sites, error } = await supabase
      .from('app_sites')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Database access error:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Database access failed',
        error: error.message 
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Authentication and database access successful',
      user: {
        id: req.user?.id,
        email: req.user?.email
      },
      data: {
        sites_count: sites?.length || 0,
        sample_sites: sites
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});
