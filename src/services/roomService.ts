import { Room } from '@/types';

const API_BASE_URL = '/api/rooms';

export interface RoomFormData {
  zone_id: number;
  name: string;
  description?: string;
}

export class RoomService {
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

  async getAllRooms(): Promise<Room[]> {
    return this.request<Room[]>(API_BASE_URL);
  }

  async getRoomsByZoneId(zoneId: number): Promise<Room[]> {
    return this.request<Room[]>(`${API_BASE_URL}/zone/${zoneId}`);
  }

  async getRoomById(id: number): Promise<Room | null> {
    try {
      return await this.request<Room>(`${API_BASE_URL}/${id}`);
    } catch (error) {
      // Handle 404 as null return instead of throwing
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async createRoom(room: RoomFormData): Promise<Room> {
    return this.request<Room>(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(room),
    });
  }

  async updateRoom(id: number, room: Partial<RoomFormData>): Promise<Room> {
    return this.request<Room>(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room),
    });
  }

  async deleteRoom(id: number): Promise<void> {
    return this.request<void>(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  }
}

export const roomService = new RoomService();
