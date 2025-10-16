import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { siteId, employeeId } = req.query;
    if (!siteId || Array.isArray(siteId) || !employeeId || Array.isArray(employeeId)) {
      return res.status(400).json({ error: 'siteId and employeeId are required' });
    }

    const siteIdNum = parseInt(siteId, 10);
    const employeeIdNum = parseInt(employeeId, 10);
    if (isNaN(siteIdNum) || isNaN(employeeIdNum)) {
      return res.status(400).json({ error: 'siteId and employeeId must be numbers' });
    }

    // 1) Get all zone IDs for the site
    const { data: siteZones, error: siteZonesErr } = await supabase
      .from('app_zones')
      .select('id, name')
      .eq('site_id', siteIdNum);
    if (siteZonesErr) return res.status(500).json({ error: 'Failed to fetch site zones' });
    const siteZoneIds = (siteZones || []).map((z: any) => z.id);

    if (siteZoneIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2) Get all rooms in those zones (cache names for response)
    const { data: siteRooms, error: siteRoomsErr } = await supabase
      .from('app_rooms')
      .select('id, name, zone_id')
      .in('zone_id', siteZoneIds);
    if (siteRoomsErr) return res.status(500).json({ error: 'Failed to fetch site rooms' });
    const roomIdToRoom: Record<number, { id: number; name: string; zone_id: number }> = {};
    const siteRoomIds = (siteRooms || []).map((r: any) => {
      roomIdToRoom[r.id] = { id: r.id, name: r.name, zone_id: r.zone_id };
      return r.id;
    });

    if (siteRoomIds.length === 0) {
      return res.status(200).json([]);
    }

    // 3) Employee's room assignments (within site rooms)
    const { data: empRoomAssign, error: empRoomErr } = await supabase
      .from('app_room_employees')
      .select('room_id')
      .eq('employee_id', employeeIdNum)
      .in('room_id', siteRoomIds);
    if (empRoomErr) return res.status(500).json({ error: 'Failed to fetch room assignments' });
    const empRoomIds = (empRoomAssign || []).map((r: any) => r.room_id);

    // 4) Employee's zone assignments (restricted to site)
    const { data: empZoneAssign, error: empZoneErr } = await supabase
      .from('app_zone_employees')
      .select('zone_id')
      .eq('employee_id', employeeIdNum)
      .in('zone_id', siteZoneIds);
    if (empZoneErr) return res.status(500).json({ error: 'Failed to fetch zone assignments' });
    const empZoneIds = (empZoneAssign || []).map((z: any) => z.zone_id);

    // 5) Allowed rooms = directly assigned rooms ∪ rooms in assigned zones
    const roomsFromZones = (siteRooms || [])
      .filter((r: any) => empZoneIds.includes(r.zone_id))
      .map((r: any) => r.id);
    const allowedRoomIdSet = new Set<number>([...empRoomIds, ...roomsFromZones]);
    const allowedRoomIds = Array.from(allowedRoomIdSet);

    if (allowedRoomIds.length === 0) {
      return res.status(200).json([]);
    }

    // 6) Fetch tasks for allowed rooms
    const { data: taskRows, error: taskErr } = await supabase
      .from('app_tasks')
      .select('id, description, room_id')
      .in('room_id', allowedRoomIds)
      .order('id');
    if (taskErr) return res.status(500).json({ error: 'Failed to fetch tasks' });

    // 7) Map to response with room and zone names
    const zoneIdToZone = new Map<number, { id: number; name: string }>();
    for (const z of siteZones || []) zoneIdToZone.set(z.id, { id: z.id, name: (z as any).name });

    const response = (taskRows || []).map((t: any) => {
      const room = roomIdToRoom[t.room_id];
      const zone = room ? zoneIdToZone.get(room.zone_id) || null : null;
      return {
        id: t.id,
        description: t.description,
        room: room ? { id: room.id, name: room.name } : null,
        zone
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}


