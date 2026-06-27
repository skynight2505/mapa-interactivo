import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Sidebar from '../Sidebar';
import { I18nProvider } from '../../utils/i18n';
import type { MapMarker } from '../../types';

function makeMarker(id: string, title: string, overrides: Partial<MapMarker> = {}): MapMarker {
  return {
    id,
    type: 'terremoto',
    title,
    description: `Descripción de ${title}`,
    lat: 10.0,
    lng: -66.0,
    severity: 'media',
    groups: [],
    supplies: [],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const defaultProps: {
  selectedId: string | null;
  onSelect: (m: import('../../types').MapMarker) => void;
  onDelete: (id: string) => void;
  onEdit: (m: import('../../types').MapMarker) => void;
  isEditMode: boolean;
  userCanEdit: boolean;
  userCanDelete: boolean;
  userCanAdd: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAddNew: () => void;
} = {
  selectedId: null,
  onSelect: vi.fn(),
  onDelete: vi.fn(),
  onEdit: vi.fn(),
  isEditMode: false,
  userCanEdit: false,
  userCanDelete: false,
  userCanAdd: false,
  collapsed: false,
  onToggleCollapse: vi.fn(),
  onAddNew: vi.fn(),
};

function renderWithProviders(markers: MapMarker[] = [], props: Partial<typeof defaultProps> = {}) {
  return render(
    React.createElement(I18nProvider, null,
      React.createElement(Sidebar, { markers, ...defaultProps, ...props })
    )
  );
}

describe('Sidebar', () => {
  it('shows empty state when no markers', () => {
    renderWithProviders([]);
    expect(screen.getByText('No hay zonas registradas')).toBeDefined();
  });

  it('renders marker list', () => {
    const markers = [makeMarker('1', 'Zona A'), makeMarker('2', 'Zona B')];
    renderWithProviders(markers);
    expect(screen.getByText('Zona A')).toBeDefined();
    expect(screen.getByText('Zona B')).toBeDefined();
    expect(screen.getByText('Mostrando 2 de 2 zonas')).toBeDefined();
  });

  it('highlights selected marker', () => {
    const markers = [makeMarker('1', 'Zona A'), makeMarker('2', 'Zona B')];
    renderWithProviders(markers, { selectedId: '1' });
    const cards = document.querySelectorAll('.marker-card');
    expect(cards[0].className).toContain('selected');
    expect(cards[1].className).not.toContain('selected');
  });

  it('calls onSelect when clicking a marker', () => {
    const onSelect = vi.fn();
    const markers = [makeMarker('1', 'Zona A')];
    renderWithProviders(markers, { onSelect });
    fireEvent.click(screen.getByText('Zona A'));
    expect(onSelect).toHaveBeenCalledWith(markers[0]);
  });

  it('search input accepts user typing', () => {
    const markers = [makeMarker('1', 'Zona A')];
    renderWithProviders(markers);

    const searchInput = screen.getByPlaceholderText('Buscar zonas...') as HTMLInputElement;
    expect(searchInput.value).toBe('');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput.value).toBe('test');
  });

  it('shows edit/delete buttons only in edit mode', () => {
    const markers = [makeMarker('1', 'Zona A')];
    const { rerender } = renderWithProviders(markers);
    // No buttons without edit mode
    expect(document.querySelectorAll('.marker-card-actions')).toHaveLength(0);

    // With edit mode and admin rights
    const el = React.createElement(I18nProvider, null,
      React.createElement(Sidebar, {
        markers,
        ...defaultProps,
        isEditMode: true,
        userCanEdit: true,
        userCanDelete: true,
      })
    );
    rerender(el);
    // Buttons should appear
    const actions = document.querySelector('.marker-card-actions');
    expect(actions).not.toBeNull();
  });

  it('shows collapsed state', () => {
    const markers = [makeMarker('1', 'Zona A')];
    renderWithProviders(markers, { collapsed: true });
    expect(document.querySelector('.sidebar.collapsed')).not.toBeNull();
    expect(screen.getByText('▶')).toBeDefined();
  });

  it('shows expanded state', () => {
    renderWithProviders([]);
    expect(screen.getByText('◀')).toBeDefined();
  });

  it('calls onToggleCollapse on toggle click', () => {
    const onToggleCollapse = vi.fn();
    renderWithProviders([], { onToggleCollapse });
    fireEvent.click(screen.getByText('◀'));
    expect(onToggleCollapse).toHaveBeenCalledOnce();
  });

  it('shows add button when userCanAdd', () => {
    renderWithProviders([], { userCanAdd: true });
    expect(screen.getByText('➕ Agregar nueva zona')).toBeDefined();
  });

  it('hides add button when user cannot add', () => {
    renderWithProviders([], { userCanAdd: false });
    expect(screen.queryByText('➕ Agregar nueva zona')).toBeNull();
  });

  it('shows group count badge', () => {
    const markers = [makeMarker('1', 'Zona A', {
      groups: [{ id: 'g1', name: 'Grupo 1', contact: '123', memberCount: 5, arrivedAt: '' }],
    })];
    renderWithProviders(markers);
    expect(screen.getByText('👥 1')).toBeDefined();
  });

  it('shows supplies count badge', () => {
    const markers = [makeMarker('1', 'Zona A', {
      supplies: [{ id: 's1', name: 'Agua', quantity: 10, unit: 'bot', status: 'needed' }],
    })];
    renderWithProviders(markers);
    expect(screen.getByText('📦 1')).toBeDefined();
  });

  it('shows severity badge', () => {
    const markers = [makeMarker('1', 'Zona A', { severity: 'critica' })];
    renderWithProviders(markers);
    expect(screen.getByText('critica')).toBeDefined();
  });
});
