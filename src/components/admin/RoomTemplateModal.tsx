import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomTemplate, RoomTemplateTaskFormData, RoomTemplateWithTasks } from '@/types';

interface RoomTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, tasks: RoomTemplateTaskFormData[], cascadeUpdate?: boolean) => Promise<void>;
  template?: RoomTemplateWithTasks | null;
  loading?: boolean;
}

export function RoomTemplateModal({ isOpen, onClose, onSave, template, loading }: RoomTemplateModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<Array<{ description: string; task_description: string; tempId: string }>>([]);
  const [errors, setErrors] = useState<{ name?: string; tasks?: { [key: string]: string } }>({});
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [cascadeUpdate, setCascadeUpdate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
        setTasks(template.tasks.map((t, idx) => ({
          description: t.description,
          task_description: t.task_description || '',
          tempId: `existing-${t.id}`
        })));
      } else {
        setName('');
        setDescription('');
        setTasks([]);
      }
      setErrors({});
      setEditingTaskId(null);
      setCascadeUpdate(false);
    }
  }, [isOpen, template]);

  const handleAddTask = () => {
    const tempId = `temp-${Date.now()}`;
    setTasks([...tasks, { description: '', task_description: '', tempId }]);
    setEditingTaskId(tempId);
  };

  const handleRemoveTask = (tempId: string) => {
    setTasks(tasks.filter(t => t.tempId !== tempId));
    if (editingTaskId === tempId) {
      setEditingTaskId(null);
    }
  };

  const handleTaskChange = (tempId: string, field: 'description' | 'task_description', value: string) => {
    setTasks(tasks.map(t => t.tempId === tempId ? { ...t, [field]: value } : t));
    // Clear error for this task
    if (errors.tasks?.[tempId]) {
      setErrors({
        ...errors,
        tasks: { ...errors.tasks, [tempId]: '' }
      });
    }
  };

  const handleMoveTaskUp = (index: number) => {
    if (index > 0) {
      const newTasks = [...tasks];
      [newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]];
      setTasks(newTasks);
    }
  };

  const handleMoveTaskDown = (index: number) => {
    if (index < tasks.length - 1) {
      const newTasks = [...tasks];
      [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
      setTasks(newTasks);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; tasks?: { [key: string]: string } } = {};

    if (!name.trim()) {
      newErrors.name = t('required');
    }

    const taskErrors: { [key: string]: string } = {};
    tasks.forEach(task => {
      if (!task.description.trim()) {
        taskErrors[task.tempId] = t('required');
      }
    });

    if (Object.keys(taskErrors).length > 0) {
      newErrors.tasks = taskErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const taskData: RoomTemplateTaskFormData[] = tasks.map((task, index) => ({
      description: task.description.trim(),
      task_description: task.task_description.trim() || undefined,
      sort_order: index
    }));

    await onSave(name.trim(), description.trim(), taskData, cascadeUpdate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {template ? t('edit_room_template') : t('create_room_template')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name and Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('room')} {t('name')}</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('room_name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter room template name"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter room description (optional)"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('template_tasks')}</h3>
              <button
                type="button"
                onClick={handleAddTask}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={loading}
              >
                {t('add_task_to_template')}
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t('no_tasks')}. {t('add_task_to_template')} to get started.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.map((task, index) => (
                  <div
                    key={task.tempId}
                    className={`bg-white p-4 rounded-md border ${
                      errors.tasks?.[task.tempId] ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Order controls */}
                      <div className="flex flex-col gap-1 pt-2">
                        <button
                          type="button"
                          onClick={() => handleMoveTaskUp(index)}
                          disabled={index === 0 || loading}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTaskDown(index)}
                          disabled={index === tasks.length - 1 || loading}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Task number */}
                      <div className="flex-shrink-0 w-8 pt-2">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                          {index + 1}
                        </span>
                      </div>

                      {/* Task fields */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('task_name')} *
                          </label>
                          <input
                            type="text"
                            value={task.description}
                            onChange={(e) => handleTaskChange(task.tempId, 'description', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                              errors.tasks?.[task.tempId] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter task name"
                            disabled={loading}
                          />
                          {errors.tasks?.[task.tempId] && (
                            <p className="mt-1 text-sm text-red-600">{errors.tasks[task.tempId]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t('task_description')}
                          </label>
                          <textarea
                            value={task.task_description}
                            onChange={(e) => handleTaskChange(task.tempId, 'task_description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Enter detailed task description (optional)"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(task.tempId)}
                        className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 mt-2"
                        disabled={loading}
                        title="Remove task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cascade Update Option (only show when editing) */}
          {template && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="cascade-update"
                    type="checkbox"
                    checked={cascadeUpdate}
                    onChange={(e) => setCascadeUpdate(e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3">
                  <label htmlFor="cascade-update" className="text-sm font-medium text-yellow-800">
                    {t('cascade_update')}
                  </label>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('cascade_update_warning')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? t('loading') : (template ? t('save') : t('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

