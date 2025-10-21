import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RoomTemplate, RoomTemplateWithTasks, RoomTemplateTaskFormData } from '@/types';
import { useRoomTemplates } from '@/hooks/useRoomTemplates';
import { RoomTemplateModal } from './RoomTemplateModal';

interface RoomTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: number) => Promise<void>;
  zoneId: number;
}

export function RoomTemplateSelector({ isOpen, onClose, onSelectTemplate }: RoomTemplateSelectorProps) {
  const { t } = useTranslation();
  const {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = useRoomTemplates();

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [usingTemplate, setUsingTemplate] = useState<number | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<(RoomTemplate & { usageCount: number }) | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<RoomTemplateWithTasks | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null);
  const [templateDetails, setTemplateDetails] = useState<{ [key: number]: RoomTemplateWithTasks }>({});

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSearch('');
    }
  }, [isOpen, fetchTemplates]);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(search.toLowerCase()) ||
    template.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateTemplate = async (name: string, description: string, tasks: RoomTemplateTaskFormData[]) => {
    try {
      setCreatingTemplate(true);
      await createTemplate({ name, description }, tasks);
      
      // Clear all template details cache since we have a new template
      setTemplateDetails({});
      
      // Refresh templates to ensure all data is up to date
      await fetchTemplates();
      
      // Small delay to ensure UI updates are visible
      setTimeout(() => {
        setShowCreateModal(false);
      }, 100);
    } catch (err) {
      // Error is already handled in the hook
      console.error('Failed to create template:', err);
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleUseTemplate = async (templateId: number) => {
    try {
      setUsingTemplate(templateId);
      await onSelectTemplate(templateId);
      onClose();
    } catch (err) {
      console.error('Failed to use template:', err);
    } finally {
      setUsingTemplate(null);
    }
  };

  const handleDeleteTemplate = async (template: RoomTemplate, cascadeDelete: boolean) => {
    try {
      await deleteTemplate(template.id, cascadeDelete);
      setDeletingTemplate(null);
      
      // Clear the template details cache for the deleted template
      setTemplateDetails(prev => {
        const updated = { ...prev };
        delete updated[template.id];
        return updated;
      });
      
      await fetchTemplates();
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const handleEditTemplate = async (template: RoomTemplate) => {
    try {
      const templateWithTasks = await getTemplateById(template.id);
      if (templateWithTasks) {
        setEditingTemplate(templateWithTasks);
      }
    } catch (err) {
      console.error('Failed to fetch template details:', err);
    }
  };

  const handleSaveTemplate = async (name: string, description: string, tasks: RoomTemplateTaskFormData[], cascadeUpdate: boolean = false) => {
    if (!editingTemplate) return;
    
    try {
      setCreatingTemplate(true);
      await updateTemplate(editingTemplate.id, { name, description }, tasks, cascadeUpdate);
      
      // Clear the template details cache for this template so it gets refreshed
      setTemplateDetails(prev => {
        const updated = { ...prev };
        delete updated[editingTemplate.id];
        return updated;
      });
      
      // Refresh templates to ensure all data is up to date
      await fetchTemplates();
      
      // Small delay to ensure UI updates are visible
      setTimeout(() => {
        setEditingTemplate(null);
      }, 100);
    } catch (err) {
      console.error('Failed to update template:', err);
    } finally {
      setCreatingTemplate(false);
    }
  };

  const toggleTemplateDetails = async (templateId: number) => {
    if (expandedTemplateId === templateId) {
      setExpandedTemplateId(null);
    } else {
      setExpandedTemplateId(templateId);
      // Fetch template details if not already loaded
      if (!templateDetails[templateId]) {
        try {
          const template = await getTemplateById(templateId);
          if (template) {
            setTemplateDetails({ ...templateDetails, [templateId]: template });
          }
        } catch (err) {
          console.error('Failed to fetch template details:', err);
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-6 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{t('room_templates')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
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

          <div className="mb-4 flex justify-between items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={t('search_templates')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
            >
              {t('create_new_template')}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">{t('loading')}</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {search ? t('no_room_templates') : t('no_room_templates') + '. ' + t('create_new_template') + ' to get started.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          {template.usageCount > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {template.usageCount} {template.usageCount === 1 ? 'room' : 'rooms'}
                            </span>
                          )}
                        </div>
                        {template.description && (
                          <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleTemplateDetails(template.id)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          {expandedTemplateId === template.id ? 'Hide Tasks' : 'View Tasks'}
                        </button>
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {t('edit')}
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template.id)}
                          disabled={usingTemplate === template.id}
                          className="px-3 py-1 text-xs font-medium text-white bg-green-600 border border-transparent rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {usingTemplate === template.id ? t('loading') : t('use_template')}
                        </button>
                        <button
                          onClick={() => setDeletingTemplate(template)}
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded task details */}
                  {expandedTemplateId === template.id && templateDetails[template.id] && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">{t('template_tasks')}:</h4>
                      {templateDetails[template.id].tasks.length === 0 ? (
                        <p className="text-sm text-gray-500">{t('no_tasks')}</p>
                      ) : (
                        <div className="space-y-2">
                          {templateDetails[template.id].tasks.map((task, index) => (
                            <div key={task.id} className="flex items-start gap-2 text-sm">
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{task.description}</p>
                                {task.task_description && (
                                  <p className="text-gray-600 mt-1">{task.task_description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <RoomTemplateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTemplate}
          loading={creatingTemplate}
        />
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <RoomTemplateModal
          isOpen={!!editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleSaveTemplate}
          template={editingTemplate}
          loading={creatingTemplate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTemplate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[100]">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium text-gray-900">{t('delete_room_template')}</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete &ldquo;{deletingTemplate.name}&rdquo;?
                  </p>
                  {deletingTemplate.usageCount > 0 && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">
                        {t('template_usage').replace('{count}', deletingTemplate.usageCount.toString())}
                      </p>
                      <p className="text-sm text-yellow-700 mt-2">
                        {t('cascade_delete_warning')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-5 flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => setDeletingTemplate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(deletingTemplate, deletingTemplate.usageCount > 0)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

