"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'; // Initialize i18n
import { employeeInterfaceService } from '@/services/employeeInterfaceService';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

interface Task {
  id: number;
  description: string;
  description_es: string | null;
  room: { id: number; name: string } | null;
  zone: { id: number; name: string } | null;
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
  const [openDesc, setOpenDesc] = useState<string | null>(null);

  // Load tasks
  useEffect(() => {
    if (!siteId || !employeeId) {
      router.replace('/');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await employeeInterfaceService.getTasksForEmployee(siteId, employeeId);
        setTasks(data);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <LanguageSwitcher />
          <h1 className="text-3xl font-bold text-gray-900">{t('checklist')}</h1>
          <button
            onClick={() => router.push('/')}
            className="h-10 bg-gray-700 hover:bg-gray-800 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {t('back')}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

              // Group tasks by room id
              const roomIdToTasks = new Map<number, typeof tasks>();
              const rooms: { id: number; name: string }[] = [];
              for (const t of tasks) {
                if (!t.room) continue;
                if (!roomIdToTasks.has(t.room.id)) {
                  roomIdToTasks.set(t.room.id, []);
                  rooms.push({ id: t.room.id, name: t.room.name });
                }
                roomIdToTasks.get(t.room.id)!.push(t);
              }

              // Sort rooms by numeric order of their names
              rooms.sort((r1, r2) => naturalCompare(r1.name, r2.name));

              return (
                <div className="space-y-6">
                  {rooms.map((room) => {
                      const roomTasks = (roomIdToTasks.get(room.id) || []).slice().sort((a, b) => a.id - b.id);
                      return (
                        <div key={room.id}>
                          <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('room')}: {room.name}</h2>
                          <ol className="list-decimal pl-5 space-y-3">
                            {roomTasks.map((task) => {
                              const displayDescription = getTaskDescription(task);
                              return (
                                <li
                                  key={task.id}
                                  className="border border-gray-200 rounded-md p-3 marker:text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => setOpenDesc(displayDescription)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenDesc(displayDescription); } }}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-gray-900 font-medium">
                                      {displayDescription}
                                    </div>
                                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                  })}
                </div>
              );
            })()
          )}
        </div>
      </div>

      {openDesc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-11/12 max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('task_description')}</h3>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{openDesc}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenDesc(null)}
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
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
