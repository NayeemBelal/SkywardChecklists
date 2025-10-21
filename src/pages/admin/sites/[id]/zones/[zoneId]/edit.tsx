import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Site, Zone, Room, Task } from '@/types';
import { useSites } from '@/hooks/useSites';
import { useZones } from '@/hooks/useZones';
import { useRooms } from '@/hooks/useRooms';
import { useTasks } from '@/hooks/useTasks';
import { useRoomTemplates } from '@/hooks/useRoomTemplates';
import { RoomList } from '@/components/admin/RoomList';
import { RoomForm } from '@/components/admin/RoomForm';
import { RoomDeleteModal } from '@/components/admin/RoomDeleteModal';
import { TaskList } from '@/components/admin/TaskList';
import { TaskForm } from '@/components/admin/TaskForm';
import { TaskDeleteModal } from '@/components/admin/TaskDeleteModal';
import TemplateModal from '@/components/admin/TemplateModal';
import { RoomTemplateSelector } from '@/components/admin/RoomTemplateSelector';
import { RoomFormData } from '@/services/roomService';
import { TaskFormData } from '@/types';
import { useTranslation } from 'react-i18next';

export default function EditZonePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id: siteId, zoneId } = router.query;
  const { sites } = useSites();
  const { zones, fetchZonesBySite } = useZones();
  const { rooms, loading, error, createRoom, updateRoom, deleteRoom, fetchRoomsByZone } = useRooms();
  const { tasks, loading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask, fetchTasksByRoom, reorderTasks } = useTasks();
  const { createRoomFromTemplate } = useRoomTemplates();
  // Removed employee assignment hooks from this page
  
  const [site, setSite] = useState<Site | null>(null);
  const [zone, setZone] = useState<Zone | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);
  const [editingRoomField, setEditingRoomField] = useState<{ roomId: number; field: 'name' | 'description' } | null>(null);
  const [editingRoomValue, setEditingRoomValue] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskField, setEditingTaskField] = useState<{ taskId: number; field: 'description' | 'task_description' } | null>(null);
  const [editingTaskValue, setEditingTaskValue] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms'>('rooms');
  const [showRoomTemplateSelector, setShowRoomTemplateSelector] = useState(false);

  // Check authentication on page load
  useEffect(() => {
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Find the site and zone when data is loaded
  useEffect(() => {
    if (sites.length > 0 && siteId && zoneId) {
      const siteIdNum = parseInt(siteId as string);
      // const _zoneIdNum = parseInt(zoneId as string);
      
      const foundSite = sites.find(s => s.id === siteIdNum);
      
      if (foundSite) {
        setSite(foundSite);
        // Fetch zones for this site
        fetchZonesBySite(siteIdNum);
      } else {
        router.push('/admin/sites');
      }
    }
  }, [sites, siteId, zoneId, fetchZonesBySite, router]);

  // Find the zone once zones are loaded
  useEffect(() => {
    if (zones.length > 0 && zoneId && site) {
      const zoneIdNum = parseInt(zoneId as string);
      const foundZone = zones.find(z => z.id === zoneIdNum && z.site_id === site.id);
      
      if (foundZone) {
        setZone(foundZone);
        fetchRoomsByZone(zoneIdNum);
      } else {
        router.push('/admin/sites');
      }
    }
  }, [zones, zoneId, site, fetchRoomsByZone, router]);

  // Filter rooms for this zone
  const zoneRooms = rooms.filter(room => room.zone_id === zone?.id);
  
  // Filter tasks for the currently editing room
  const roomTasks = tasks.filter(task => task.room_id === editingRoom?.id);

  const handleCreateRoom = async (roomData: RoomFormData) => {
    if (!zone) return;
    
    try {
      setFormLoading(true);
      await createRoom({ ...roomData, zone_id: zone.id });
      setMessage({ type: 'success', text: 'Room created successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create room' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateRoomField = async (roomId: number, field: 'name' | 'description', value: string) => {
    try {
      setFormLoading(true);
      await updateRoom(roomId, { [field]: value.trim() });
      setEditingRoomField(null);
      setEditingRoomValue('');
      setMessage({ type: 'success', text: 'Room updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update room' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleStartEditRoomField = (room: Room, field: 'name' | 'description') => {
    setEditingRoomField({ roomId: room.id, field });
    setEditingRoomValue(room[field] || '');
  };

  const handleCancelEditRoomField = () => {
    setEditingRoomField(null);
    setEditingRoomValue('');
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return;
    
    try {
      setFormLoading(true);
      await deleteRoom(deletingRoom.id);
      setDeletingRoom(null);
      setMessage({ type: 'success', text: 'Room deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete room' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddTasks = (room: Room) => {
    setEditingRoom(room);
    setShowTaskModal(true);
    fetchTasksByRoom(room.id);
  };

  const handleDeleteRoomClick = (room: Room) => {
    setDeletingRoom(room);
  };


  const handleCancelRoomDelete = () => {
    setDeletingRoom(null);
  };

  const handleCloseTaskModal = () => {
    setShowTaskModal(false);
    setEditingRoom(null);
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const handleCreateTask = async (taskData: TaskFormData) => {
    if (!editingRoom) return;
    
    try {
      setFormLoading(true);
      await createTask({ ...taskData, room_id: editingRoom.id });
      setShowTaskForm(false);
      setMessage({ type: 'success', text: 'Task created successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create task' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTask = async (taskData: Partial<TaskFormData>) => {
    if (!editingTask) return;
    
    try {
      setFormLoading(true);
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setShowTaskForm(false);
      setMessage({ type: 'success', text: 'Task updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update task' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTaskField = async (taskId: number, field: 'description' | 'task_description', value: string) => {
    try {
      setFormLoading(true);
      await updateTask(taskId, { [field]: value.trim() });
      setEditingTaskField(null);
      setEditingTaskValue('');
      setMessage({ type: 'success', text: 'Task updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update task' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleStartEditTaskField = (task: Task, field: 'description' | 'task_description') => {
    setEditingTaskField({ taskId: task.id, field });
    setEditingTaskValue(task[field] || '');
  };

  const handleCancelEditTaskField = () => {
    setEditingTaskField(null);
    setEditingTaskValue('');
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    
    try {
      setFormLoading(true);
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
      setMessage({ type: 'success', text: 'Task deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete task' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(false);
  };

  // Removed employee assignment handlers from this page

  const handleDeleteTaskClick = (task: Task) => {
    setDeletingTask(task);
  };

  const handleCancelTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleCancelTaskDelete = () => {
    setDeletingTask(null);
  };

  const handleSelectTemplate = (template: { name: string }) => {
    setMessage({ type: 'success', text: `Task created from template "${template.name}"!` });
    // Refresh tasks for the current room
    if (selectedRoomId) {
      fetchTasksByRoom(selectedRoomId);
    }
  };

  const handleUseRoomTemplate = async (templateId: number) => {
    if (!zone) return;
    
    try {
      setFormLoading(true);
      await createRoomFromTemplate(templateId, zone.id);
      setMessage({ type: 'success', text: t('room_template_used') });
      // Refresh rooms list
      fetchRoomsByZone(zone.id);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : t('operation_failed') });
    } finally {
      setFormLoading(false);
    }
  };

  const handleTemplateUpdated = () => {
    setMessage({ type: 'success', text: 'Template updated! Refreshing tasks...' });
    // Refresh tasks for the current room
    if (selectedRoomId) {
      fetchTasksByRoom(selectedRoomId);
    }
  };

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!site || !zone) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading zone...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Zone: {zone.name}</h1>
              <p className="mt-2 text-gray-600">
                Site: {site.name} • Manage rooms for this zone.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/admin/sites/${site.id}/edit`)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back to Zones
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('supabase.auth.token');
                  router.push('/login');
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
            <p className="text-sm font-medium">Room Error: {error}</p>
          </div>
        )}

        {tasksError && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
            <p className="text-sm font-medium">Task Error: {tasksError}</p>
          </div>
        )}

        {/* Tab Navigation - only Rooms */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rooms
              </button>
            </nav>
          </div>
        </div>

        {/* Action Buttons - Only show for rooms tab */}
        {activeTab === 'rooms' && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setShowRoomForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('create_room')}
            </button>
            <button
              onClick={() => setShowRoomTemplateSelector(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {t('add_template_room')}
            </button>
          </div>
        )}

        {/* Room Form Modal */}
        {showRoomForm && (
          <div className="mb-6">
            <RoomForm
              zones={[zone]}
              onSubmit={handleCreateRoom}
              onCancel={() => setShowRoomForm(false)}
              loading={formLoading}
              hideZoneSelector={true}
            />
          </div>
        )}


        {/* Main Content Area */}
        {activeTab === 'rooms' ? (
          <div className={`flex gap-6 ${showTaskModal ? 'h-[600px]' : ''}`}>
            {/* Rooms List - Collapses when task modal is open */}
            <div className={`${showTaskModal ? 'w-1/3' : 'w-full'} transition-all duration-300`}>
              <RoomList
                rooms={zoneRooms}
                onEdit={handleAddTasks}
                onDelete={handleDeleteRoomClick}
                loading={loading}
                editingRoomField={editingRoomField}
                editingRoomValue={editingRoomValue}
                onStartEditField={handleStartEditRoomField}
                onUpdateField={handleUpdateRoomField}
                onCancelEditField={handleCancelEditRoomField}
                onEditFieldChange={setEditingRoomValue}
                formLoading={formLoading}
              />
            </div>

          {/* Task Management Modal */}
          {showTaskModal && editingRoom && (
            <div className="w-2/3 bg-white border border-gray-200 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Manage Tasks: {editingRoom.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Room ID: {editingRoom.id}
                  </p>
                </div>
                <button
                  onClick={handleCloseTaskModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Task Form */}
              {showTaskForm && (
                <div className="mb-6">
                  <TaskForm
                    task={editingTask}
                    roomId={editingRoom.id}
                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                    onCancel={handleCancelTaskForm}
                    loading={formLoading}
                  />
                </div>
              )}

              {/* Task Actions */}
              {!showTaskForm && (
                <div className="mb-6">
                  <div className="flex">
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Create New Task
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoomId(editingRoom?.id || null);
                        setShowTemplateModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-2 rounded-r-md border-l border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Create from template"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Tasks List */}
                <TaskList
                  tasks={roomTasks}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTaskClick}
                  loading={tasksLoading}
                  editingTaskField={editingTaskField}
                  editingTaskValue={editingTaskValue}
                  onStartEditField={handleStartEditTaskField}
                  onUpdateField={handleUpdateTaskField}
                  onCancelEditField={handleCancelEditTaskField}
                  onEditFieldChange={setEditingTaskValue}
                  onReorder={reorderTasks}
                  formLoading={formLoading}
                />
            </div>
          )}
          </div>
        ) : null}

        {/* Delete Confirmation Modals */}
        <RoomDeleteModal
          room={deletingRoom}
          onConfirm={handleDeleteRoom}
          onCancel={handleCancelRoomDelete}
          loading={formLoading}
        />

        <TaskDeleteModal
          task={deletingTask}
          onConfirm={handleDeleteTask}
          onCancel={handleCancelTaskDelete}
          loading={formLoading}
        />

        {/* Template Modal */}
        {selectedRoomId && (
          <TemplateModal
            isOpen={showTemplateModal}
            onClose={() => setShowTemplateModal(false)}
            onSelectTemplate={handleSelectTemplate}
            roomId={selectedRoomId}
            onTemplateUpdated={handleTemplateUpdated}
          />
        )}

        {/* Room Template Selector */}
        {zone && (
          <RoomTemplateSelector
            isOpen={showRoomTemplateSelector}
            onClose={() => setShowRoomTemplateSelector(false)}
            onSelectTemplate={handleUseRoomTemplate}
            zoneId={zone.id}
          />
        )}
      </div>
    </div>
  );
}

// Force SSR to prevent NextRouter not mounted error during build
export async function getServerSideProps() {
  return { props: {} };
}
