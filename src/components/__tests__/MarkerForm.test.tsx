import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MarkerForm from '../MarkerForm';
import { I18nProvider } from '../../utils/i18n';
import type { MapMarker } from '../../types';

function makeMarker(overrides: Partial<MapMarker> = {}): MapMarker {
  return {
    id: 'edit-1',
    type: 'terremoto',
    title: 'Zona Editada',
    description: 'Descripción existente',
    lat: 10.5,
    lng: -66.5,
    severity: 'alta',
    terrain: 'urbano',
    groups: [],
    supplies: [],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderWithProviders(props: {
  marker?: MapMarker | null;
  defaultLat?: number;
  defaultLng?: number;
  onSave?: (m: MapMarker) => void;
  onClose?: () => void;
}) {
  const onSave = props.onSave || vi.fn();
  const onClose = props.onClose || vi.fn();
  return render(
    React.createElement(I18nProvider, null,
      React.createElement(MarkerForm, {
        marker: props.marker ?? null,
        defaultLat: props.defaultLat,
        defaultLng: props.defaultLng,
        onSave,
        onClose,
      })
    )
  );
}

describe('MarkerForm', () => {
  describe('Create mode', () => {
    it('renders create form with title', () => {
      renderWithProviders({});
      expect(screen.getByText('➕ Nueva Zona')).toBeDefined();
    });

    it('shows "Crear Zona" button in create mode', () => {
      renderWithProviders({});
      expect(screen.getByText('➕ Crear Zona')).toBeDefined();
    });

    it('allows typing title and description', () => {
      renderWithProviders({});
      const titleInput = screen.getByPlaceholderText('Nombre de la zona') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Nueva Zona Test' } });
      expect(titleInput.value).toBe('Nueva Zona Test');

      const descTextarea = screen.getByPlaceholderText('Describe la situación en esta zona...') as HTMLTextAreaElement;
      fireEvent.change(descTextarea, { target: { value: 'Descripción de prueba' } });
      expect(descTextarea.value).toBe('Descripción de prueba');
    });

    it('calls onSave with marker data on submit', () => {
      const onSave = vi.fn();
      renderWithProviders({ onSave });

      fireEvent.change(screen.getByPlaceholderText('Nombre de la zona'), { target: { value: 'Zona Nueva' } });
      fireEvent.change(screen.getByPlaceholderText('Describe la situación en esta zona...'), { target: { value: 'Descripción' } });

      fireEvent.click(screen.getByText('➕ Crear Zona'));

      expect(onSave).toHaveBeenCalledOnce();
      const saved = onSave.mock.calls[0][0] as MapMarker;
      expect(saved.title).toBe('Zona Nueva');
      expect(saved.description).toBe('Descripción');
      expect(saved.lat).toBe(10.4806);
      expect(saved.lng).toBe(-66.9036);
      expect(saved.type).toBe('terremoto');
    });

    it('does not submit when title is empty', () => {
      const onSave = vi.fn();
      renderWithProviders({ onSave });
      fireEvent.click(screen.getByText('➕ Crear Zona'));
      expect(onSave).not.toHaveBeenCalled();
    });

    it('calls onClose on cancel', () => {
      const onClose = vi.fn();
      renderWithProviders({ onClose });
      fireEvent.click(screen.getByText('Cancelar'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose on overlay click', () => {
      const onClose = vi.fn();
      renderWithProviders({ onClose });
      const overlay = document.querySelector('.modal-overlay');
      if (overlay) fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('Edit mode', () => {
    it('renders edit form with marker data', () => {
      const marker = makeMarker({
        title: 'Zona Existente',
        description: 'Descripción existente',
        severity: 'alta',
      });
      renderWithProviders({ marker });
      expect(screen.getByText('✏️ Editar Zona')).toBeDefined();
      expect(screen.getByText('💾 Guardar Cambios')).toBeDefined();

      const titleInput = screen.getByDisplayValue('Zona Existente') as HTMLInputElement;
      expect(titleInput.value).toBe('Zona Existente');
    });

    it('populates form fields from marker', () => {
      const marker = makeMarker({
        title: 'Test Zone',
        description: 'Test desc',
        severity: 'critica',
        lat: 11.0,
        lng: -67.0,
        isActive: false,
      });
      renderWithProviders({ marker });

      expect((screen.getByDisplayValue('Test Zone') as HTMLInputElement).value).toBe('Test Zone');
      expect((screen.getByDisplayValue('Test desc') as HTMLTextAreaElement).value).toBe('Test desc');
    });

    it('calls onSave with updated data', () => {
      const marker = makeMarker({ title: 'Original', lat: 10.0, lng: -66.0 });
      const onSave = vi.fn();
      renderWithProviders({ marker, onSave });

      const titleInput = screen.getByDisplayValue('Original') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      fireEvent.click(screen.getByText('💾 Guardar Cambios'));

      expect(onSave).toHaveBeenCalledOnce();
      const saved = onSave.mock.calls[0][0] as MapMarker;
      expect(saved.title).toBe('Updated Title');
      expect(saved.id).toBe(marker.id);
    });
  });

  describe('Groups and Supplies', () => {
    it('adds a group on button click', () => {
      renderWithProviders({});
      expect(document.querySelectorAll('[placeholder="Nombre del grupo"]')).toHaveLength(0);
      fireEvent.click(screen.getByText('➕ Agregar grupo'));
      expect(document.querySelectorAll('[placeholder="Nombre del grupo"]')).toHaveLength(1);
    });

    it('removes a group', () => {
      renderWithProviders({});
      fireEvent.click(screen.getByText('➕ Agregar grupo'));
      expect(document.querySelectorAll('[placeholder="Nombre del grupo"]')).toHaveLength(1);
      const removeBtn = document.querySelector('.form-array-remove');
      if (removeBtn) fireEvent.click(removeBtn);
      expect(document.querySelectorAll('[placeholder="Nombre del grupo"]')).toHaveLength(0);
    });

    it('adds a supply on button click', () => {
      renderWithProviders({});
      expect(document.querySelectorAll('[placeholder="Nombre del insumo"]')).toHaveLength(0);
      fireEvent.click(screen.getByText('➕ Agregar insumo'));
      expect(document.querySelectorAll('[placeholder="Nombre del insumo"]')).toHaveLength(1);
    });

    it('allows changing severity value', () => {
      renderWithProviders({});
      const severitySelect = screen.getByDisplayValue('🟡 Media') as HTMLSelectElement;
      expect(severitySelect).toBeDefined();
      fireEvent.change(severitySelect, { target: { value: 'critica' } });
      expect(screen.getByDisplayValue('🔴 Crítica')).toBeDefined();
    });

    it('pre-fills groups when editing', () => {
      const marker = makeMarker({
        groups: [
          { id: 'g1', name: 'Rescatistas Alpha', contact: '0414-111', memberCount: 8, arrivedAt: '' },
        ],
      });
      renderWithProviders({ marker });
      expect(screen.getByDisplayValue('Rescatistas Alpha')).toBeDefined();
      expect(screen.getByDisplayValue('0414-111')).toBeDefined();
    });

    it('pre-fills supplies when editing', () => {
      const marker = makeMarker({
        supplies: [
          { id: 's1', name: 'Botiquín', quantity: 5, unit: 'unidades', status: 'needed' },
        ],
      });
      renderWithProviders({ marker });
      expect(screen.getByDisplayValue('Botiquín')).toBeDefined();
      expect(screen.getByDisplayValue('5')).toBeDefined();
    });
  });

  describe('Coordinates', () => {
    it('uses default coordinates for new markers', () => {
      renderWithProviders({ defaultLat: 11.5, defaultLng: -68.0 });
      expect(screen.getByDisplayValue('11.5')).toBeDefined();
      expect(screen.getByDisplayValue('-68')).toBeDefined();
    });

    it('uses marker coordinates when editing', () => {
      const marker = makeMarker({ lat: 9.5, lng: -70.5 });
      renderWithProviders({ marker });
      expect(screen.getByDisplayValue('9.5')).toBeDefined();
      expect(screen.getByDisplayValue('-70.5')).toBeDefined();
    });
  });
});
