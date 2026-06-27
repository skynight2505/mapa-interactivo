import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Header from '../Header';
import { I18nProvider } from '../../utils/i18n';
import type { User } from '../../utils/auth';

const defaultProps = {
  isEditMode: false,
  onToggleMode: vi.fn(),
  markerCount: 5,
  user: null as User | null,
  userCanEdit: false,
  onLoginClick: vi.fn(),
  onLogout: vi.fn(),
  onExportJSON: vi.fn(),
  onExportCSV: vi.fn(),
  onImportClick: vi.fn(),
  onRescuedClick: vi.fn(),
  isRescueMode: false,
  onToggleRescue: vi.fn(),
  onAdminClick: vi.fn(),
};

function renderHeader(props: Partial<typeof defaultProps> = {}) {
  return render(
    React.createElement(I18nProvider, null,
      React.createElement(Header, { ...defaultProps, ...props })
    )
  );
}

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'es';
  });

  it('renders app title', () => {
    renderHeader();
    expect(screen.getByText('Mapa Interactivo Terremoto Venezuela')).toBeDefined();
  });

  it('shows marker count', () => {
    renderHeader({ markerCount: 10 });
    expect(screen.getByText('10 zonas de emergencia')).toBeDefined();
  });

  it('shows login button when user is null', () => {
    renderHeader({ user: null });
    expect(screen.getByText('Entrar')).toBeDefined();
  });

  it('shows username and logout when user is logged in', () => {
    const user = { username: 'admin', role: 'admin' as const, displayName: 'Admin' };
    renderHeader({ user });
    expect(screen.getByText('Admin')).toBeDefined();
    expect(screen.getByText('Salir')).toBeDefined();
  });

  it('shows editor display name', () => {
    const user = { username: 'editor1', role: 'editor' as const, displayName: 'Editor Juan' };
    renderHeader({ user });
    expect(screen.getByText('Editor Juan')).toBeDefined();
  });

  it('calls onLoginClick when login button is clicked', () => {
    const onLoginClick = vi.fn();
    renderHeader({ user: null, onLoginClick });
    fireEvent.click(screen.getByText('Entrar'));
    expect(onLoginClick).toHaveBeenCalledOnce();
  });

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = vi.fn();
    const user = { username: 'admin', role: 'admin' as const, displayName: 'Admin' };
    renderHeader({ user, onLogout });
    fireEvent.click(screen.getByText('Salir'));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('shows edit mode text when in edit mode', () => {
    renderHeader({ isEditMode: true, userCanEdit: true });
    expect(screen.getByText('Edición')).toBeDefined();
  });

  it('shows view mode text when not in edit mode', () => {
    renderHeader({ isEditMode: false });
    expect(screen.getByText('Solo ver')).toBeDefined();
  });

  it('calls onToggleMode when edit/view button clicked', () => {
    const onToggleMode = vi.fn();
    renderHeader({ onToggleMode });
    fireEvent.click(screen.getByText('Solo ver'));
    expect(onToggleMode).toHaveBeenCalledOnce();
  });

  it('shows rescue mode button', () => {
    renderHeader();
    expect(screen.getByText('Rescatista')).toBeDefined();
  });

  it('calls onToggleRescue when rescue button clicked', () => {
    const onToggleRescue = vi.fn();
    renderHeader({ onToggleRescue });
    fireEvent.click(screen.getByText('Rescatista'));
    expect(onToggleRescue).toHaveBeenCalledOnce();
  });

  it('shows admin button when userCanEdit', () => {
    renderHeader({ userCanEdit: true });
    expect(screen.getByText('Admin')).toBeDefined();
  });

  it('hides admin button when user cannot edit', () => {
    renderHeader({ userCanEdit: false });
    expect(screen.queryByText('Admin')).toBeNull();
  });

  it('calls onAdminClick when admin button clicked', () => {
    const onAdminClick = vi.fn();
    renderHeader({ userCanEdit: true, onAdminClick });
    fireEvent.click(screen.getByText('Admin'));
    expect(onAdminClick).toHaveBeenCalledOnce();
  });

  it('opens data menu on click', () => {
    renderHeader();
    const dataBtn = screen.getByText('Datos');
    fireEvent.click(dataBtn);
    expect(screen.getByText('📥 Exportar JSON')).toBeDefined();
    expect(screen.getByText('📊 Exportar CSV')).toBeDefined();
    expect(screen.getByText('📥 Importar JSON')).toBeDefined();
    expect(screen.getByText('🏥 Personas Rescatadas')).toBeDefined();
  });

  it('calls onExportJSON from data menu', () => {
    const onExportJSON = vi.fn();
    renderHeader({ onExportJSON });
    fireEvent.click(screen.getByText('Datos'));
    fireEvent.click(screen.getByText('📥 Exportar JSON'));
    expect(onExportJSON).toHaveBeenCalledOnce();
  });

  it('calls onExportCSV from data menu', () => {
    const onExportCSV = vi.fn();
    renderHeader({ onExportCSV });
    fireEvent.click(screen.getByText('Datos'));
    fireEvent.click(screen.getByText('📊 Exportar CSV'));
    expect(onExportCSV).toHaveBeenCalledOnce();
  });

  it('calls onImportClick from data menu', () => {
    const onImportClick = vi.fn();
    renderHeader({ onImportClick });
    fireEvent.click(screen.getByText('Datos'));
    fireEvent.click(screen.getByText('📥 Importar JSON'));
    expect(onImportClick).toHaveBeenCalledOnce();
  });

  it('calls onRescuedClick from data menu', () => {
    const onRescuedClick = vi.fn();
    renderHeader({ onRescuedClick });
    fireEvent.click(screen.getByText('Datos'));
    fireEvent.click(screen.getByText('🏥 Personas Rescatadas'));
    expect(onRescuedClick).toHaveBeenCalledOnce();
  });
});
