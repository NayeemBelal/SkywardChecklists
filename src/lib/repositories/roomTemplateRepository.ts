import { supabase } from '@/lib/supabase';
import { RoomTemplate, RoomTemplateTask, RoomTemplateWithTasks, TaskFrequency } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export class RoomTemplateRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || supabase;
  }

  async findAll(): Promise<RoomTemplate[]> {
    const { data, error } = await this.client
      .from('app_room_templates')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  async findById(id: number): Promise<RoomTemplate | null> {
    const { data, error } = await this.client
      .from('app_room_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
    return data;
  }

  async findByIdWithTasks(id: number): Promise<RoomTemplateWithTasks | null> {
    const template = await this.findById(id);
    if (!template) return null;

    const tasks = await this.getTemplateTasks(id);
    
    return {
      ...template,
      tasks
    };
  }

  async getTemplateTasks(templateId: number): Promise<RoomTemplateTask[]> {
    const { data, error } = await this.client
      .from('app_tasks')
      .select('*')
      .eq('room_template_id', templateId)
      .eq('is_template_task', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data as RoomTemplateTask[];
  }

  async create(template: Omit<RoomTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<RoomTemplate> {
    const { data, error } = await this.client
      .from('app_room_templates')
      .insert([template])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async update(id: number, updates: Partial<RoomTemplate>): Promise<RoomTemplate> {
    const { data, error } = await this.client
      .from('app_room_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    // Delete all template tasks first
    await this.deleteTemplateTasks(id);

    // Delete the template
    const { error } = await this.client
      .from('app_room_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async deleteTemplateTasks(templateId: number): Promise<void> {
    const { error } = await this.client
      .from('app_tasks')
      .delete()
      .eq('room_template_id', templateId)
      .eq('is_template_task', true);
    
    if (error) throw error;
  }

  async createTemplateTask(task: Omit<RoomTemplateTask, 'id' | 'created_at' | 'updated_at'>): Promise<RoomTemplateTask> {
    // Template tasks don't belong to a real room, so room_id is NULL
    const taskData = {
      ...task,
      room_id: null,
      is_template_task: true
    };

    const { data, error } = await this.client
      .from('app_tasks')
      .insert([taskData])
      .select()
      .single();
    
    if (error) throw error;
    return data as RoomTemplateTask;
  }

  async updateTemplateTask(id: number, updates: Partial<RoomTemplateTask>): Promise<RoomTemplateTask> {
    const { data, error } = await this.client
      .from('app_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('is_template_task', true)
      .select()
      .single();
    
    if (error) throw error;
    return data as RoomTemplateTask;
  }

  async deleteTemplateTask(id: number): Promise<void> {
    const { error } = await this.client
      .from('app_tasks')
      .delete()
      .eq('id', id)
      .eq('is_template_task', true);
    
    if (error) throw error;
  }

  async getRoomsUsingTemplate(templateId: number): Promise<{ count: number; rooms: unknown[] }> {
    const { data, error, count } = await this.client
      .from('app_rooms')
      .select('id, name, zone_id, app_zones!inner(name, app_sites!inner(name))', { count: 'exact' })
      .eq('room_template_id', templateId);

    if (error) throw error;
    return { count: count || 0, rooms: data || [] };
  }

  async updateRoomsFromTemplate(templateId: number, templateData: { name?: string; description?: string }): Promise<void> {
    const updates: { name?: string; description?: string; updated_at: string } = {
      updated_at: new Date().toISOString()
    };

    if (templateData.name !== undefined) {
      updates.name = templateData.name;
    }

    if (templateData.description !== undefined) {
      updates.description = templateData.description;
    }

    const { error } = await this.client
      .from('app_rooms')
      .update(updates)
      .eq('room_template_id', templateId);

    if (error) throw error;
  }

  async updateTasksFromTemplateTask(templateTaskId: number, taskData: { description?: string; description_es?: string | null; task_description?: string; frequency?: TaskFrequency | null }): Promise<void> {
    // Find the template task to get its room_template_id
    const { data: templateTask, error: fetchError } = await this.client
      .from('app_tasks')
      .select('room_template_id, sort_order')
      .eq('id', templateTaskId)
      .eq('is_template_task', true)
      .single();

    if (fetchError) throw fetchError;
    if (!templateTask || !templateTask.room_template_id) return;

    // Get all rooms using this template
    const { data: rooms, error: roomsError } = await this.client
      .from('app_rooms')
      .select('id')
      .eq('room_template_id', templateTask.room_template_id);

    if (roomsError) throw roomsError;
    if (!rooms || rooms.length === 0) return;

    const roomIds = rooms.map(r => r.id);

    // Update all tasks in these rooms that match the sort_order
    const updates: { description?: string; description_es?: string | null; task_description?: string; frequency?: TaskFrequency | null; updated_at: string } = {
      updated_at: new Date().toISOString()
    };

    if (taskData.description !== undefined) {
      updates.description = taskData.description;
    }

    if (taskData.description_es !== undefined) {
      updates.description_es = taskData.description_es;
    }

    if (taskData.task_description !== undefined) {
      updates.task_description = taskData.task_description;
    }

    if (taskData.frequency !== undefined) {
      updates.frequency = taskData.frequency;
    }

    const { error: updateError } = await this.client
      .from('app_tasks')
      .update(updates)
      .in('room_id', roomIds)
      .eq('sort_order', templateTask.sort_order);

    if (updateError) throw updateError;
  }
}

