import { supabase } from '@/lib/supabase';
import { TaskTemplate } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export class TaskTemplateRepository {
  private client: SupabaseClient;

  constructor(client?: SupabaseClient) {
    this.client = client || supabase;
  }

  async findAll(search?: string, limit = 20, offset = 0): Promise<{ templates: TaskTemplate[]; total: number }> {
    let query = this.client
      .from('app_task_templates')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query
      .order('name')
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { templates: data || [], total: count || 0 };
  }

  async findById(id: number): Promise<TaskTemplate | null> {
    const { data, error } = await this.client
      .from('app_task_templates')
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

  async create(template: Omit<TaskTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<TaskTemplate> {
    const { data, error } = await this.client
      .from('app_task_templates')
      .insert([template])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: number, updates: Partial<TaskTemplate>): Promise<TaskTemplate> {
    const { data, error } = await this.client
      .from('app_task_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: number): Promise<void> {
    const { error } = await this.client
      .from('app_task_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async checkDuplicateDescription(description: string, excludeId?: number): Promise<boolean> {
    let query = this.client
      .from('app_task_templates')
      .select('id')
      .eq('description', description);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.limit(1);

    if (error) throw error;
    return (data && data.length > 0);
  }

  async getTasksUsingTemplate(templateId: number): Promise<{ count: number; tasks: unknown[] }> {
    const { data, error, count } = await this.client
      .from('app_tasks')
      .select('id, description, room_id, app_rooms!inner(name, app_zones!inner(name, app_sites!inner(name)))', { count: 'exact' })
      .eq('template_id', templateId);

    if (error) throw error;
    return { count: count || 0, tasks: data || [] };
  }

  async updateTasksFromTemplate(templateId: number, templateData: { name?: string; description?: string }): Promise<void> {
    const updateData: { description?: string; task_description?: string } = {};
    
    if (templateData.name !== undefined) {
      updateData.description = templateData.name;
    }
    
    if (templateData.description !== undefined) {
      updateData.task_description = templateData.description;
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await this.client
        .from('app_tasks')
        .update(updateData)
        .eq('template_id', templateId);

      if (error) throw error;
    }
  }

  async deleteTasksFromTemplate(templateId: number): Promise<void> {
    const { error } = await this.client
      .from('app_tasks')
      .delete()
      .eq('template_id', templateId);

    if (error) throw error;
  }
}
