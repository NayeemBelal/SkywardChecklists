'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Site } from '@/types';

interface SiteListProps {
  sites: Site[];
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
  loading?: boolean;
}

export function SiteList({ sites, onEdit, onDelete, loading }: SiteListProps) {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('loading')}</span>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('no_sites')}. {t('create_site')} to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('name')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sites.map((site) => (
            <tr key={site.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {site.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {site.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(site)}
                  className="text-blue-600 hover:text-blue-900 mr-3"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => onDelete(site)}
                  className="text-red-600 hover:text-red-900"
                >
                  {t('delete')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
