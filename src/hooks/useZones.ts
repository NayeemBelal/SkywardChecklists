import { useState, useCallback } from 'react';
import { Zone } from '@/types';
import { zoneService, ZoneFormData } from '@/services/zoneService';

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await zoneService.getAllZones();
      setZones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchZonesBySite = useCallback(async (siteId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await zoneService.getZonesBySiteId(siteId);
      setZones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch zones');
    } finally {
      setLoading(false);
    }
  }, []);

  const createZone = useCallback(async (zone: ZoneFormData) => {
    try {
      setError(null);
      const newZone = await zoneService.createZone(zone);
      setZones(prev => [...prev, newZone]);
      return newZone;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create zone';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateZone = useCallback(async (id: number, updates: Partial<ZoneFormData>) => {
    try {
      setError(null);
      const updatedZone = await zoneService.updateZone(id, updates);
      setZones(prev => prev.map(zone => zone.id === id ? updatedZone : zone));
      return updatedZone;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update zone';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteZone = useCallback(async (id: number) => {
    try {
      setError(null);
      await zoneService.deleteZone(id);
      setZones(prev => prev.filter(zone => zone.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete zone';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    zones,
    loading,
    error,
    fetchZones,
    fetchZonesBySite,
    createZone,
    updateZone,
    deleteZone,
  };
}
