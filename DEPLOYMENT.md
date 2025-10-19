# Netlify Deployment Guide

## Environment Variables Required

You need to set these environment variables in your Netlify dashboard:

1. **NEXT_PUBLIC_SUPABASE_URL** - Your Supabase project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Your Supabase anonymous key
3. **SUPABASE_SERVICE_ROLE_KEY** - Your Supabase service role key
4. **NEXT_TELEMETRY_DISABLED** - Set to "1" to disable Next.js telemetry

## How to Set Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings > Environment variables
4. Add each variable with its corresponding value

## Build Configuration

The `netlify.toml` file is already configured with:
- Build command: `npm run build`
- Node.js version: 22.20.0
- Functions directory for API routes
- Security headers

## Deployment Steps

1. Push your code to GitHub (make sure you're pushing from the `apps/web` directory)
2. Connect your GitHub repository to Netlify
3. Set the environment variables in Netlify dashboard
4. Deploy!

## Troubleshooting

If you encounter issues:
- Make sure all environment variables are set correctly
- Check that your Supabase project is accessible
- Verify that your API routes don't have any server-side dependencies that aren't available in Netlify's serverless environment
