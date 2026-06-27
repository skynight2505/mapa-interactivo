import type { RescueLink } from '../types';

const STORAGE_KEY = 'rescue_links';

export function loadAllLinks(): RescueLink[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return [];
}

export function saveAllLinks(links: RescueLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export function loadZoneLinks(zoneId: string): RescueLink[] {
  return loadAllLinks().filter((l) => l.zoneId === zoneId);
}
