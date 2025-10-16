import { supabase } from '@/lib/supabase';
import { Site } from '@/types';

export class SiteRepository {
  async findAll(): Promise<Site[]> {
    const { data, error } = await supabase
      .from('app_sites')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async findById(id: number): Promise<Site | null> {
    const { data, error } = await supabase
      .from('app_sites')
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

  async create(site: Omit<Site, 'id'>): Promise<Site> {
    const { data, error } = await supabase
      .from('app_sites')
      .insert([site])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: number, updates: Partial<Site>): Promise<Site> {
    const { data, error } = await supabase
      .from('app_sites')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('app_sites')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
