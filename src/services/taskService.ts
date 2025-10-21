import { Task, TaskFormData } from '@/types';

const API_BASE_URL = '/api/tasks';

class TaskService {
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

  async getAllTasks(): Promise<Task[]> {
    return this.request<Task[]>('');
  }

  async getTaskById(id: number): Promise<Task> {
    return this.request<Task>(`/${id}`);
  }

  async getTasksByRoomId(roomId: number): Promise<Task[]> {
    return this.request<Task[]>(`/room/${roomId}`);
  }

  async createTask(task: TaskFormData): Promise<Task> {
    const response = await this.request<{ task: Task; warning?: string | null }>('', {
      method: 'POST',
      body: JSON.stringify(task),
    });
    
    // Show warning if translation failed
    if (response.warning) {
      console.warn('⚠️ Translation warning:', response.warning);
    }
    
    return response.task;
  }

  async updateTask(id: number, updates: Partial<TaskFormData>): Promise<Task> {
    const response = await this.request<{ task: Task; warning?: string | null }>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    // Show warning if translation failed
    if (response.warning) {
      console.warn('⚠️ Translation warning:', response.warning);
    }
    
    return response.task;
  }

  async deleteTask(id: number): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderTasks(taskIds: number[]): Promise<void> {
    return this.request<void>('/reorder', {
      method: 'POST',
      body: JSON.stringify({ taskIds }),
    });
  }
}

export const taskService = new TaskService();
