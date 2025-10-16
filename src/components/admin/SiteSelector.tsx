import React from 'react';
import { Site } from '@skyward/shared';

interface SiteSelectorProps {
  sites: Site[];
  selectedSiteId: number | null;
  onSiteChange: (siteId: number | null) => void;
  loading?: boolean;
}

export function SiteSelector({ sites, selectedSiteId, onSiteChange, loading }: SiteSelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="site-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Site
      </label>
      <select
        id="site-selector"
        value={selectedSiteId || ''}
        onChange={(e) => onSiteChange(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        disabled={loading}
      >
        <option value="">All Sites</option>
        {sites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </select>
    </div>
  );
}
