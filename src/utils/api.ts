import type { MapMarker, RescuedPerson, GroupZone } from '../types';

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

export async function fetchCloudRescuedPersons(): Promise<RescuedPerson[] | null> {
  try {
    const res = await fetch(`${API_BASE}/rescued`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveCloudRescuedPersons(persons: RescuedPerson[]): Promise<{ ok: boolean; kv: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/rescued`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(persons),
    });
    if (!res.ok) return { ok: false, kv: false };
    const data = await res.json();
    return { ok: true, kv: data.kv === true };
  } catch {
    return { ok: false, kv: false };
  }
}

export async function fetchCloudGroupZones(): Promise<GroupZone[] | null> {
  try {
    const res = await fetch(`${API_BASE}/groups`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveCloudGroupZones(zones: GroupZone[]): Promise<{ ok: boolean; kv: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(zones),
    });
    if (!res.ok) return { ok: false, kv: false };
    const data = await res.json();
    return { ok: true, kv: data.kv === true };
  } catch {
    return { ok: false, kv: false };
  }
}
