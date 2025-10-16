import { useState, useCallback } from 'react';
import { Task, TaskFormData } from '@/types';
import { taskService } from '@/services/taskService';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasksByRoom = useCallback(async (roomId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasksByRoomId(roomId);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: TaskFormData) => {
    try {
      setError(null);
      const newTask = await taskService.createTask(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateTask = useCallback(async (id: number, updates: Partial<TaskFormData>) => {
    try {
      setError(null);
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const reorderTasks = useCallback(async (taskIds: number[]) => {
    try {
      setError(null);
      await taskService.reorderTasks(taskIds);
      // Update local state with new order without fetching from server
      setTasks(prevTasks => {
        const reorderedTasks = taskIds.map(id => prevTasks.find(task => task.id === id)).filter(Boolean) as Task[];
        const remainingTasks = prevTasks.filter(task => !taskIds.includes(task.id));
        return [...reorderedTasks, ...remainingTasks];
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder tasks';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchTasksByRoom,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
