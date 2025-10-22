import { RoomTemplate, RoomTemplateWithTasks, RoomTemplateFormData, RoomTemplateTaskFormData, Room, Task } from '@/types';
import { RoomTemplateRepository } from '@/lib/repositories/roomTemplateRepository';
import { RoomRepository } from '@/lib/repositories/roomRepository';
import { TaskRepository } from '@/lib/repositories/taskRepository';
import { getSupabaseAdmin } from '@/lib/supabase';

class RoomTemplateService {
  private roomTemplateRepository: RoomTemplateRepository;
  private roomRepository: RoomRepository;
  private taskRepository: TaskRepository;

  constructor() {
    const supabaseAdmin = getSupabaseAdmin();
    this.roomTemplateRepository = new RoomTemplateRepository(supabaseAdmin);
    this.roomRepository = new RoomRepository(supabaseAdmin);
    this.taskRepository = new TaskRepository(supabaseAdmin);
  }

  async getAllTemplates(): Promise<RoomTemplate[]> {
    return this.roomTemplateRepository.findAll();
  }

  async getTemplateById(id: number): Promise<RoomTemplateWithTasks | null> {
    return this.roomTemplateRepository.findByIdWithTasks(id);
  }

  async createTemplate(data: RoomTemplateFormData, tasks: RoomTemplateTaskFormData[] = []): Promise<RoomTemplateWithTasks> {
    // Create the template
    const template = await this.roomTemplateRepository.create({
      name: data.name,
      description: data.description
    });

    // Create template tasks
    const createdTasks = [];
    for (let i = 0; i < tasks.length; i++) {
      const taskData = {
        room_template_id: template.id,
        description: tasks[i].description,
        description_es: tasks[i].description_es,
        task_description: tasks[i].task_description,
        sort_order: tasks[i].sort_order ?? i,
        frequency: tasks[i].frequency
      };
      const createdTask = await this.roomTemplateRepository.createTemplateTask(taskData);
      createdTasks.push(createdTask);
    }

    return {
      ...template,
      tasks: createdTasks
    };
  }

  async updateTemplate(
    id: number, 
    data: RoomTemplateFormData, 
    tasks: RoomTemplateTaskFormData[] = [],
    cascadeUpdate: boolean = false
  ): Promise<{ template: RoomTemplate; cascadeInfo?: { cascadeUpdate: boolean; roomsUpdated: number } }> {
    const template = await this.roomTemplateRepository.update(id, {
      name: data.name,
      description: data.description
    });

    // Update tasks if provided
    if (tasks.length > 0) {
      // Delete existing template tasks
      await this.roomTemplateRepository.deleteTemplateTasks(id);
      
      // Create new template tasks
      for (let i = 0; i < tasks.length; i++) {
        const taskData = {
          room_template_id: id,
          description: tasks[i].description,
          description_es: tasks[i].description_es,
          task_description: tasks[i].task_description,
          sort_order: tasks[i].sort_order ?? i,
          frequency: tasks[i].frequency
        };
        await this.roomTemplateRepository.createTemplateTask(taskData);
      }
    }

    let cascadeInfo;
    if (cascadeUpdate) {
      // Update all rooms using this template
      await this.roomTemplateRepository.updateRoomsFromTemplate(id, {
        name: data.name,
        description: data.description
      });

      // If tasks were updated, cascade the task updates too
      if (tasks.length > 0) {
        await this.cascadeTaskUpdates(id, tasks);
      }

      const { count } = await this.roomTemplateRepository.getRoomsUsingTemplate(id);
      cascadeInfo = {
        cascadeUpdate: true,
        roomsUpdated: count
      };
    }

    return { template, cascadeInfo };
  }

  private async cascadeTaskUpdates(templateId: number, newTasks: RoomTemplateTaskFormData[]): Promise<void> {
    // Get all rooms using this template
    const { rooms } = await this.roomTemplateRepository.getRoomsUsingTemplate(templateId);
    
    for (const room of rooms as Array<{ id: number }>) {
      // Delete existing tasks in this room
      const existingTasks = await this.taskRepository.findByRoomId(room.id);
      for (const task of existingTasks) {
        await this.taskRepository.delete(task.id);
      }
      
      // Create new tasks from template
      for (let i = 0; i < newTasks.length; i++) {
        const taskData = {
          room_id: room.id,
          description: newTasks[i].description,
          description_es: newTasks[i].description_es,
          task_description: newTasks[i].task_description,
          sort_order: newTasks[i].sort_order ?? i,
          frequency: newTasks[i].frequency,
          room_template_id: templateId
        };
        await this.taskRepository.create(taskData);
      }
    }
  }

