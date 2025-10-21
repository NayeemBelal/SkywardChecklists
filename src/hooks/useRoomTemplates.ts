import { useState, useCallback } from 'react';
import { RoomTemplate, RoomTemplateWithTasks, RoomTemplateFormData, RoomTemplateTaskFormData, Room, Task } from '@/types';

export function useRoomTemplates() {
  const [templates, setTemplates] = useState<(RoomTemplate & { usageCount: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('supabase.auth.token');
  };

  const makeRequest = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = getAuthToken();
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('supabase.auth.token');
        }
        throw new Error('Authentication failed. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  };

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await makeRequest<(RoomTemplate & { usageCount: number })[]>('/api/room-templates');
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  const getTemplateById = useCallback(async (id: number): Promise<RoomTemplateWithTasks | null> => {
    try {
      setError(null);
      return await makeRequest<RoomTemplateWithTasks>(`/api/room-templates/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch template');
      return null;
    }
  }, [makeRequest]);

  const createTemplate = useCallback(async (
    data: RoomTemplateFormData,
    tasks: RoomTemplateTaskFormData[] = []
  ): Promise<RoomTemplateWithTasks> => {
    try {
      setError(null);
      const newTemplate = await makeRequest<RoomTemplateWithTasks>('/api/room-templates', {
        method: 'POST',
        body: JSON.stringify({ ...data, tasks })
      });

      setTemplates(prev => [...prev, { ...newTemplate, usageCount: 0 }]);
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeRequest]);

  const updateTemplate = useCallback(async (
    id: number,
    data: RoomTemplateFormData,
    tasks: RoomTemplateTaskFormData[] = [],
    cascadeUpdate: boolean = false
  ): Promise<void> => {
    try {
      setError(null);
      const result = await makeRequest<{ template: RoomTemplate; cascadeInfo?: { cascadeUpdate: boolean; roomsUpdated: number }; warning?: string }>(`/api/room-templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...data, tasks, cascadeUpdate })
      });

      setTemplates(prev => prev.map(t => t.id === id ? { ...result.template, usageCount: t.usageCount } : t));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeRequest]);

  const deleteTemplate = useCallback(async (id: number, cascadeDelete: boolean = false): Promise<void> => {
    try {
      setError(null);
      await makeRequest(`/api/room-templates/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ cascadeDelete })
      });

      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeRequest]);

  const createRoomFromTemplate = useCallback(async (templateId: number, zoneId: number): Promise<{ room: Room; tasks: Task[] }> => {
    try {
      setError(null);
      return await makeRequest<{ room: Room; tasks: Task[] }>(`/api/room-templates/${templateId}/use`, {
        method: 'POST',
        body: JSON.stringify({ zoneId })
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeRequest]);

  const addTaskToTemplate = useCallback(async (
    templateId: number,
    taskData: RoomTemplateTaskFormData
  ): Promise<RoomTemplateWithTasks> => {
    try {
      setError(null);
      return await makeRequest<RoomTemplateWithTasks>(`/api/room-templates/${templateId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData)
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add task to template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeRequest]);

  const updateTemplateTask = useCallback(async (
    taskId: number,
    taskData: Partial<RoomTemplateTaskFormData>,
    cascadeUpdate: boolean = false
  ): Promise<void> => {
    try {
      setError(null);
      await makeRequest(`/api/room-templates/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...taskData, cascadeUpdate })
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeRequest]);

  const deleteTemplateTask = useCallback(async (taskId: number, cascadeDelete: boolean = false): Promise<void> => {
    try {
      setError(null);
      await makeRequest(`/api/room-templates/tasks/${taskId}`, {
        method: 'DELETE',
        body: JSON.stringify({ cascadeDelete })
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [makeRequest]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    createRoomFromTemplate,
    addTaskToTemplate,
    updateTemplateTask,
    deleteTemplateTask
  };
}

