'use client';

import React, { useState, useEffect, useRef } from 'react';

interface FloorplanPanelProps {
  entityId: number;
  entityType: 'site' | 'zone';
  isOpen: boolean;
  onClose: () => void;
}

interface Floorplan {
  id: number;
  image_path: string;
  created_at: string;
  updated_at: string;
  public_url: string;
}

export function FloorplanPanel({ entityId, entityType, isOpen, onClose }: FloorplanPanelProps) {
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get auth token
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('supabase.auth.token');
  };

  // Get API endpoint based on entity type
  const getApiEndpoint = () => {
    return entityType === 'site'
      ? `/api/sites/${entityId}/floorplans`
      : `/api/zones/${entityId}/floorplans`;
  };

  // Fetch floorplans when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchFloorplans();
    }
  }, [isOpen, entityId, entityType]);

  const fetchFloorplans = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const response = await fetch(getApiEndpoint(), {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('supabase.auth.token');
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Failed to fetch floorplans');
      }

      const data = await response.json();
      setFloorplans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load floorplans');
      console.error('Error fetching floorplans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG, or JPEG images only.');
      return;
    }

    // Validate file size (10 MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 10 MB. Please upload a smaller image.');
      return;
    }

    await uploadFloorplan(file);
  };

  const uploadFloorplan = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      const token = getAuthToken();

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(getApiEndpoint(), {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('supabase.auth.token');
          throw new Error('Authentication failed. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload floorplan');
      }

      const newFloorplan = await response.json();
      setFloorplans(prev => [newFloorplan, ...prev]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload floorplan');
      console.error('Error uploading floorplan:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (floorplanId: number) => {
    if (!confirm('Are you sure you want to delete this floorplan?')) {
      return;
    }

    try {
      setError(null);
      const token = getAuthToken();

      const response = await fetch(`${getApiEndpoint()}?floorplanId=${floorplanId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('supabase.auth.token');
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error('Failed to delete floorplan');
      }

      setFloorplans(prev => prev.filter(f => f.id !== floorplanId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete floorplan');
      console.error('Error deleting floorplan:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Floorplans</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
              id="floorplan-upload"
            />
            <label
              htmlFor="floorplan-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Floorplan
                </>
              )}
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Upload PNG, JPG, or JPEG images up to 10 MB
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading floorplans...</span>
            </div>
          )}

          {/* Floorplans List */}
          {!loading && floorplans.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No floorplans uploaded yet</p>
            </div>
          )}

          {!loading && floorplans.length > 0 && (
            <div className="space-y-4">
              {floorplans.map((floorplan) => (
                <div
                  key={floorplan.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    {/* Thumbnail */}
                    <div
                      className="flex-shrink-0 w-32 h-32 cursor-pointer overflow-hidden rounded-md border border-gray-300"
                      onClick={() => setExpandedImage(floorplan.public_url)}
                    >
                      <img
                        src={floorplan.public_url}
                        alt="Floorplan thumbnail"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Info and Actions */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        Uploaded: {new Date(floorplan.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleDelete(floorplan.id)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={expandedImage}
              alt="Expanded floorplan"
              className="max-w-full max-h-screen object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
