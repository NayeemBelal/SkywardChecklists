import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/lib/middleware/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

export default withAuth(async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    switch (req.method) {
      case 'GET':
        const { search } = req.query;
        
        let query = supabaseAdmin
          .from('app_employees')
          .select('*')
          .order('full_name');

        // Add search filter if provided
        if (search && typeof search === 'string') {
          query = query.ilike('full_name', `%${search}%`);
        }

        const { data: employees, error } = await query;
        
        if (error) throw error;
        res.status(200).json(employees || []);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Employees API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
