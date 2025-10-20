import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Site, Zone } from '@/types';
import { useSites } from '@/hooks/useSites';
import { useZones } from '@/hooks/useZones';
import { ZoneList } from '@/components/admin/ZoneList';
import { ZoneForm } from '@/components/admin/ZoneForm';
import { ZoneDeleteModal } from '@/components/admin/ZoneDeleteModal';
import { ZoneFormData } from '@/services/zoneService';

export default function EditSitePage() {
  const router = useRouter();
  const { id } = router.query;
  const { sites } = useSites();
  const { zones, loading, error, createZone, updateZone, deleteZone, fetchZonesBySite } = useZones();
  
  const [site, setSite] = useState<Site | null>(null);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check authentication on page load
  useEffect(() => {
    const token = localStorage.getItem('supabase.auth.token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Find the site when sites are loaded
  useEffect(() => {
    if (sites.length > 0 && id) {
      const siteId = parseInt(id as string);
      const foundSite = sites.find(s => s.id === siteId);
      if (foundSite) {
        setSite(foundSite);
        fetchZonesBySite(siteId);
      } else {
        router.push('/admin/sites');
      }
    }
  }, [sites, id, fetchZonesBySite, router]);

  // Filter zones for this site
  const siteZones = zones.filter(zone => zone.site_id === site?.id);

  const handleCreateZone = async (zoneData: ZoneFormData) => {
    if (!site) return;
    
    try {
      setFormLoading(true);
      await createZone({ ...zoneData, site_id: site.id });
      setShowZoneForm(false);
      setMessage({ type: 'success', text: 'Zone created successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to create zone' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateZone = async (zoneData: Partial<ZoneFormData>) => {
    if (!editingZone) return;
    
    try {
      setFormLoading(true);
      await updateZone(editingZone.id, zoneData);
      setEditingZone(null);
      setMessage({ type: 'success', text: 'Zone updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update zone' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteZone = async () => {
    if (!deletingZone) return;
    
    try {
      setFormLoading(true);
      await deleteZone(deletingZone.id);
      setDeletingZone(null);
      setMessage({ type: 'success', text: 'Zone deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete zone' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditZone = (zone: Zone) => {
    router.push(`/admin/sites/${site?.id}/zones/${zone.id}/edit`);
  };

  const handleDeleteClick = (zone: Zone) => {
    setDeletingZone(zone);
  };

  const handleCancelForm = () => {
    setShowZoneForm(false);
    setEditingZone(null);
  };

  const handleCancelDelete = () => {
    setDeletingZone(null);
  };

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!site) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading site...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Site: {site.name}</h1>
              <p className="mt-2 text-gray-600">
                Manage zones for this site location.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/sites')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Back to Sites
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
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setShowZoneForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Zone
          </button>
        </div>

        {/* Zone Form Modal */}
        {showZoneForm && (
          <div className="mb-6">
            <ZoneForm
              sites={[site]}
              onSubmit={handleCreateZone}
              onCancel={handleCancelForm}
              loading={formLoading}
              hideSiteSelector={true}
            />
          </div>
        )}

        {/* Edit Zone Form Modal */}
        {editingZone && (
          <div className="mb-6">
            <ZoneForm
              zone={editingZone}
              sites={[site]}
              onSubmit={handleUpdateZone}
              onCancel={handleCancelForm}
              loading={formLoading}
              hideSiteSelector={true}
            />
          </div>
        )}

        {/* Zones List */}
        <ZoneList
          zones={siteZones}
          onEdit={handleEditZone}
          onDelete={handleDeleteClick}
          loading={loading}
        />

        {/* Delete Confirmation Modal */}
        <ZoneDeleteModal
          zone={deletingZone}
          onConfirm={handleDeleteZone}
          onCancel={handleCancelDelete}
          loading={formLoading}
        />
      </div>
    </div>
  );
}

// Force SSR to prevent NextRouter not mounted error during build
export async function getServerSideProps() {
  return { props: {} };
}
