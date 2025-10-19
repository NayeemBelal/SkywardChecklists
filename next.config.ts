import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable x-powered-by header for security
  poweredByHeader: false,
  
  // Configure images for better performance
  images: {
    unoptimized: true,
  },
  
  // Configure for Netlify deployment with API routes
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Set output file tracing root to avoid lockfile warnings
  outputFileTracingRoot: '.',
};

export default nextConfig;
