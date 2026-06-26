import type { MapMarker } from '../types';

const STORAGE_KEY = 'mapa-terremoto-markers';

export function loadMarkers(): MapMarker[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error('Error loading markers from localStorage');
    return [];
  }
}

export function saveMarkers(markers: MapMarker[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(markers));
  } catch (error) {
    console.error('Error saving markers to localStorage:', error);
  }
}

export function addMarker(marker: MapMarker): MapMarker[] {
  const markers = loadMarkers();
  markers.push(marker);
  saveMarkers(markers);
  return markers;
}

export function updateMarker(updated: MapMarker): MapMarker[] {
  const markers = loadMarkers();
  const index = markers.findIndex((m) => m.id === updated.id);
  if (index !== -1) {
    markers[index] = { ...updated, updatedAt: new Date().toISOString() };
    saveMarkers(markers);
  }
  return markers;
}

export function deleteMarker(id: string): MapMarker[] {
  const markers = loadMarkers().filter((m) => m.id !== id);
  saveMarkers(markers);
  return markers;
}
