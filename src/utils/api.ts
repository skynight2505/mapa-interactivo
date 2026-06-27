import type { MapMarker } from '../types';

const API_BASE = '/api';

// Markers
export async function fetchCloudMarkers(): Promise<MapMarker[] | null> {
  try {
    const res = await fetch(`${API_BASE}/markers`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveCloudMarkers(markers: MapMarker[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/markers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(markers),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export type { }; // empty export to keep module
