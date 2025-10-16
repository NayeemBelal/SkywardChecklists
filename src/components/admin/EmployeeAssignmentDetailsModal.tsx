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
  const [selectedSiteIndex, setSelectedSiteIndex] = useState<number | null>(null);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number | null>(null);

  if (!isOpen) return null;
  
  // If old format is provided, show a simplified view
  if (assignmentDetails && !assignmentHierarchy) {
    const { employee, zone_assignments, room_assignments, task_assignments } = assignmentDetails;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
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
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Task Assignments ({task_assignments.length})</h4>
              {task_assignments.length > 0 ? (
                <div className="space-y-2">
                  {task_assignments.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium text-gray-900">{task.description}</div>
                      {task.task_description && <div className="text-sm text-gray-600 mt-1">{task.task_description}</div>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 text-sm">No task assignments</p>}
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

  const handleBack = () => {
    if (selectedZoneIndex !== null) {
      setSelectedZoneIndex(null);
    } else if (selectedSiteIndex !== null) {
      setSelectedSiteIndex(null);
    }
  };

  const handleClose = () => {
    setSelectedSiteIndex(null);
    setSelectedZoneIndex(null);
    onClose();
  };

  // Get current view data
  const currentSite = selectedSiteIndex !== null ? sites[selectedSiteIndex] : null;
  const currentZone = currentSite && selectedZoneIndex !== null ? currentSite.zones[selectedZoneIndex] : null;

  // Determine breadcrumb
  const breadcrumb = [];
  if (selectedSiteIndex !== null) {
    breadcrumb.push(currentSite!.site.name);
  }
  if (selectedZoneIndex !== null) {
    breadcrumb.push(currentZone!.zone.name);
  }

  // Natural numeric compare helper
  const naturalCompare = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Employee Assignment Details</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {employee.full_name}
          </h3>
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="mb-4 flex items-center space-x-2">
            <button
              onClick={handleBack}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back
            </button>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">{breadcrumb.join(' > ')}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Show Sites (initial view) */}
          {selectedSiteIndex === null && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">
                Assigned Sites ({sites.length})
              </h4>
              {sites.length > 0 ? (
                <div className="space-y-2">
                  {sites.map((siteData: typeof sites[0], index: number) => (
                    <button
                      key={siteData.site.id}
                      onClick={() => setSelectedSiteIndex(index)}
                      className="w-full p-4 bg-blue-50 rounded-md hover:bg-blue-100 text-left transition-colors"
                    >
                      <div className="font-medium text-blue-900">{siteData.site.name}</div>
                      <div className="text-sm text-blue-700 mt-1">
                        {siteData.zones.length} zone{siteData.zones.length !== 1 ? 's' : ''} assigned
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No site assignments</p>
              )}
            </div>
          )}

          {/* Show Zones for selected site */}
          {selectedSiteIndex !== null && selectedZoneIndex === null && currentSite && (
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">
                Zones in {currentSite.site.name} ({currentSite.zones.length})
              </h4>
              {currentSite.zones.length > 0 ? (
                <div className="space-y-2">
                  {currentSite.zones.map((zoneData: typeof currentSite.zones[0], index: number) => (
                    <button
                      key={zoneData.zone.id}
                      onClick={() => setSelectedZoneIndex(index)}
                      className="w-full p-4 bg-green-50 rounded-md hover:bg-green-100 text-left transition-colors"
                    >
                      <div className="font-medium text-green-900">{zoneData.zone.name}</div>
                      {zoneData.zone.description && (
                        <div className="text-sm text-green-700 mt-1">{zoneData.zone.description}</div>
                      )}
                      <div className="text-sm text-green-700 mt-1">
                        {zoneData.rooms.length} room{zoneData.rooms.length !== 1 ? 's' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No zones in this site</p>
              )}
            </div>
          )}

          {/* Show Rooms and Tasks for selected zone (like checklist view) */}
          {selectedZoneIndex !== null && currentZone && (
            <div>
              {currentZone.rooms.length > 0 ? (
                <div className="space-y-6">
                  {(() => {
                    // Sort rooms by numeric order of their names
                    const sortedRooms = [...currentZone.rooms].sort((r1, r2) => 
                      naturalCompare(r1.room.name, r2.room.name)
                    );

                    return sortedRooms.map((roomData: typeof currentZone.rooms[0]) => (
                      <div key={roomData.room.id}>
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">
                          Room: {roomData.room.name}
                        </h5>
                        {roomData.room.description && (
                          <p className="text-sm text-gray-600 mb-2">{roomData.room.description}</p>
                        )}
                        {roomData.tasks.length > 0 ? (
                          <ol className="list-decimal pl-5 space-y-2">
                            {roomData.tasks.map((task: typeof roomData.tasks[0]) => (
                              <li
                                key={task.id}
                                className="border border-gray-200 rounded-md p-3 marker:text-gray-700"
                              >
                                <div className="text-gray-900 font-medium">{task.description}</div>
                                {task.task_description && (
                                  <div className="text-sm text-gray-600 mt-1">{task.task_description}</div>
                                )}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-gray-500 text-sm">No tasks in this room</p>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No rooms in this zone</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