  async deleteTemplate(
    id: number, 
    cascadeDelete: boolean = false
  ): Promise<{ success: boolean; cascadeInfo?: { cascadeDelete: boolean; roomsDeleted: number; tasksDeleted: number } }> {
    if (cascadeDelete) {
      // Get all rooms using this template
      const { rooms } = await this.roomTemplateRepository.getRoomsUsingTemplate(id);
      const roomIds = (rooms as Array<{ id: number }>).map(r => r.id);

      let tasksDeleted = 0;
      // Delete all tasks in these rooms
      for (const roomId of roomIds) {
        const tasks = await this.taskRepository.findByRoomId(roomId);
        tasksDeleted += tasks.length;
        for (const task of tasks) {
          await this.taskRepository.delete(task.id);
        }
      }

      // Delete all rooms using this template
      for (const roomId of roomIds) {
        await this.roomRepository.delete(roomId);
      }

      // Delete the template and its template tasks
      await this.roomTemplateRepository.delete(id);

      return {
        success: true,
        cascadeInfo: {
          cascadeDelete: true,
          roomsDeleted: roomIds.length,
          tasksDeleted
        }
      };
    } else {
      // Just unlink rooms from template (set room_template_id to null)
      const { count } = await this.roomTemplateRepository.getRoomsUsingTemplate(id);
      if (count > 0) {
        // Update rooms to unlink them
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin
          .from('app_rooms')
          .update({ room_template_id: null })
          .eq('room_template_id', id);
      }

      // Delete the template and its template tasks
      await this.roomTemplateRepository.delete(id);

      return { success: true };
    }
  }

  async createRoomFromTemplate(templateId: number, zoneId: number): Promise<{ room: Room; tasks: Task[] }> {
    // Get the template with tasks
    const template = await this.roomTemplateRepository.findByIdWithTasks(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Create the room
    const room = await this.roomRepository.create({
      zone_id: zoneId,
      name: template.name,
      description: template.description,
      room_template_id: templateId
    });

    // Create tasks from template
    const tasks: Task[] = [];
    for (const templateTask of template.tasks) {
      const task = await this.taskRepository.create({
        room_id: room.id,
        description: templateTask.description,
        description_es: templateTask.description_es,
        task_description: templateTask.task_description,
        sort_order: templateTask.sort_order,
        frequency: templateTask.frequency
      });
      tasks.push(task);
    }

    return { room, tasks };
  }

  async addTaskToTemplate(templateId: number, taskData: RoomTemplateTaskFormData): Promise<void> {
    // Get existing tasks to determine sort order
    const tasks = await this.roomTemplateRepository.getTemplateTasks(templateId);
    const maxSortOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.sort_order)) : -1;

    await this.roomTemplateRepository.createTemplateTask({
      room_template_id: templateId,
      description: taskData.description,
      description_es: taskData.description_es,
      task_description: taskData.task_description,
      sort_order: taskData.sort_order ?? maxSortOrder + 1,
      frequency: taskData.frequency
    });
  }

  async updateTemplateTask(
    taskId: number, 
    taskData: Partial<RoomTemplateTaskFormData>,
    cascadeUpdate: boolean = false
  ): Promise<void> {
    await this.roomTemplateRepository.updateTemplateTask(taskId, taskData);

    if (cascadeUpdate) {
      // Update all tasks created from this template task
      await this.roomTemplateRepository.updateTasksFromTemplateTask(taskId, taskData);
    }
  }

  async deleteTemplateTask(taskId: number, cascadeDelete: boolean = false): Promise<void> {
    if (cascadeDelete) {
      // Find the template task to get its details
      const supabaseAdmin = getSupabaseAdmin();
      const { data: templateTask, error } = await supabaseAdmin
        .from('app_tasks')
        .select('room_template_id, sort_order')
        .eq('id', taskId)
        .eq('is_template_task', true)
        .single();

      if (error || !templateTask) {
        throw new Error('Template task not found');
      }

      // Get all rooms using this template
      const { data: rooms } = await supabaseAdmin
        .from('app_rooms')
        .select('id')
        .eq('room_template_id', templateTask.room_template_id);

      if (rooms && rooms.length > 0) {
        const roomIds = rooms.map(r => r.id);

        // Delete all tasks in these rooms that match the sort_order
        await supabaseAdmin
          .from('app_tasks')
          .delete()
          .in('room_id', roomIds)
          .eq('sort_order', templateTask.sort_order);
      }
    }

    // Delete the template task
    await this.roomTemplateRepository.deleteTemplateTask(taskId);
  }

  async getTemplatesWithUsageCount(): Promise<Array<RoomTemplate & { usageCount: number }>> {
    const templates = await this.roomTemplateRepository.findAll();
    
    const templatesWithCount = await Promise.all(
      templates.map(async (template) => {
        const { count } = await this.roomTemplateRepository.getRoomsUsingTemplate(template.id);
        return {
          ...template,
          usageCount: count
        };
      })
    );

    return templatesWithCount;
  }
}

export const roomTemplateService = new RoomTemplateService();
export type { RoomTemplateFormData, RoomTemplateTaskFormData };

