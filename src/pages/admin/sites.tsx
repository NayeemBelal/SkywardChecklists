import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Site, SiteFormData, Zone, Employee, EmployeeAssignmentHierarchy } from '@/types';
import { useSites } from '@/hooks/useSites';
import { useZones } from '@/hooks/useZones';
import { useEmployeeAssignments } from '@/hooks/useEmployeeAssignments';
import { SiteList } from '@/components/admin/SiteList';
import { SiteForm } from '@/components/admin/SiteForm';
import { SiteDeleteModal } from '@/components/admin/SiteDeleteModal';
import { EmployeeTab } from '@/components/admin/EmployeeTab';
import { EmployeeSearchBar } from '@/components/admin/EmployeeSearchBar';
import { EmployeeAssignmentDetailsModal } from '@/components/admin/EmployeeAssignmentDetailsModal';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function SitesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sites, loading, error, createSite, deleteSite } = useSites();
  const [showForm, setShowForm] = useState(false);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'sites' | 'employees'>('sites');
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showZoneSelector, setShowZoneSelector] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [topSearchResults, setTopSearchResults] = useState<Employee[]>([]);
  const [topSearchLoading, setTopSearchLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmployeeHierarchy, setSelectedEmployeeHierarchy] = useState<EmployeeAssignmentHierarchy | null>(null);
  
  // Employee assignment hooks
  const {
    assignEmployeeToZone,
    removeEmployeeFromZone,
    getEmployeesWithZoneAssignmentStatus,
    getEmployeeAssignments,
    getEmployeeAssignmentHierarchy,
    searchEmployees
  } = useEmployeeAssignments();

  // Zones hook for the selected site
  const { zones: siteZones, loading: zonesLoading, fetchZonesBySite } = useZones();

  // Check authentication on page load
  useEffect(() => {
    const token = localStorage.getItem('supabase.auth.token');
    setIsAuthenticated(Boolean(token));
  }, [router]);

  const handleCreateSite = async (siteData: SiteFormData) => {
    try {
      setFormLoading(true);
      await createSite(siteData);
      setShowForm(false);
      setMessage({ type: 'success', text: t('site_created') });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : t('operation_failed') });
    } finally {
      setFormLoading(false);
    }
  };


  const handleDeleteSite = async () => {
    if (!deletingSite) return;
    
    try {
      setFormLoading(true);
      await deleteSite(deletingSite.id);
      setDeletingSite(null);
      setMessage({ type: 'success', text: t('site_deleted') });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : t('operation_failed') });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSite = (site: Site) => {
    router.push(`/admin/sites/${site.id}/edit`);
  };

  const handleDeleteClick = (site: Site) => {
    setDeletingSite(site);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleCancelDelete = () => {
    setDeletingSite(null);
  };

  // Employee assignment handlers
  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
    setSelectedZone(null);
    setShowZoneSelector(true);
    setActiveTab('employees');
    // Fetch zones for the selected site
    fetchZonesBySite(site.id);
  };

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleBackToSites = () => {
    setSelectedSite(null);
    setSelectedZone(null);
    setShowZoneSelector(false);
  };

  // Stable callback functions for EmployeeTab to prevent infinite re-renders
  const handleGetAllEmployeesWithAssignmentStatus = useCallback(async (assignedPage: number = 1, unassignedPage: number = 1, pageSize: number = 10) => {
    if (!selectedSite || !selectedZone) return { 
      assigned: [], 
      unassigned: [], 
      assignedTotal: 0, 
      unassignedTotal: 0, 
      assignedTotalPages: 1, 
      unassignedTotalPages: 1, 
      assignedCurrentPage: 1, 
      unassignedCurrentPage: 1 
    };
    return await getEmployeesWithZoneAssignmentStatus(selectedZone.id, assignedPage, unassignedPage, pageSize);
  }, [getEmployeesWithZoneAssignmentStatus, selectedSite, selectedZone]);

  const handleGetEmployeeDetails = useCallback(async (employeeId: number) => {
    return await getEmployeeAssignments(employeeId);
  }, [getEmployeeAssignments]);

  const handleSearchEmployees = useCallback(async (query: string) => {
    return await searchEmployees(query);
  }, [searchEmployees]);

  const handleTopSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTopSearchResults([]);
      return;
    }
    try {
      setTopSearchLoading(true);
      const results = await handleSearchEmployees(query);
      setTopSearchResults(results);
    } catch {
      setTopSearchResults([]);
    } finally {
      setTopSearchLoading(false);
    }
  }, [handleSearchEmployees]);

  const handleTopViewDetails = async (employee: Employee) => {
    try {
      const hierarchy = await getEmployeeAssignmentHierarchy(employee.id);
      setSelectedEmployeeHierarchy(hierarchy);
      setIsDetailsModalOpen(true);
    } catch {
      setMessage({ type: 'error', text: t('operation_failed') });
    }
  };

  // Clear message after 5 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // If backend returns auth error message, show unauthenticated UI
  const showUnauthenticated = !isAuthenticated || error === 'Log in to see admin dashboard.';

  if (showUnauthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => router.push('/')}
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Employee View
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage client locations and their associated data.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
              <p className="text-sm font-medium">Log in to see admin dashboard.</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <LanguageSwitcher />
            <button
              onClick={() => router.push('/')}
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('employee')} View
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
            <p className="mt-2 text-gray-600">Manage client locations and their associated data.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
              <p className="text-sm font-medium">{t('login')} to see admin dashboard.</p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('login')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <LanguageSwitcher />
          <button
            onClick={() => router.push('/')}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('employee')} View
          </button>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('sites')} Management</h1>
          <p className="mt-2 text-gray-600">
            Manage client locations and their associated data.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('sites')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sites'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('sites')}
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('employee')} {t('assign_employees')}
              </button>
            </nav>
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
            <p className="text-sm font-medium">{t('error')}: {error}</p>
          </div>
        )}

        {/* Action Buttons - Only show for sites tab */}
        {activeTab === 'sites' && (
          <div className="mb-6 flex justify-between items-center">
            <div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('create_site')}
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  localStorage.removeItem('supabase.auth.token');
                  router.push('/login');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        )}

        {/* Employee Assignment Selector */}
        {activeTab === 'employees' && (
          <>
            {/* Search bar for viewing employee details */}
            <div className="mb-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('search_employees')}</h3>
              <EmployeeSearchBar
                employees={topSearchResults}
                onSearch={handleTopSearch}
                onSelectEmployee={handleTopViewDetails}
                placeholder={t('search_employees') + '...'}
              />
              {topSearchLoading && (
                <div className="mt-2 text-sm text-gray-500">{t('loading')}</div>
              )}
            </div>

            <div className="mb-6">
              <div className="bg-white rounded-lg shadow p-6">
              {!showZoneSelector ? (
                /* Site Selector */
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{t('select_site')} for {t('assign_employees')}</h3>
                  {sites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sites.map((site) => (
                        <button
                          key={site.id}
                          onClick={() => handleSiteSelect(site)}
                          className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <h4 className="font-medium text-gray-900">{site.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{t('site')} ID: {site.id}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">{t('no_sites')}. {t('create_site')} first to manage employee assignments.</p>
                  )}
                </>
              ) : (
                /* Zone Selector */
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('select_zone')} in {selectedSite?.name}
                    </h3>
                    <button
                      onClick={handleBackToSites}
                      className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                    >
                      ← {t('back')} to {t('sites')}
                    </button>
                  </div>
                  {zonesLoading ? (
                    <p className="text-gray-500">{t('loading')}</p>
                  ) : siteZones.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {siteZones.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={() => handleZoneSelect(zone)}
                          className={`p-4 border rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            selectedZone?.id === zone.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300'
                          }`}
                        >
                          <h4 className="font-medium text-gray-900">{zone.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {zone.description || t('no_data_available')}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">{t('no_zones')} for this site. {t('create_zone')} first to manage employee assignments.</p>
                  )}
                </>
              )}
            </div>
          </div>
          </>
        )}

        {/* Form Modal */}
        {showForm && activeTab === 'sites' && (
          <div className="mb-6">
            <SiteForm
              onSubmit={handleCreateSite}
              onCancel={handleCancelForm}
              loading={formLoading}
            />
          </div>
        )}

        {/* Main Content Area */}
        {activeTab === 'sites' ? (
          /* Sites List */
          <SiteList
            sites={sites}
            onEdit={handleEditSite}
            onDelete={handleDeleteClick}
            loading={loading}
          />
        ) : (
          /* Employee Management Tab */
          <div className="w-full">
            {selectedSite && selectedZone ? (
              <EmployeeTab
                siteId={selectedSite.id}
                assignmentType="zone"
                targetId={selectedZone.id}
                targetName={selectedZone.name}
                hideSearch={true}
                onAssignEmployee={async (employeeId: number) => {
                  try {
                    await assignEmployeeToZone(employeeId, selectedZone.id);
                    setMessage({ type: 'success', text: t('employee_assigned') });
                  } catch {
                    setMessage({ type: 'error', text: t('operation_failed') });
                  }
                }}
                onRemoveEmployee={async (employeeId: number) => {
                  try {
                    await removeEmployeeFromZone(employeeId, selectedZone.id);
                    setMessage({ type: 'success', text: t('employee_unassigned') });
                  } catch {
                    setMessage({ type: 'error', text: t('operation_failed') });
                  }
                }}
                onGetAllEmployeesWithAssignmentStatus={handleGetAllEmployeesWithAssignmentStatus}
                onGetEmployeeDetails={handleGetEmployeeDetails}
                onSearchEmployees={handleSearchEmployees}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500 text-center">
                  {!selectedSite 
                    ? t('select_site') + " above to manage employee assignments."
                    : !selectedZone 
                    ? t('select_zone') + " above to manage employee assignments."
                    : t('loading')
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <SiteDeleteModal
          site={deletingSite}
          onConfirm={handleDeleteSite}
          onCancel={handleCancelDelete}
          loading={formLoading}
        />

        {/* Employee Details Modal (from top search) */}
        <EmployeeAssignmentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => { setIsDetailsModalOpen(false); setSelectedEmployeeHierarchy(null); }}
          assignmentHierarchy={selectedEmployeeHierarchy}
        />
      </div>
    </div>
  );
}

// Force SSR to prevent NextRouter not mounted error during build
export async function getServerSideProps() {
  return { props: {} };
}
