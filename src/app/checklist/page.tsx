"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'; // Initialize i18n
import { employeeInterfaceService } from '@/services/employeeInterfaceService';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { FloorplanViewer } from '@/components/employee/FloorplanViewer';
import { ZoneFloorplanModal } from '@/components/employee/ZoneFloorplanModal';

interface Task {
  id: number;
  description: string;
  description_es: string | null;
  task_description: string | null;
  task_description_es: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | null;
  room: { id: number; name: string } | null;
  zone: { id: number; name: string } | null;
}

interface Floorplan {
  id: number;
  site_id: number;
  image_path: string;
  created_at: string;
  public_url: string;
}

interface ZoneFloorplan {
  id: number;
  zone_id: number;
  image_path: string;
  created_at: string;
  public_url: string;
}

interface ZoneGroup {
  zone: { id: number; name: string };
  rooms: RoomGroup[];
}

interface RoomGroup {
  room: { id: number; name: string };
  tasks: Task[];
}

function ChecklistContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const siteIdParam = params?.get('siteId');
  const employeeIdParam = params?.get('employeeId');
  const siteId = siteIdParam ? Number(siteIdParam) : null;
  const employeeId = employeeIdParam ? Number(employeeIdParam) : null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [floorplans, setFloorplans] = useState<Floorplan[]>([]);
  const [zoneFloorplans, setZoneFloorplans] = useState<Map<number, ZoneFloorplan[]>>(new Map());
  const [selectedZoneFloorplan, setSelectedZoneFloorplan] = useState<{ zoneName: string; floorplans: ZoneFloorplan[] } | null>(null);

  // Load tasks and floorplans
  useEffect(() => {
    if (!siteId || !employeeId) {
      router.replace('/');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch both tasks and floorplans in parallel
        const [tasksData, floorplansData] = await Promise.all([
          employeeInterfaceService.getTasksForEmployee(siteId, employeeId),
          employeeInterfaceService.getSiteFloorplan(siteId).catch(() => []) // Silently fail if no floorplans
        ]);
        setTasks(tasksData);
        setFloorplans(floorplansData);

        // Extract unique zone IDs from tasks
        const zoneIds = Array.from(new Set(tasksData.map(task => task.zone?.id).filter((id): id is number => id !== null && id !== undefined)));

        // Fetch zone floorplans if we have zones
        if (zoneIds.length > 0) {
          const zoneFloorplansData = await employeeInterfaceService.getZoneFloorplans(zoneIds).catch(() => []);
          const zoneFloorplansMap = new Map<number, ZoneFloorplan[]>();
          zoneFloorplansData.forEach(item => {
            if (item.floorplans.length > 0) {
              zoneFloorplansMap.set(item.zoneId, item.floorplans);
            }
          });
          setZoneFloorplans(zoneFloorplansMap);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, [siteId, employeeId, router]);

  // Get the appropriate description based on current language
  const getTaskDescription = (task: Task): string => {
    if (i18n.language === 'es' && task.description_es) {
      return task.description_es;
    }
    return task.description;
  };

  // Get the appropriate task_description based on current language
  const getTaskDetailDescription = (task: Task): string | null => {
    if (!task.task_description) return null;
    if (i18n.language === 'es' && task.task_description_es) {
      return task.task_description_es;
    }
    return task.task_description;
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedZoneFloorplan) {
        setSelectedZoneFloorplan(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedZoneFloorplan]);

  return (
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex-shrink-0 h-9 bg-gray-700 hover:bg-gray-800 text-white font-medium px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm whitespace-nowrap"
          >
            {t('back')}
          </button>
          <h1 className="flex-1 text-center text-xl sm:text-2xl font-bold text-gray-900 truncate px-2">{t('checklist')}</h1>
          <LanguageSwitcher />
        </div>

        {/* Floorplan Viewer - Shows above the checklist */}
        {!loading && floorplans.length > 0 && (
          <FloorplanViewer floorplans={floorplans} />
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          {loading && <p className="text-gray-600">{t('loading')}</p>}
          {error && !loading && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
          )}
          {!loading && !error && tasks.length === 0 && (
            <p className="text-gray-600">{t('no_tasks')} for this employee at this site.</p>
          )}
          {!loading && !error && tasks.length > 0 && (
            (() => {
              // Natural numeric compare helper
              const naturalCompare = (a: string, b: string) => {
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
              };

              // Group tasks by Zone → Room hierarchy
              const zoneMap = new Map<number, ZoneGroup>();

              for (const task of tasks) {
                if (!task.zone || !task.room) continue;

                // Get or create zone group
                let zoneGroup = zoneMap.get(task.zone.id);
                if (!zoneGroup) {
                  zoneGroup = {
                    zone: task.zone,
                    rooms: []
                  };
                  zoneMap.set(task.zone.id, zoneGroup);
                }

                // Get or create room group within zone
                let roomGroup = zoneGroup.rooms.find(r => r.room.id === task.room!.id);
                if (!roomGroup) {
                  roomGroup = {
                    room: task.room,
                    tasks: []
                  };
                  zoneGroup.rooms.push(roomGroup);
                }

                // Add task to room
                roomGroup.tasks.push(task);
              }

              // Convert to sorted array
              const zones = Array.from(zoneMap.values());
              zones.sort((a, b) => naturalCompare(a.zone.name, b.zone.name));

              // Sort rooms within each zone
              zones.forEach(zone => {
                zone.rooms.sort((a, b) => naturalCompare(a.room.name, b.room.name));
                // Sort tasks within each room
                zone.rooms.forEach(room => {
                  room.tasks.sort((a, b) => a.id - b.id);
                });
              });

              // Zone color schemes for visual distinction
              const zoneColors = [
                { bg: 'bg-blue-600', text: 'text-white', lightBg: 'bg-blue-50' },
                { bg: 'bg-emerald-600', text: 'text-white', lightBg: 'bg-emerald-50' },
                { bg: 'bg-purple-600', text: 'text-white', lightBg: 'bg-purple-50' },
                { bg: 'bg-orange-600', text: 'text-white', lightBg: 'bg-orange-50' },
                { bg: 'bg-pink-600', text: 'text-white', lightBg: 'bg-pink-50' },
              ];

              return (
                <div className="space-y-3 sm:space-y-4">
                  {zones.map((zoneGroup, zoneIndex) => {
                    const colorScheme = zoneColors[zoneIndex % zoneColors.length];
                    return (
                      <div key={zoneGroup.zone.id} className="rounded-lg overflow-hidden shadow-md">
                        {/* Zone Header */}
                        <div className={`${colorScheme.bg} ${colorScheme.text} px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between`}>
                          <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-bold">
                              {zoneGroup.zone.name}
                            </h2>
                            <p className="text-xs sm:text-sm opacity-90 mt-0.5">
                              {zoneGroup.rooms.length} {zoneGroup.rooms.length === 1 ? t('room') : 'Rooms'}
                            </p>
                          </div>

                          {/* Zone Floorplan Thumbnail */}
                          {zoneFloorplans.has(zoneGroup.zone.id) && (() => {
                            const floorplans = zoneFloorplans.get(zoneGroup.zone.id) || [];
                            const firstFloorplan = floorplans[0];
                            return (
                              <button
                                onClick={() => setSelectedZoneFloorplan({
                                  zoneName: zoneGroup.zone.name,
                                  floorplans: floorplans
                                })}
                                className="flex-shrink-0 ml-3 group relative"
                                aria-label={`View ${zoneGroup.zone.name} floor plan`}
                                title={`View ${zoneGroup.zone.name} floor plan`}
                              >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 border-white/40 group-hover:border-white/80 transition-all shadow-lg group-hover:shadow-xl group-focus:ring-2 group-focus:ring-white/50">
                                  <img
                                    src={firstFloorplan.public_url}
                                    alt={`${zoneGroup.zone.name} thumbnail`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {floorplans.length > 1 && (
                                  <div className="absolute -bottom-1 -right-1 bg-white text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                    {floorplans.length}
                                  </div>
                                )}
                              </button>
                            );
                          })()}
                        </div>

                        {/* Rooms within Zone */}
                        <div className={`${colorScheme.lightBg} p-2 sm:p-3 space-y-2 sm:space-y-2.5`}>
                          {zoneGroup.rooms.map((roomGroup) => (
                            <div key={roomGroup.room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                              {/* Room Header */}
                              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                  {t('room')}: {roomGroup.room.name}
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                                  {roomGroup.tasks.length} {roomGroup.tasks.length === 1 ? 'task' : 'tasks'}
                                </p>
                              </div>

                              {/* Tasks List */}
                              <div className="p-2 sm:p-3">
                                <div className="space-y-2">
                                  {roomGroup.tasks.map((task) => {
                                    const displayDescription = getTaskDescription(task);
                                    const displayTaskDescription = getTaskDetailDescription(task);
                                    return (
                                      <div key={task.id} className="border border-gray-200 rounded-md p-2.5 sm:p-3">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1 min-w-0 space-y-1">
                                            <p className="text-sm sm:text-base font-semibold text-gray-900 whitespace-pre-wrap break-words">
                                              {displayDescription}
                                            </p>
                                            {displayTaskDescription && (
                                              <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-wrap break-words">
                                                {displayTaskDescription}
                                              </p>
                                            )}
                                          </div>
                                          {task.frequency && (
                                            <div className="flex-shrink-0 pt-0.5">
                                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                                                task.frequency === 'daily' ? 'bg-blue-100 text-blue-800' :
                                                task.frequency === 'weekly' ? 'bg-green-100 text-green-800' :
                                                task.frequency === 'monthly' ? 'bg-purple-100 text-purple-800' : ''
                                              }`}>
                                                {t(task.frequency)}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}
        </div>

        {/* Zone Floorplan Modal */}
        {selectedZoneFloorplan && (
          <ZoneFloorplanModal
            zoneName={selectedZoneFloorplan.zoneName}
            floorplans={selectedZoneFloorplan.floorplans}
            isOpen={true}
            onClose={() => setSelectedZoneFloorplan(null)}
          />
        )}
      </div>
    </div>
  );
}

function ChecklistPageFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={<ChecklistPageFallback />}>
      <ChecklistContent />
    </Suspense>
  );
}
