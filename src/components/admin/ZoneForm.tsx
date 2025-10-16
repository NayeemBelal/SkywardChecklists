import React, { useState, useEffect } from 'react';
import { Zone } from '@skyward/shared';
import { ZoneFormData } from '@/services/zoneService';

interface ZoneFormProps {
  zone?: Zone | null;
  sites: Array<{ id: number; name: string }>;
  onSubmit: (zone: ZoneFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  hideSiteSelector?: boolean;
}

export function ZoneForm({ zone, sites, onSubmit, onCancel, loading, hideSiteSelector = false }: ZoneFormProps) {
  const [formData, setFormData] = useState({
    site_id: 0,
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (zone) {
      setFormData({
        site_id: zone.site_id,
        name: zone.name,
        description: zone.description || '',
      });
    } else {
      setFormData({
        site_id: hideSiteSelector && sites.length > 0 ? sites[0].id : 0,
        name: '',
        description: '',
      });
    }
    setErrors({});
  }, [zone, hideSiteSelector, sites]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!hideSiteSelector && !formData.site_id) {
      newErrors.site_id = 'Site is required';
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
        site_id: formData.site_id,
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
      [name]: name === 'site_id' ? parseInt(value) || 0 : value,
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
        {zone ? 'Edit Zone' : 'Create New Zone'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!hideSiteSelector && (
          <div>
            <label htmlFor="site_id" className="block text-sm font-medium text-gray-700 mb-1">
              Site
            </label>
            <select
              id="site_id"
              name="site_id"
              value={formData.site_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                errors.site_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value={0}>Select a site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            {errors.site_id && (
              <p className="mt-1 text-sm text-red-600">{errors.site_id}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Zone Name
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
            placeholder="Enter zone name"
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
            placeholder="Enter zone description"
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
            {loading ? 'Saving...' : (zone ? 'Update Zone' : 'Create Zone')}
          </button>
        </div>
      </form>
    </div>
  );
}
