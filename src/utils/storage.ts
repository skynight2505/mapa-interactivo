import type { MapMarker, RescuedPerson, GroupZone } from '../types';
import { fetchCloudMarkers, saveCloudMarkers, fetchCloudRescuedPersons, saveCloudRescuedPersons, fetchCloudGroupZones, saveCloudGroupZones } from './api';

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
let _cloudOk = false;
let _kvBound = false;

export function isCloudConnected(): boolean { return _cloudOk; }
export function isKVBound(): boolean { return _kvBound; }

function scheduleSync(markers: MapMarker[]) {
  const maxRetries = 3;
  let attempt = 0;
  const doSync = async () => {
    const result = await saveCloudMarkers(markers);
    _cloudOk = result.ok;
    _kvBound = result.kv;
    if (!result.ok && attempt < maxRetries) {
      attempt++;
      setTimeout(doSync, 5000);
    }
  };
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(doSync, 2000);
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
      _cloudOk = true;
      return cloud;
    }
    _cloudOk = false;
  } catch {
    _cloudOk = false;
  }
  return null;
}

export async function forceSyncToCloud(): Promise<boolean> {
  const local = loadLocal();
  if (local.length === 0) return false;
  const result = await saveCloudMarkers(local);
  _cloudOk = result.ok;
  _kvBound = result.kv;
  return result.ok;
}

export function clearMarkers(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ===== RESCUED PERSONS SYNC =====
const RESCUED_KEY = 'rescued_persons';

function loadRescuedLocal(): RescuedPerson[] {
  try {
    const data = localStorage.getItem(RESCUED_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRescuedLocal(persons: RescuedPerson[]): void {
  try {
    localStorage.setItem(RESCUED_KEY, JSON.stringify(persons));
  } catch {
    // ignore
  }
}

let rescuedSyncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRescuedSync(persons: RescuedPerson[]) {
  const maxRetries = 3;
  let attempt = 0;
  const doSync = async () => {
    const result = await saveCloudRescuedPersons(persons);
    if (!result.ok && attempt < maxRetries) {
      attempt++;
      setTimeout(doSync, 5000);
    }
  };
  if (rescuedSyncTimer) clearTimeout(rescuedSyncTimer);
  rescuedSyncTimer = setTimeout(doSync, 2000);
}

export function saveRescuedPersons(persons: RescuedPerson[]): void {
  saveRescuedLocal(persons);
  scheduleRescuedSync(persons);
}

export async function tryLoadRescuedFromCloud(): Promise<RescuedPerson[] | null> {
  try {
    const cloud = await fetchCloudRescuedPersons();
    if (cloud && cloud.length > 0) {
      saveRescuedLocal(cloud);
      return cloud;
    }
  } catch {
    // fallback to localStorage
  }
  return null;
}

export async function forceRescuedSyncToCloud(): Promise<boolean> {
  const local = loadRescuedLocal();
  if (local.length === 0) return false;
  const result = await saveCloudRescuedPersons(local);
  return result.ok;
}

// ===== GROUP ZONES =====
const GROUP_ZONE_KEY = 'mapa-group-zones';

function loadGroupZonesLocal(): GroupZone[] {
  try {
    const data = localStorage.getItem(GROUP_ZONE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGroupZonesLocal(zones: GroupZone[]): void {
  try {
    localStorage.setItem(GROUP_ZONE_KEY, JSON.stringify(zones));
  } catch {
    // ignore
  }
}

export function getAllGroupZones(): GroupZone[] {
  return loadGroupZonesLocal();
}

export function addGroupZone(zone: GroupZone): GroupZone[] {
  const zones = loadGroupZonesLocal();
  zones.push(zone);
  saveGroupZonesLocal(zones);
  scheduleGroupSync(zones);
  return zones;
}

export function updateGroupZone(zone: GroupZone): GroupZone[] {
  const zones = loadGroupZonesLocal();
  const idx = zones.findIndex(z => z.id === zone.id);
  if (idx !== -1) {
    zones[idx] = { ...zone, updatedAt: new Date().toISOString() };
    saveGroupZonesLocal(zones);
    scheduleGroupSync(zones);
  }
  return zones;
}

export function deleteGroupZone(id: string): GroupZone[] {
  const zones = loadGroupZonesLocal().filter(z => z.id !== id);
  saveGroupZonesLocal(zones);
  scheduleGroupSync(zones);
  return zones;
}

let groupSyncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleGroupSync(zones: GroupZone[]) {
  const maxRetries = 3;
  let attempt = 0;
  const doSync = async () => {
    const result = await saveCloudGroupZones(zones);
    if (!result.ok && attempt < maxRetries) {
      attempt++;
      setTimeout(doSync, 5000);
    }
  };
  if (groupSyncTimer) clearTimeout(groupSyncTimer);
  groupSyncTimer = setTimeout(doSync, 2000);
}

export async function tryLoadGroupZonesFromCloud(): Promise<GroupZone[] | null> {
  try {
    const cloud = await fetchCloudGroupZones();
    if (cloud && cloud.length > 0) {
      saveGroupZonesLocal(cloud);
      return cloud;
    }
  } catch {
    // fallback to localStorage
  }
  return null;
}

export async function forceGroupSyncToCloud(): Promise<boolean> {
  const local = loadGroupZonesLocal();
  if (local.length === 0) return false;
  const result = await saveCloudGroupZones(local);
  return result.ok;
}
