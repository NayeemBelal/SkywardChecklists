import { Site, SiteFormData } from '@/types';

const API_BASE_URL = '/api/sites';

export class SiteService {
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
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
        }
        throw new Error('Log in to see admin dashboard.');
      }
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async getAllSites(): Promise<Site[]> {
    return this.request<Site[]>(API_BASE_URL);
  }

  async getSiteById(id: number): Promise<Site | null> {
    try {
      return await this.request<Site>(`${API_BASE_URL}/${id}`);
    } catch (error) {
      // Handle 404 as null return instead of throwing
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async createSite(site: SiteFormData): Promise<Site> {
    return this.request<Site>(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(site),
    });
  }

  async updateSite(id: number, site: SiteFormData): Promise<Site> {
    return this.request<Site>(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(site),
    });
  }

  async deleteSite(id: number): Promise<void> {
    return this.request<void>(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const siteService = new SiteService();
