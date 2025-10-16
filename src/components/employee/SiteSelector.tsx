import React from 'react';
import { Site } from '@/types';

interface Props {
  sites: Pick<Site, 'id' | 'name'>[];
  selectedSite: number | null;
  onChange: (siteId: number | null) => void;
  disabled?: boolean;
}

export function SiteSelector({ sites, selectedSite, onChange, disabled }: Props) {
  return (
    <select
      className="w-full h-11 border border-gray-300 rounded-md px-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      value={selectedSite ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
    >
      <option value="">Select a site</option>
      {sites.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}


