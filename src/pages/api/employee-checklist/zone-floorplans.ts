import { NextApiRequest, NextApiResponse } from 'next';
import { ZoneFloorplanRepository } from '@/lib/repositories/zoneFloorplanRepository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { zoneIds } = req.query;

  // Validate zone IDs
  if (!zoneIds || typeof zoneIds !== 'string') {
    return res.status(400).json({ error: 'Invalid zone IDs parameter. Expected comma-separated list of zone IDs.' });
  }

  // Parse comma-separated zone IDs
  const zoneIdArray = zoneIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

  if (zoneIdArray.length === 0) {
    return res.status(400).json({ error: 'No valid zone IDs provided' });
  }

  try {
    const floorplanRepository = new ZoneFloorplanRepository();

    // Fetch floorplans for all zones in parallel
    const results = await Promise.all(
      zoneIdArray.map(async (zoneId) => {
        const floorplans = await floorplanRepository.findByZoneId(zoneId);
        return {
          zoneId,
          floorplans: floorplans.map(floorplan => ({
            id: floorplan.id,
            zone_id: floorplan.zone_id,
            image_path: floorplan.image_path,
            created_at: floorplan.created_at,
            public_url: floorplanRepository.getPublicUrl(floorplan.image_path)
          }))
        };
      })
    );

    // Cache for 60 seconds with stale-while-revalidate
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.status(200).json(results);
  } catch (error) {
    console.error('Zone floorplans fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch zone floorplans',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
