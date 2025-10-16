import React, { useState, useEffect, useCallback } from 'react';
import { TaskTemplate, TaskTemplateFormData } from '@skyward/shared';
import { templateService } from '@/services/templateService';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TaskTemplate) => void;
  roomId: number;
  onTemplateUpdated?: () => void;
}

interface TemplateFormProps {
  template?: TaskTemplate | null;
  onSubmit: (data: TaskTemplateFormData, cascadeUpdate?: boolean) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  tasksUsingTemplate?: number;
}

function TemplateForm({ template, onSubmit, onCancel, loading, tasksUsingTemplate = 0 }: TemplateFormProps) {
  const [formData, setFormData] = useState<TaskTemplateFormData>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cascadeUpdate, setCascadeUpdate] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
      });
      // Auto-check cascade update if template is in use
      setCascadeUpdate(tasksUsingTemplate > 0);
    } else {
      setFormData({
        name: '',
        description: '',
      });
      setCascadeUpdate(false);
    }
    setErrors({});
  }, [template, tasksUsingTemplate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit(formData, cascadeUpdate);
    } catch {
      // Error handling is done in parent component
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {template ? 'Edit Template' : 'Create New Template'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Template Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter template name"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter task description"
                disabled={loading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {template && tasksUsingTemplate > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Template in Use
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>This template is currently being used by {tasksUsingTemplate} task{tasksUsingTemplate !== 1 ? 's' : ''}.</p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center">
                        <input
                          id="cascade-update"
                          name="cascade-update"
                          type="checkbox"
                          checked={cascadeUpdate}
                          onChange={(e) => setCascadeUpdate(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="cascade-update" className="ml-2 text-sm text-yellow-700">
                          Update all tasks using this template
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (template ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TemplateModal({ isOpen, onClose, onSelectTemplate, roomId, onTemplateUpdated }: TemplateModalProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [viewingDescription, setViewingDescription] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TaskTemplate | null>(null);
  const [tasksUsingTemplate, setTasksUsingTemplate] = useState<{ [key: number]: number }>({});

  const templatesPerPage = 10;

  const fetchTemplates = useCallback(async (searchTerm = '', page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await templateService.getTemplates(searchTerm, page, templatesPerPage);
      setTemplates(result.templates);
      setTotalTemplates(result.total);
      
      // Fetch task counts for each template
      const taskCounts: { [key: number]: number } = {};
      for (const template of result.templates) {
        try {
          const taskResult = await templateService.getTasksUsingTemplate(template.id);
          taskCounts[template.id] = taskResult.count;
        } catch {
          taskCounts[template.id] = 0;
        }
      }
      setTasksUsingTemplate(taskCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates(search, currentPage);
    }
  }, [isOpen, search, currentPage, fetchTemplates]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSelectTemplate = async (template: TaskTemplate) => {
    try {
      // Create task from template
      const { taskService } = await import('@/services/taskService');
      await taskService.createTask({
        room_id: roomId,
        description: template.name,
        task_description: template.description,
        template_id: template.id,
      });
      
      onSelectTemplate(template);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task from template');
    }
  };

  const handleCreateTemplate = async (data: TaskTemplateFormData) => {
    try {
      setFormLoading(true);
      setError(null);
      await templateService.createTemplate(data);
      setShowForm(false);
      fetchTemplates(search, currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTemplate = async (data: TaskTemplateFormData, cascadeUpdate = false) => {
    if (!editingTemplate) return;
    
    try {
      setFormLoading(true);
      setError(null);
      const result = await templateService.updateTemplate(editingTemplate.id, data, cascadeUpdate);
      setEditingTemplate(null);
      setShowForm(false);
      fetchTemplates(search, currentPage);
      
      // If cascade update was performed, refresh the task list
      if (cascadeUpdate && result.cascadeInfo?.cascadeUpdate) {
        onTemplateUpdated?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTemplate = async (template: TaskTemplate, cascadeDelete = false) => {
    try {
      setFormLoading(true);
      setError(null);
      const result = await templateService.deleteTemplate(template.id, cascadeDelete);
      setShowDeleteConfirm(null);
      fetchTemplates(search, currentPage);
      
      // If cascade delete was performed, refresh the task list
      if (cascadeDelete && result.cascadeInfo?.cascadeDelete) {
        onTemplateUpdated?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setFormLoading(false);
    }
  };

  const totalPages = Math.ceil(totalTemplates / templatesPerPage);

  if (!isOpen) return null;

  if (showForm) {
    return (
      <TemplateForm
        template={editingTemplate}
        onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        onCancel={() => {
          setShowForm(false);
          setEditingTemplate(null);
        }}
        loading={formLoading}
        tasksUsingTemplate={editingTemplate ? tasksUsingTemplate[editingTemplate.id] || 0 : 0}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Task Templates
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-4 flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="ml-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create New Template
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {search ? 'No templates found matching your search.' : 'No templates available. Create your first template!'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                        <button
                          onClick={() => setViewingDescription(viewingDescription === template.id ? null : template.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {viewingDescription === template.id ? 'Hide Description' : 'View Description'}
                        </button>
                      </div>
                      {viewingDescription === template.id && (
                        <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="px-3 py-1 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Use Template
                      </button>
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowForm(true);
                        }}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(template)}
                        className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <nav className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 text-sm font-medium border rounded-md ${
                          page === currentPage
                            ? 'text-blue-600 bg-blue-50 border-blue-300'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-60">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Template</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the template &ldquo;{showDeleteConfirm.name}&rdquo;?
                  </p>
                  {tasksUsingTemplate[showDeleteConfirm.id] > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Template in Use
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>This template is currently being used by {tasksUsingTemplate[showDeleteConfirm.id]} task{tasksUsingTemplate[showDeleteConfirm.id] !== 1 ? 's' : ''}.</p>
                            <p className="mt-1">Deleting this template will also delete all tasks created from it.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(showDeleteConfirm, true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  disabled={formLoading}
                >
                  {formLoading ? 'Deleting...' : 'Delete Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
