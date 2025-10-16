import { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Extend NextApiRequest to include user
declare module 'next' {
  interface NextApiRequest {
    user?: User;
  }
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const supabaseAdmin = getSupabaseAdmin();
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Add user to request object
      req.user = user;
      return handler(req, res);
    } catch {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}
