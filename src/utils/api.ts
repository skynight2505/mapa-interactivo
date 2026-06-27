import type { MapMarker } from '../types';

const API_BASE = '/api';

export async function fetchCloudMarkers(): Promise<MapMarker[] | null> {
  try {
    const res = await fetch(`${API_BASE}/markers`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveCloudMarkers(markers: MapMarker[]): Promise<{ ok: boolean; kv: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/markers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(markers),
    });
    if (!res.ok) return { ok: false, kv: false };
    const data = await res.json();
    return { ok: true, kv: data.kv === true };
  } catch {
    return { ok: false, kv: false };
  }
}
