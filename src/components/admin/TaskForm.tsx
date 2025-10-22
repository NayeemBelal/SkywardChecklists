import React, { useState, useEffect } from 'react';
import { Task, TaskFormData, TaskFrequency } from '@/types';

interface TaskFormProps {
  task?: Task | null;
  roomId: number;
  onSubmit: (task: TaskFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TaskForm({ task, roomId, onSubmit, onCancel, loading }: TaskFormProps) {
  const [formData, setFormData] = useState<{
    description: string;
    task_description: string;
    frequency: TaskFrequency | null;
  }>({
    description: '',
    task_description: '',
    frequency: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        description: task.description,
        task_description: task.task_description || '',
        frequency: task.frequency || null,
      });
    } else {
      setFormData({
        description: '',
        task_description: '',
        frequency: null,
      });
    }
    setErrors({});
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 1) {
      newErrors.description = 'Description must be at least 1 character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        room_id: roomId,
        description: formData.description.trim(),
        task_description: formData.task_description.trim() || undefined,
        frequency: formData.frequency,
      });
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {task ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Task Name
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter task name"
            disabled={loading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label htmlFor="task_description" className="block text-sm font-medium text-gray-700 mb-1">
            Task Description (Optional)
          </label>
          <textarea
            id="task_description"
            name="task_description"
            value={formData.task_description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Enter detailed task description"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Frequency (Optional)
          </label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            disabled={loading}
          >
            <option value="">No frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
          </button>
        </div>
      </form>
    </div>
  );
}
