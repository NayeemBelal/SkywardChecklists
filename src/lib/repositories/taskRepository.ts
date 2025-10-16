import { supabase } from '@/lib/supabase';
import { Task } from '@skyward/shared';
import { SupabaseClient } from '@supabase/supabase-js';

export class TaskRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || supabase;
  }

  async findAll(): Promise<Task[]> {
    const { data, error } = await this.client
      .from('app_tasks')
      .select('*')
      .order('description');
    
    if (error) throw error;
    return data;
  }

  async findByRoomId(roomId: number): Promise<Task[]> {
    const { data, error } = await this.client
      .from('app_tasks')
      .select('*')
      .eq('room_id', roomId)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async findById(id: number): Promise<Task | null> {
    const { data, error } = await this.client
      .from('app_tasks')
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

  async create(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await this.client
      .from('app_tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: number, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await this.client
      .from('app_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    // Check for existing task assignments before deletion
    const { data: assignments, error: assignmentsError } = await this.client
      .from('app_task_assignments')
      .select('id')
      .eq('task_id', id)
      .limit(1);
    
    if (assignmentsError) throw assignmentsError;
    
    if (assignments && assignments.length > 0) {
      throw new Error('Cannot delete task with existing assignments');
    }
    
    const { error } = await this.client
      .from('app_tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
