import type { MapMarker } from '../types';
import { addNotification } from './notifications';

const USGS_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&orderby=time&limit=30';
const STORAGE_KEY = 'mapa-earthquake-events';

export interface EarthquakeEvent {
  id: string;
  magnitude: number;
  place: string;
  lat: number;
  lng: number;
  depth: number;
  time: number;
  url: string;
  detail: string;
  felt?: number;
  tsunami?: number;
  sig: number;
}

export interface EarthquakeData {
  events: EarthquakeEvent[];
  fetchedAt: number;
}

export async function fetchEarthquakes(): Promise<EarthquakeEvent[]> {
  try {
    const res = await fetch(USGS_URL);
    const data = await res.json();
    return (data.features || []).map((f: any) => ({
      id: f.id,
      magnitude: f.properties.mag,
      place: f.properties.place,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      depth: f.geometry.coordinates[2],
      time: f.properties.time,
      url: f.properties.url,
      detail: f.properties.detail,
      felt: f.properties.felt,
      tsunami: f.properties.tsunami,
      sig: f.properties.sig,
    }));
  } catch {
    return [];
  }
}

export function loadCachedEarthquakes(): EarthquakeEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data: EarthquakeData = JSON.parse(raw);
    const elapsed = Date.now() - data.fetchedAt;
    if (elapsed > 600000) return []; // Cache expires after 10 min
    return data.events;
  } catch {
    return [];
  }
}

export function cacheEarthquakes(events: EarthquakeEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ events, fetchedAt: Date.now() }));
}

let lastNotifTime = 0;

export function generateEarthquakeNotifications(events: EarthquakeEvent[]): void {
  const now = Date.now();
  // Only generate notifications once per hour
  if (now - lastNotifTime < 3600000) return;
  lastNotifTime = now;

  events.forEach((eq) => {
    if (eq.magnitude >= 6) {
      addNotification(
        'emergencia',
        `🌊 Terremoto M${eq.magnitude.toFixed(1)} - ¡ALERTA!`,
        `${eq.place}\nProfundidad: ${eq.depth.toFixed(0)} km | ${new Date(eq.time).toLocaleString('es-VE')}`,
        'critical',
        undefined,
        eq.place
      );
    } else if (eq.magnitude >= 5) {
      addNotification(
        'emergencia',
        `🌍 Terremoto M${eq.magnitude.toFixed(1)}`,
        `${eq.place}\nProfundidad: ${eq.depth.toFixed(0)} km`,
        'warning',
        undefined,
        eq.place
      );
    } else if (eq.magnitude >= 4.5) {
      addNotification(
        'actualizacion',
        `🔔 Sismo M${eq.magnitude.toFixed(1)}`,
        `${eq.place}`,
        'info',
        undefined,
        eq.place
      );
    }
  });
}

const VERIFIED_KEY = 'mapa-verified-eq-ids';

export function generateVerifiedMarkers(events: EarthquakeEvent[]): MapMarker[] {
  const existing = new Set<string>(JSON.parse(localStorage.getItem(VERIFIED_KEY) || '[]'));
  const markers: MapMarker[] = [];

  events.forEach((eq) => {
    if (eq.magnitude >= 6 && !existing.has(eq.id)) {
      const title = `🌊 Terremoto M${eq.magnitude.toFixed(1)}`;
      const parts = eq.place.split(', ');
      const location = parts.length > 1 ? parts.slice(0, 2).join(', ') : eq.place;
      markers.push({
        id: `verified-eq-${eq.id}`,
        type: 'terremoto',
        title,
        description: `${location}\nProfundidad: ${eq.depth.toFixed(0)} km | Magnitud: ${eq.magnitude.toFixed(1)}`,
        lat: eq.lat,
        lng: eq.lng,
        severity: eq.magnitude >= 7 ? 'critica' : 'alta',
        groups: [],
        supplies: [],
        isActive: true,
        createdAt: new Date(eq.time).toISOString(),
        updatedAt: new Date().toISOString(),
        verified: true,
        verifiedSource: 'USGS Earthquake Hazards Program',
      });
      existing.add(eq.id);
    }
  });

  if (markers.length > 0) {
    localStorage.setItem(VERIFIED_KEY, JSON.stringify([...existing]));
  }
  return markers;
}

export function getEarthquakeColor(mag: number): string {
  if (mag >= 6) return '#EF4444';
  if (mag >= 5) return '#F97316';
  if (mag >= 4.5) return '#EAB308';
  return '#22C55E';
}

export function getEarthquakeIcon(mag: number): string {
  if (mag >= 6) return '🔴';
  if (mag >= 5) return '🟠';
  return '🟡';
}
