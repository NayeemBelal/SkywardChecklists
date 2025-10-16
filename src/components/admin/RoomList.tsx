import React from 'react';
import { Room } from '@skyward/shared';

interface RoomListProps {
  rooms: Room[];
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  loading?: boolean;
  editingRoomField?: { roomId: number; field: 'name' | 'description' } | null;
  editingRoomValue?: string;
  onStartEditField?: (room: Room, field: 'name' | 'description') => void;
  onUpdateField?: (roomId: number, field: 'name' | 'description', value: string) => void;
  onCancelEditField?: () => void;
  onEditFieldChange?: (value: string) => void;
  formLoading?: boolean;
}

export function RoomList({ 
  rooms, 
  onEdit, 
  onDelete, 
  loading, 
  editingRoomField, 
  editingRoomValue, 
  onStartEditField, 
  onUpdateField, 
  onCancelEditField, 
  onEditFieldChange,
  formLoading 
}: RoomListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading rooms...</span>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No rooms found. Create your first room to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Zone ID
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rooms.map((room) => (
            <tr key={room.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {room.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {editingRoomField?.roomId === room.id && editingRoomField?.field === 'name' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingRoomValue || ''}
                      onChange={(e) => onEditFieldChange?.(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateField?.(room.id, 'name', editingRoomValue || '');
                        } else if (e.key === 'Escape') {
                          onCancelEditField?.();
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      disabled={formLoading}
                    />
                    <button
                      onClick={() => onUpdateField?.(room.id, 'name', editingRoomValue || '')}
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
                    <span className="font-medium">{room.name}</span>
                    <button
                      onClick={() => onStartEditField && onStartEditField(room, 'name')}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={formLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {editingRoomField?.roomId === room.id && editingRoomField?.field === 'description' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingRoomValue || ''}
                      onChange={(e) => onEditFieldChange?.(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateField?.(room.id, 'description', editingRoomValue || '');
                        } else if (e.key === 'Escape') {
                          onCancelEditField?.();
                        }
                      }}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      disabled={formLoading}
                    />
                    <button
                      onClick={() => onUpdateField?.(room.id, 'description', editingRoomValue || '')}
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
                    <span>{room.description || '-'}</span>
                    <button
                      onClick={() => onStartEditField && onStartEditField(room, 'description')}
                      className="text-gray-400 hover:text-gray-600"
                      disabled={formLoading}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {room.zone_id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(room)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Add Tasks
                </button>
                <button
                  onClick={() => onDelete(room)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
