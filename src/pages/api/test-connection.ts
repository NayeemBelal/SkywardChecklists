import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test basic connection
    const { error } = await supabase
      .from('app_sites')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return res.status(500).json({ 
        status: 'error',
        message: 'Database connection failed',
        error: error.message 
      });
    }

    // Test environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    return res.status(200).json({
      status: 'success',
      message: 'Database connection successful',
      environment: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Connection test error:', error);
    
    // Enhanced error handling with more specific error types
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isEnvError = errorMessage.includes('Missing required environment variable');
    
    return res.status(500).json({
      status: 'error',
      message: isEnvError ? 'Configuration error' : 'Connection test failed',
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}
