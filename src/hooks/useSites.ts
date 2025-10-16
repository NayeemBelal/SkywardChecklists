import { useState, useEffect, useCallback } from 'react';
import { Site, SiteFormData } from '@/types';
import { siteService } from '@/services/siteService';

export function useSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await siteService.getAllSites();
      setSites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSite = useCallback(async (site: SiteFormData) => {
    try {
      setError(null);
      const newSite = await siteService.createSite(site);
      setSites(prev => [...prev, newSite]);
      return newSite;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create site';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateSite = useCallback(async (id: number, updates: SiteFormData) => {
    try {
      setError(null);
      const updatedSite = await siteService.updateSite(id, updates);
      setSites(prev => prev.map(site => site.id === id ? updatedSite : site));
      return updatedSite;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update site';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteSite = useCallback(async (id: number) => {
    try {
      setError(null);
      await siteService.deleteSite(id);
      setSites(prev => prev.filter(site => site.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete site';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return {
    sites,
    loading,
    error,
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
  };
}
