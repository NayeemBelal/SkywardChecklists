import React from 'react';
import { Zone } from '@/types';

interface ZoneSelectorProps {
  zones: Zone[];
  selectedZoneId: number | null;
  onZoneChange: (zoneId: number | null) => void;
  loading?: boolean;
}

export function ZoneSelector({ zones, selectedZoneId, onZoneChange, loading }: ZoneSelectorProps) {
  return (
    <div className="mb-6">
      <label htmlFor="zone-selector" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Zone
      </label>
      <select
        id="zone-selector"
        value={selectedZoneId || ''}
        onChange={(e) => onZoneChange(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        disabled={loading}
      >
        <option value="">All Zones</option>
        {zones.map((zone) => (
          <option key={zone.id} value={zone.id}>
            {zone.name}
          </option>
        ))}
      </select>
    </div>
  );
}
