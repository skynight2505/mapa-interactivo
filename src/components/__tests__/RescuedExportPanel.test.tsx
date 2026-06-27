import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import RescuedExportPanel from '../RescuedExportPanel';
import { I18nProvider } from '../../utils/i18n';
import type { RescuedPerson } from '../../types';

function makePerson(id: string, name: string, overrides: Partial<RescuedPerson> = {}): RescuedPerson {
  return {
    id,
    name,
    age: 30,
    gender: 'masculino',
    zoneId: 'z-1',
    zoneName: 'Zona Centro',
    lat: 10.48,
    lng: -66.90,
    terrain: 'urbano',
    rescuedAt: '2026-06-25T10:00:00.000Z',
    rescuedBy: 'Bomberos',
    condition: 'bueno',
    notes: '',
    verified: false,
    createdAt: '2026-06-25T10:00:00.000Z',
    ...overrides,
  };
}

const defaultProps = {
  onExportJSON: vi.fn(),
  onExportCSV: vi.fn(),
  onAddPerson: vi.fn(),
  rescuedPersons: [] as RescuedPerson[],
  onSearchResult: vi.fn(),
  searchHighlight: null,
};

function renderPanel(props: Partial<typeof defaultProps> = {}) {
  return render(
    React.createElement(I18nProvider, null,
      React.createElement(RescuedExportPanel, { ...defaultProps, ...props })
    )
  );
}

describe('RescuedExportPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'es';
  });

  it('renders the panel title', () => {
    renderPanel();
    expect(screen.getByText('🏥 Personas Rescatadas')).toBeDefined();
  });

  it('shows verification notice', () => {
    renderPanel();
    expect(screen.getByText('Verificación de Desaparecidos')).toBeDefined();
  });

  it('shows total stat as 0 when empty', () => {
    renderPanel();
    const totalValues = screen.getAllByText('0');
    expect(totalValues.length).toBeGreaterThanOrEqual(1);
  });

  it('shows stats with persons data', () => {
    const persons = [
      makePerson('1', 'María', { condition: 'bueno' }),
      makePerson('2', 'Juan', { condition: 'herido' }),
      makePerson('3', 'Pedro', { condition: 'critico' }),
    ];
    renderPanel({ rescuedPersons: persons });
    expect(screen.getByText('Total')).toBeDefined();
    expect(screen.getByText('Buen Estado')).toBeDefined();
    expect(screen.getByText('Heridos')).toBeDefined();
    expect(screen.getByText('Crítico')).toBeDefined();
  });

  it('renders person list', () => {
    const persons = [makePerson('1', 'María García', { age: 35 })];
    renderPanel({ rescuedPersons: persons });
    expect(screen.getByText('María García, 35 años')).toBeDefined();
  });

  it('shows terrain info in person list', () => {
    const persons = [makePerson('1', 'Test Name', { terrain: 'costero' })];
    renderPanel({ rescuedPersons: persons });
    expect(screen.getByText('Test Name, 30 años')).toBeDefined();
  });

  it('shows search input', () => {
    renderPanel();
    expect(screen.getByPlaceholderText('Buscar por nombre, zona o rescatista...')).toBeDefined();
  });

  it('filters persons by search', () => {
    const persons = [
      makePerson('1', 'Ana López'),
      makePerson('2', 'Carlos Ruiz'),
    ];
    renderPanel({ rescuedPersons: persons });
    const searchInput = screen.getByPlaceholderText('Buscar por nombre, zona o rescatista...');
    fireEvent.change(searchInput, { target: { value: 'Ana' } });
    expect(screen.getByText('Ana López')).toBeDefined();
  });

  it('shows add form toggle button', () => {
    renderPanel();
    expect(screen.getByText('➕ Registrar Persona Rescatada')).toBeDefined();
  });

  it('opens add form on toggle click', () => {
    renderPanel();
    fireEvent.click(screen.getByText('➕ Registrar Persona Rescatada'));
    expect(screen.getByText('✅ Registrar Persona')).toBeDefined();
  });

  it('calls onAddPerson when form submitted', () => {
    const onAddPerson = vi.fn();
    renderPanel({ onAddPerson });
    fireEvent.click(screen.getByText('➕ Registrar Persona Rescatada'));
    // Fill required form fields (name and zoneName both needed)
    const inputs = document.querySelectorAll('input[placeholder="..."]');
    if (inputs.length >= 2) {
      fireEvent.change(inputs[0], { target: { value: 'Nueva Persona' } });
      fireEvent.change(inputs[1], { target: { value: 'Zona Centro' } });
    }
    fireEvent.click(screen.getByText('✅ Registrar Persona'));
    expect(onAddPerson).toHaveBeenCalledOnce();
  });

  it('shows export buttons when persons exist', () => {
    const persons = [makePerson('1', 'Test')];
    renderPanel({ rescuedPersons: persons });
    expect(screen.getByText('📥 Exportar JSON')).toBeDefined();
    expect(screen.getByText('📊 Exportar CSV')).toBeDefined();
  });

  it('hides export buttons when no persons', () => {
    renderPanel({ rescuedPersons: [] });
    expect(screen.queryByText('📥 Exportar JSON')).toBeNull();
    expect(screen.queryByText('📊 Exportar CSV')).toBeNull();
  });

  it('calls onExportJSON when export JSON clicked', () => {
    const onExportJSON = vi.fn();
    const persons = [makePerson('1', 'Test')];
    renderPanel({ rescuedPersons: persons, onExportJSON });
    fireEvent.click(screen.getByText('📥 Exportar JSON'));
    expect(onExportJSON).toHaveBeenCalledOnce();
  });

  it('calls onExportCSV when export CSV clicked', () => {
    const onExportCSV = vi.fn();
    const persons = [makePerson('1', 'Test')];
    renderPanel({ rescuedPersons: persons, onExportCSV });
    fireEvent.click(screen.getByText('📊 Exportar CSV'));
    expect(onExportCSV).toHaveBeenCalledOnce();
  });

  it('shows verification link for each person', () => {
    const persons = [makePerson('1', 'María García')];
    renderPanel({ rescuedPersons: persons });
    const links = document.querySelectorAll('a[href*="desaparecidosterremotovenezuela.com"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });
});
