import type { MapMarker } from '../types';
import { fetchCloudMarkers, saveCloudMarkers } from './api';

const STORAGE_KEY = 'mapa-terremoto-markers';

// ===== LOCAL STORAGE =====
function loadLocal(): MapMarker[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocal(markers: MapMarker[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
  } catch {
    // ignore
  }
}

// ===== CLOUD SYNC =====
let syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSync(markers: MapMarker[]) {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    saveCloudMarkers(markers);
  }, 2000);
}

// ===== PUBLIC API =====
export function loadMarkers(): MapMarker[] {
  return loadLocal();
}

export function saveMarkers(markers: MapMarker[]): void {
  saveLocal(markers);
  scheduleSync(markers);
}

export function addMarker(marker: MapMarker): MapMarker[] {
  const markers = loadLocal();
  markers.push(marker);
  saveMarkers(markers);
  return markers;
}

export function updateMarker(updated: MapMarker): MapMarker[] {
  const markers = loadLocal();
  const index = markers.findIndex((m) => m.id === updated.id);
  if (index !== -1) {
    markers[index] = { ...updated, updatedAt: new Date().toISOString() };
    saveMarkers(markers);
  }
  return markers;
}

export function deleteMarker(id: string): MapMarker[] {
  const markers = loadLocal().filter((m) => m.id !== id);
  saveMarkers(markers);
  return markers;
}

export async function tryLoadFromCloud(): Promise<MapMarker[] | null> {
  try {
    const cloud = await fetchCloudMarkers();
    if (cloud && cloud.length > 0) {
      saveLocal(cloud);
      return cloud;
    }
  } catch {
    // fallback to localStorage
  }
  return null;
}
