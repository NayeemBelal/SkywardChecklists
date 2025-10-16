"use client";
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployeeInterface } from '@/hooks/useEmployeeInterface';
import { SiteSelector } from '@/components/employee/SiteSelector';
import { EmployeeSelector } from '@/components/employee/EmployeeSelector';

export default function Home() {
  const router = useRouter();
  const { sites, employees, selectedSite, setSelectedSite, loading, error } = useEmployeeInterface();
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  const adminLoggedIn = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(localStorage.getItem('supabase.auth.token'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Top-right admin/login button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex justify-end">
          <button
            onClick={() => router.push(adminLoggedIn ? '/admin/sites' : '/login')}
            className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {adminLoggedIn ? 'Go to Admin Dashboard' : 'Admin Login'}
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Employee Access</h1>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
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
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
