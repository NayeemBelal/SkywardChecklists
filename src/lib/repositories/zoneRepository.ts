import { supabase } from '@/lib/supabase';
import { Zone } from '@skyward/shared';
import { SupabaseClient } from '@supabase/supabase-js';

export class ZoneRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || supabase;
  }
  async findAll(): Promise<Zone[]> {
    const { data, error } = await this.client
      .from('app_zones')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async findBySiteId(siteId: number): Promise<Zone[]> {
    const { data, error } = await this.client
      .from('app_zones')
      .select('*')
      .eq('site_id', siteId)
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async findById(id: number): Promise<Zone | null> {
    const { data, error } = await this.client
      .from('app_zones')
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

  async create(zone: Omit<Zone, 'id' | 'created_at' | 'updated_at'>): Promise<Zone> {
    const { data, error } = await this.client
      .from('app_zones')
      .insert([zone])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: number, updates: Partial<Zone>): Promise<Zone> {
    const { data, error } = await this.client
      .from('app_zones')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    // Check for existing rooms before deletion
    const { data: rooms, error: roomsError } = await this.client
      .from('app_rooms')
      .select('id')
      .eq('zone_id', id)
      .limit(1);
    
    if (roomsError) throw roomsError;
    
    if (rooms && rooms.length > 0) {
      throw new Error('Cannot delete zone with existing rooms');
    }
    
    const { error } = await this.client
      .from('app_zones')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
