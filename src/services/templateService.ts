import { TaskTemplate, TaskTemplateFormData } from '@/types';

const API_BASE_URL = '/api/task-templates';

class TemplateService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('supabase.auth.token');
  }

  async getTemplates(search?: string, page = 1, limit = 20): Promise<{ templates: TaskTemplate[]; total: number }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    return this.request<{ templates: TaskTemplate[]; total: number }>(`?${params.toString()}`);
  }

  async getTemplateById(id: number): Promise<TaskTemplate> {
    return this.request<TaskTemplate>(`/${id}`);
  }

  async createTemplate(template: TaskTemplateFormData): Promise<TaskTemplate> {
    return this.request<TaskTemplate>('', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTemplate(id: number, updates: Partial<TaskTemplateFormData>, cascadeUpdate = false): Promise<TaskTemplate & { cascadeInfo?: { tasksAffected: number; cascadeUpdate: boolean } }> {
    return this.request<TaskTemplate & { cascadeInfo?: { tasksAffected: number; cascadeUpdate: boolean } }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...updates, cascadeUpdate }),
    });
  }

  async deleteTemplate(id: number, cascadeDelete = false): Promise<{ message: string; cascadeInfo?: { tasksAffected: number; cascadeDelete: boolean } }> {
    return this.request<{ message: string; cascadeInfo?: { tasksAffected: number; cascadeDelete: boolean } }>(`/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ cascadeDelete }),
    });
  }

  async getTasksUsingTemplate(id: number): Promise<{ count: number; tasks: unknown[] }> {
    return this.request<{ count: number; tasks: unknown[] }>(`/${id}/tasks`);
  }
}

export const templateService = new TemplateService();
export type { TaskTemplateFormData };
