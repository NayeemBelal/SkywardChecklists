import { NextApiRequest, NextApiResponse } from 'next';
import { SiteFloorplanRepository } from '@/lib/repositories/siteFloorplanRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { siteId } = req.query;

  // Validate site ID
  if (!siteId || Array.isArray(siteId)) {
    return res.status(400).json({ error: 'Invalid site ID' });
  }

  const siteIdNum = parseInt(siteId);
  if (isNaN(siteIdNum)) {
    return res.status(400).json({ error: 'Site ID must be a number' });
  }

  try {
    const floorplanRepository = new SiteFloorplanRepository();
    const floorplans = await floorplanRepository.findBySiteId(siteIdNum);

    // Add public URLs to the response
    const floorplansWithUrls = floorplans.map(floorplan => ({
      id: floorplan.id,
      site_id: floorplan.site_id,
      image_path: floorplan.image_path,
      created_at: floorplan.created_at,
      public_url: floorplanRepository.getPublicUrl(floorplan.image_path)
    }));

    // Cache for 60 seconds with stale-while-revalidate
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.status(200).json(floorplansWithUrls);
  } catch (error) {
    console.error('Site floorplan fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch site floorplan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
