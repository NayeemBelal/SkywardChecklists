import { useEffect, useState } from 'react';
import { Site, Employee } from '@/types';
import { employeeInterfaceService } from '@/services/employeeInterfaceService';

export function useEmployeeInterface() {
  const [sites, setSites] = useState<Pick<Site, 'id' | 'name'>[]>([]);
  const [employees, setEmployees] = useState<Pick<Employee, 'id' | 'full_name'>[]>([]);
  const [selectedSite, setSelectedSite] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employeeInterfaceService.getSites();
        setSites(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load sites');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedSite == null) {
      setEmployees([]);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employeeInterfaceService.getEmployeesBySite(selectedSite);
        setEmployees(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSite]);

  return { sites, employees, selectedSite, setSelectedSite, loading, error };
}




