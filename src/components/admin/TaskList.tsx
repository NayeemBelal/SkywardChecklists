import React, { useState } from 'react';
import { Task } from '@/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  loading?: boolean;
  editingTaskField?: { taskId: number; field: 'description' | 'task_description' } | null;
  editingTaskValue?: string;
  onStartEditField?: (task: Task, field: 'description' | 'task_description') => void;
  onUpdateField?: (taskId: number, field: 'description' | 'task_description', value: string) => void;
  onCancelEditField?: () => void;
  onEditFieldChange?: (value: string) => void;
  onReorder?: (taskIds: number[]) => void;
  formLoading?: boolean;
}

export function TaskList({ 
  tasks, 
  onEdit, 
  onDelete, 
  loading, 
  editingTaskField, 
  editingTaskValue, 
  onStartEditField, 
  onUpdateField, 
  onCancelEditField, 
  onEditFieldChange,
  onReorder,
  formLoading 
}: TaskListProps) {
  const [showDescription, setShowDescription] = useState<number | null>(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localTasks.findIndex((task) => task.id === active.id);
      const newIndex = localTasks.findIndex((task) => task.id === over.id);

      const newTasks = arrayMove(localTasks, oldIndex, newIndex);
      setLocalTasks(newTasks);
      
      if (onReorder) {
        onReorder(newTasks.map(task => task.id));
      }
    }
  };

  // Update local tasks when props change
  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading tasks...</span>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks found. Create your first task to get started.
      </div>
    );
  }

  return (
    <div className="relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 overflow-hidden">
            {localTasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                editingTaskField={editingTaskField}
                editingTaskValue={editingTaskValue}
                onStartEditField={onStartEditField}
                onUpdateField={onUpdateField}
                onCancelEditField={onCancelEditField}
                onEditFieldChange={onEditFieldChange}
                showDescription={showDescription}
                setShowDescription={setShowDescription}
                formLoading={formLoading}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableTaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  editingTaskField?: { taskId: number; field: 'description' | 'task_description' } | null;
  editingTaskValue?: string;
  onStartEditField?: (task: Task, field: 'description' | 'task_description') => void;
  onUpdateField?: (taskId: number, field: 'description' | 'task_description', value: string) => void;
  onCancelEditField?: () => void;
  onEditFieldChange?: (value: string) => void;
  showDescription: number | null;
  setShowDescription: (id: number | null) => void;
  formLoading?: boolean;
}

function SortableTaskItem({
  task,
  onDelete,
  editingTaskField,
  editingTaskValue,
  onStartEditField,
  onUpdateField,
  onCancelEditField,
  onEditFieldChange,
  showDescription,
  setShowDescription,
  formLoading
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {editingTaskField?.taskId === task.id && editingTaskField?.field === 'description' ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editingTaskValue || ''}
                onChange={(e) => onEditFieldChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onUpdateField?.(task.id, 'description', editingTaskValue || '');
                  } else if (e.key === 'Escape') {
                    onCancelEditField?.();
                  }
                }}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium text-gray-900"
                disabled={formLoading}
              />
              <button
                onClick={() => onUpdateField?.(task.id, 'description', editingTaskValue || '')}
                className="text-green-600 hover:text-green-800"
                disabled={formLoading}
              >
                ✓
              </button>
              <button
                onClick={() => onCancelEditField?.()}
                className="text-red-600 hover:text-red-800"
                disabled={formLoading}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 font-medium">{task.description}</p>
              {task.frequency && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  task.frequency === 'daily' ? 'bg-blue-100 text-blue-800' :
                  task.frequency === 'weekly' ? 'bg-green-100 text-green-800' :
                  task.frequency === 'monthly' ? 'bg-purple-100 text-purple-800' : ''
                }`}>
                  {task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
                </span>
              )}
              <button
                onClick={() => onStartEditField && onStartEditField(task, 'description')}
                className="text-gray-400 hover:text-gray-600"
                disabled={formLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Task Description */}
          <div className="mt-2">
            {editingTaskField?.taskId === task.id && editingTaskField?.field === 'task_description' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Task Description</label>
                <div className="flex items-start space-x-2">
                  <textarea
                    value={editingTaskValue || ''}
                    onChange={(e) => onEditFieldChange?.(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        onUpdateField?.(task.id, 'task_description', editingTaskValue || '');
                      } else if (e.key === 'Escape') {
                        onCancelEditField?.();
                      }
                    }}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm resize-none text-gray-900"
                    rows={3}
                    placeholder="Enter task description"
                    disabled={formLoading}
                  />
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => onUpdateField?.(task.id, 'task_description', editingTaskValue || '')}
                      className="text-green-600 hover:text-green-800"
                      disabled={formLoading}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => onCancelEditField?.()}
                      className="text-red-600 hover:text-red-800"
                      disabled={formLoading}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDescription(showDescription === task.id ? null : task.id)}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{task.task_description ? 'View Description' : 'Add Description'}</span>
                </button>
                {task.task_description && (
                  <button
                    onClick={() => onStartEditField && onStartEditField(task, 'task_description')}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={formLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            {showDescription === task.id && task.task_description && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-gray-700 flex-1">{task.task_description}</p>
                  <button
                    onClick={() => onStartEditField && onStartEditField(task, 'task_description')}
                    className="text-gray-400 hover:text-gray-600 ml-2"
                    disabled={formLoading}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            {...attributes}
            {...listeners}
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            disabled={formLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
