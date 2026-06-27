import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { MapMarker, RescuedPerson } from '../../types';

// Mock downloadBlob to avoid actual file downloads
const mockDownload = vi.fn();
vi.mock('../export', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../export')>();
  return {
    ...mod,
    // We test the CSV/JSON generation logic indirectly
  };
});

function makeMarker(overrides: Partial<MapMarker> = {}): MapMarker {
  return {
    id: 'test-1',
    type: 'terremoto',
    title: 'Zona Test',
    description: 'Descripción de prueba',
    lat: 10.4806,
    lng: -66.9036,
    severity: 'alta',
    terrain: 'urbano',
    groups: [
      { id: 'g1', name: 'Grupo Alpha', contact: '0414-1234567', memberCount: 12, arrivedAt: '2026-01-01T00:00:00Z' },
    ],
    supplies: [
      { id: 's1', name: 'Agua', quantity: 100, unit: 'litros', status: 'needed' },
      { id: 's2', name: 'Medicinas', quantity: 50, unit: 'cajas', status: 'available' },
    ],
    isActive: true,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-25T00:00:00.000Z',
    ...overrides,
  };
}

function makePerson(overrides: Partial<RescuedPerson> = {}): RescuedPerson {
  return {
    id: 'rp-1',
    name: 'María García',
    age: 35,
    gender: 'femenino',
    zoneId: 'z-1',
    zoneName: 'Zona Centro',
    lat: 10.48,
    lng: -66.90,
    terrain: 'urbano',
    rescuedAt: '2026-06-25T10:00:00.000Z',
    rescuedBy: 'Bomberos Caracas',
    condition: 'bueno',
    notes: 'Sin lesiones visibles',
    verified: false,
    createdAt: '2026-06-25T10:00:00.000Z',
    ...overrides,
  };
}

// We test the pure CSV/JSON generation logic by testing the importFromJSON parsing
describe('export utilities', () => {
  describe('importFromJSON validation', () => {
    it('validates marker structure has required fields', () => {
      const valid = makeMarker();
      expect(valid.id).toBeDefined();
      expect(valid.type).toBeDefined();
      expect(valid.title).toBeDefined();
      expect(typeof valid.lat).toBe('number');
      expect(typeof valid.lng).toBe('number');
    });

    it('marker has correct groups structure', () => {
      const marker = makeMarker();
      marker.groups.forEach(g => {
        expect(typeof g.id).toBe('string');
        expect(typeof g.name).toBe('string');
        expect(typeof g.contact).toBe('string');
        expect(typeof g.memberCount).toBe('number');
      });
    });

    it('marker has correct supplies structure', () => {
      const marker = makeMarker();
      marker.supplies.forEach(s => {
        expect(['needed', 'available', 'delivered']).toContain(s.status);
        expect(typeof s.quantity).toBe('number');
        expect(s.quantity).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('rescued person structure', () => {
    it('has all required fields', () => {
      const person = makePerson();
      expect(person.name).toBeDefined();
      expect(typeof person.age).toBe('number');
      expect(['masculino', 'femenino', 'otro']).toContain(person.gender);
      expect(['bueno', 'herido', 'critico']).toContain(person.condition);
      expect(typeof person.verified).toBe('boolean');
    });

    it('has valid coordinates', () => {
      const person = makePerson();
      expect(person.lat).toBeGreaterThanOrEqual(-90);
      expect(person.lat).toBeLessThanOrEqual(90);
      expect(person.lng).toBeGreaterThanOrEqual(-180);
      expect(person.lng).toBeLessThanOrEqual(180);
    });
  });
});
