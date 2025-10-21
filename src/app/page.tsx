"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'; // Initialize i18n
import { useEmployeeInterface } from '@/hooks/useEmployeeInterface';
import { SiteSelector } from '@/components/employee/SiteSelector';
import { EmployeeSelector } from '@/components/employee/EmployeeSelector';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { sites, employees, selectedSite, setSelectedSite, loading, error } = useEmployeeInterface();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check auth status only on client after mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    setAdminLoggedIn(Boolean(localStorage.getItem('supabase.auth.token')));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Top navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex justify-between items-center">
          <LanguageSwitcher />
          {mounted && (
            <button
              onClick={() => router.push(adminLoggedIn ? '/admin/sites' : '/login')}
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {adminLoggedIn ? t('dashboard') : t('admin') + ' ' + t('login')}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('employee_access')}</h1>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('site')}</label>
            <SiteSelector
              sites={sites}
              selectedSite={selectedSite}
              onChange={(id) => {
                setSelectedSite(id);
                setSelectedEmployee(null);
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('employee')}</label>
            <EmployeeSelector
              employees={employees}
              selectedEmployee={selectedEmployee}
              onChange={setSelectedEmployee}
              disabled={loading || !selectedSite}
            />
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (selectedSite && selectedEmployee) {
                  router.push(`/checklist?siteId=${selectedSite}&employeeId=${selectedEmployee}`);
                }
              }}
              disabled={!selectedSite || !selectedEmployee}
              aria-disabled={!selectedSite || !selectedEmployee}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              {t('submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
