import { describe, it, expect, beforeEach } from 'vitest';
import { loadMarkers, saveMarkers, addMarker, updateMarker, deleteMarker } from '../storage';
import type { MapMarker } from '../../types';

function makeMarker(overrides: Partial<MapMarker> = {}): MapMarker {
  return {
    id: 'test-1',
    type: 'terremoto',
    title: 'Test Marker',
    description: 'A test marker',
    lat: 10.4806,
    lng: -66.9036,
    severity: 'media',
    groups: [],
    supplies: [],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadMarkers', () => {
    it('returns empty array when localStorage is empty', () => {
      expect(loadMarkers()).toEqual([]);
    });

    it('parses markers from localStorage', () => {
      const markers = [makeMarker(), makeMarker({ id: 'test-2', title: 'Second' })];
      localStorage.setItem('mapa-terremoto-markers', JSON.stringify(markers));
      const loaded = loadMarkers();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].title).toBe('Test Marker');
      expect(loaded[1].title).toBe('Second');
    });

    it('returns empty array on corrupted JSON', () => {
      localStorage.setItem('mapa-terremoto-markers', '{invalid json');
      expect(loadMarkers()).toEqual([]);
    });
  });

  describe('saveMarkers', () => {
    it('saves markers to localStorage', () => {
      const markers = [makeMarker()];
      saveMarkers(markers);
      const stored = JSON.parse(localStorage.getItem('mapa-terremoto-markers') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('test-1');
    });
  });

  describe('addMarker', () => {
    it('adds a marker and returns updated list', () => {
      saveMarkers([makeMarker({ id: 'existing' })]);
      const newMarker = makeMarker({ id: 'new-one', title: 'New Zone' });
      const result = addMarker(newMarker);
      expect(result).toHaveLength(2);
      expect(result.find((m) => m.id === 'new-one')).toBeTruthy();
    });

    it('persists the new marker', () => {
      addMarker(makeMarker({ id: 'persisted' }));
      const loaded = loadMarkers();
      expect(loaded.find((m) => m.id === 'persisted')).toBeTruthy();
    });
  });

  describe('updateMarker', () => {
    it('updates an existing marker by id', () => {
      saveMarkers([makeMarker(), makeMarker({ id: 'test-2' })]);
      const updated = updateMarker(makeMarker({ id: 'test-2', title: 'Updated Title' }));
      const found = updated.find((m) => m.id === 'test-2');
      expect(found?.title).toBe('Updated Title');
    });

    it('touches updatedAt timestamp', () => {
      saveMarkers([makeMarker()]);
      const before = Date.now();
      const updated = updateMarker(makeMarker());
      const after = Date.now();
      const ts = new Date(updated[0].updatedAt).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('returns original list when id not found', () => {
      saveMarkers([makeMarker({ id: 'a' })]);
      const result = updateMarker(makeMarker({ id: 'nonexistent' }));
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });
  });

  describe('deleteMarker', () => {
    it('removes marker by id', () => {
      saveMarkers([makeMarker({ id: 'a' }), makeMarker({ id: 'b' })]);
      const result = deleteMarker('a');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('b');
    });

    it('returns empty array when last marker deleted', () => {
      saveMarkers([makeMarker({ id: 'only' })]);
      const result = deleteMarker('only');
      expect(result).toEqual([]);
    });
  });
});
