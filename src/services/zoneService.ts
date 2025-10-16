import { Zone } from '@/types';

const API_BASE_URL = '/api/zones';

export interface ZoneFormData {
  site_id: number;
  name: string;
  description?: string;
}

export class ZoneService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('supabase.auth.token');
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async getAllZones(): Promise<Zone[]> {
    return this.request<Zone[]>(API_BASE_URL);
  }

  async getZonesBySiteId(siteId: number): Promise<Zone[]> {
    return this.request<Zone[]>(`${API_BASE_URL}/site/${siteId}`);
  }

  async getZoneById(id: number): Promise<Zone | null> {
    try {
      return await this.request<Zone>(`${API_BASE_URL}/${id}`);
    } catch (error) {
      // Handle 404 as null return instead of throwing
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async createZone(zone: ZoneFormData): Promise<Zone> {
    return this.request<Zone>(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  }

  async updateZone(id: number, zone: Partial<ZoneFormData>): Promise<Zone> {
    return this.request<Zone>(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zone),
    });
  }

  async deleteZone(id: number): Promise<void> {
    return this.request<void>(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const zoneService = new ZoneService();
