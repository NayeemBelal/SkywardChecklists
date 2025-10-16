import React, { useState, useEffect } from 'react';
import { Room } from '@skyward/shared';
import { RoomFormData } from '@/services/roomService';

interface RoomFormProps {
  room?: Room | null;
  zones: Array<{ id: number; name: string }>;
  onSubmit: (room: RoomFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  hideZoneSelector?: boolean;
}

export function RoomForm({ room, zones, onSubmit, onCancel, loading, hideZoneSelector = false }: RoomFormProps) {
  const [formData, setFormData] = useState({
    zone_id: 0,
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (room) {
      setFormData({
        zone_id: room.zone_id,
        name: room.name,
        description: room.description || '',
      });
    } else {
      setFormData({
        zone_id: hideZoneSelector && zones.length > 0 ? zones[0].id : 0,
        name: '',
        description: '',
      });
    }
    setErrors({});
  }, [room, hideZoneSelector, zones]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!hideZoneSelector && !formData.zone_id) {
      newErrors.zone_id = 'Zone is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 1) {
      newErrors.name = 'Name must be at least 1 character';
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
        zone_id: formData.zone_id,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });
    } catch {
      // Error handling is done in the parent component
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'zone_id' ? parseInt(value) || 0 : value,
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
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        {room ? 'Edit Room' : 'Create New Room'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!hideZoneSelector && (
          <div>
            <label htmlFor="zone_id" className="block text-sm font-medium text-gray-700 mb-1">
              Zone
            </label>
            <select
              id="zone_id"
              name="zone_id"
              value={formData.zone_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.zone_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value={0}>Select a zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
            {errors.zone_id && (
              <p className="mt-1 text-sm text-red-600">{errors.zone_id}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Room Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter room name"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Enter room description"
            disabled={loading}
          />
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
            {loading ? 'Saving...' : (room ? 'Update Room' : 'Create Room')}
          </button>
        </div>
      </form>
    </div>
  );
}
