import { supabase } from '@/lib/supabase';
import { Room } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export class RoomRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || supabase;
  }

  async findAll(): Promise<Room[]> {
    const { data, error } = await this.client
      .from('app_rooms')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async findByZoneId(zoneId: number): Promise<Room[]> {
    const { data, error } = await this.client
      .from('app_rooms')
      .select('*')
      .eq('zone_id', zoneId)
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async findById(id: number): Promise<Room | null> {
    const { data, error } = await this.client
      .from('app_rooms')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      // Handle "not found" case gracefully
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  async create(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const { data, error } = await this.client
      .from('app_rooms')
      .insert([room])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: number, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await this.client
      .from('app_rooms')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    // Delete the room - database will cascade delete tasks and task assignments automatically
    // Due to foreign key constraint: app_tasks.room_id -> app_rooms.id (ON DELETE CASCADE)
    const { error } = await this.client
      .from('app_rooms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
