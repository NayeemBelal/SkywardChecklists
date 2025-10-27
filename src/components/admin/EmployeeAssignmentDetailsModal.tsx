import React, { useState } from 'react';
import type { EmployeeAssignmentHierarchy, EmployeeAssignmentDetails } from '@/types';

interface EmployeeAssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentHierarchy?: EmployeeAssignmentHierarchy | null;
  assignmentDetails?: EmployeeAssignmentDetails | null;
}

export const EmployeeAssignmentDetailsModal: React.FC<EmployeeAssignmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assignmentHierarchy,
  assignmentDetails
}) => {
  const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set());
  const [expandedZones, setExpandedZones] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const toggleSite = (siteId: number) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId);
    } else {
      newExpanded.add(siteId);
    }
    setExpandedSites(newExpanded);
  };

  const toggleZone = (zoneId: number) => {
    const newExpanded = new Set(expandedZones);
    if (newExpanded.has(zoneId)) {
      newExpanded.delete(zoneId);
    } else {
      newExpanded.add(zoneId);
    }
    setExpandedZones(newExpanded);
  };

  const expandAll = () => {
    if (assignmentHierarchy) {
      const allSiteIds = new Set(assignmentHierarchy.sites.map(s => s.site.id));
      const allZoneIds = new Set(
        assignmentHierarchy.sites.flatMap(s => s.zones.map(z => z.zone.id))
      );
      setExpandedSites(allSiteIds);
      setExpandedZones(allZoneIds);
    }
  };

  const collapseAll = () => {
    setExpandedSites(new Set());
    setExpandedZones(new Set());
  };

  // If old format is provided, show a simplified view
  if (assignmentDetails && !assignmentHierarchy) {
    const { employee, zone_assignments, room_assignments } = assignmentDetails;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Employee Assignment Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{employee.full_name}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Zone Assignments ({zone_assignments.length})</h4>
              {zone_assignments.length > 0 ? (
                <div className="space-y-2">
                  {zone_assignments.map((zone) => (
                    <div key={zone.id} className="p-3 bg-blue-50 rounded-md">
                      <div className="font-medium text-blue-900">{zone.name}</div>
                      {zone.description && <div className="text-sm text-blue-700 mt-1">{zone.description}</div>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">No zone assignments</p>}
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Room Assignments ({room_assignments.length})</h4>
              {room_assignments.length > 0 ? (
                <div className="space-y-2">
                  {room_assignments.map((room) => (
                    <div key={room.id} className="p-3 bg-green-50 rounded-md">
                      <div className="font-medium text-green-900">{room.name}</div>
                      {room.description && <div className="text-sm text-green-700 mt-1">{room.description}</div>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">No room assignments</p>}
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignmentHierarchy) return null;

  const { employee, sites } = assignmentHierarchy;

  // Calculate summary statistics
  const totalSites = sites.length;
  const directZoneCount = sites.reduce((sum, s) => sum + s.zones.filter(z => z.isDirectlyAssigned).length, 0);
  const totalRoomCount = sites.reduce((sum, s) => sum + s.zones.reduce((zSum, z) => zSum + z.rooms.length, 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Employee Assignment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Employee Name */}
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">{employee.full_name}</h3>
        </div>

        {/* Summary Card */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Assignment Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalSites}</div>
              <div className="text-xs text-gray-600">Site{totalSites !== 1 ? 's' : ''}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{directZoneCount}</div>
              <div className="text-xs text-gray-600">Zone{directZoneCount !== 1 ? 's' : ''} (Direct)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{totalRoomCount}</div>
              <div className="text-xs text-gray-600">Room{totalRoomCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Controls */}
        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={expandAll}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Expand All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
          >
            Collapse All
          </button>
        </div>

        {/* Hierarchical Tree View */}
        <div className="space-y-3">
          {sites.length > 0 ? (
            sites.map((siteData) => {
              const isExpanded = expandedSites.has(siteData.site.id);
              return (
                <div key={siteData.site.id} className="border border-gray-300 rounded-lg overflow-hidden">
                  {/* Site Header */}
                  <button
                    onClick={() => toggleSite(siteData.site.id)}
                    className="w-full p-4 bg-gray-100 hover:bg-gray-200 flex items-center justify-between focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-lg font-medium text-gray-900">🏢 {siteData.site.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{siteData.zones.length} zone{siteData.zones.length !== 1 ? 's' : ''}</span>
                  </button>

                  {/* Zones (when expanded) */}
                  {isExpanded && (
                    <div className="p-4 bg-white space-y-2">
                      {siteData.zones.map((zoneData) => {
                        const isZoneExpanded = expandedZones.has(zoneData.zone.id);
                        return (
                          <div key={zoneData.zone.id} className="border border-gray-200 rounded-md overflow-hidden">
                            {/* Zone Header */}
                            <button
                              onClick={() => toggleZone(zoneData.zone.id)}
                              className="w-full p-3 bg-blue-50 hover:bg-blue-100 flex items-center justify-between focus:outline-none"
                            >
                              <div className="flex items-center gap-2">
                                {zoneData.rooms.length > 0 && (
                                  <svg
                                    className={`w-4 h-4 text-blue-600 transition-transform ${isZoneExpanded ? 'transform rotate-90' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                )}
                                <span className="font-medium text-blue-900">📦 {zoneData.zone.name}</span>
                                {zoneData.isDirectlyAssigned && (
                                  <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                                    Direct
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-blue-700">
                                {zoneData.rooms.length} room{zoneData.rooms.length !== 1 ? 's' : ''}
                              </span>
                            </button>

                            {/* Rooms (when zone is expanded) */}
                            {isZoneExpanded && zoneData.rooms.length > 0 && (
                              <div className="p-3 bg-white space-y-2">
                                {zoneData.rooms.map((roomData) => (
                                  <div
                                    key={roomData.room.id}
                                    className="p-3 bg-green-50 rounded-md border border-green-200"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-green-900">🚪 {roomData.room.name}</span>
                                      {roomData.isDirectlyAssigned && (
                                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                                          Assigned
                                        </span>
                                      )}
                                    </div>
                                    {roomData.room.description && (
                                      <div className="text-sm text-green-700 mt-1">{roomData.room.description}</div>
                                    )}
                                    {roomData.tasks.length > 0 && (
                                      <div className="text-xs text-green-600 mt-1">
                                        {roomData.tasks.length} task{roomData.tasks.length !== 1 ? 's' : ''}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-8">No assignments found</p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
