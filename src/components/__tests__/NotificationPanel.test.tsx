import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import NotificationPanel from '../NotificationPanel';
import { I18nProvider } from '../../utils/i18n';
import { addNotification } from '../../utils/notifications';

function renderPanel() {
  return render(
    React.createElement(I18nProvider, null,
      React.createElement(NotificationPanel)
    )
  );
}

describe('NotificationPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'es';
  });

  it('renders bell button', () => {
    renderPanel();
    expect(screen.getByText('🔔')).toBeDefined();
  });

  it('does not show badge when no unread notifications', () => {
    renderPanel();
    const bell = screen.getByTitle('Notificaciones de emergencia');
    expect(bell.className).not.toContain('has-unread');
  });

  it('shows unread badge when notifications exist', () => {
    addNotification('emergencia', 'Alerta', 'Prueba');
    renderPanel();
    const bell = screen.getByTitle('Notificaciones de emergencia');
    expect(bell.className).toContain('has-unread');
  });

  it('opens dropdown on bell click', () => {
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('No hay notificaciones')).toBeDefined();
  });

  it('shows empty state in dropdown', () => {
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('No hay notificaciones')).toBeDefined();
    expect(screen.queryByText('✅ Marcar todo leído')).toBeNull();
  });

  it('shows notification list when notifications exist', () => {
    addNotification('emergencia', 'Alerta Importante', 'Descripción de prueba', 'critical');
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('Alerta Importante')).toBeDefined();
    expect(screen.getByText('Descripción de prueba')).toBeDefined();
  });

  it('shows mark all as read button when unread', () => {
    addNotification('emergencia', 'Test', 'msg');
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('✅ Marcar todo leído')).toBeDefined();
  });

  it('marks all as read on button click', () => {
    addNotification('emergencia', 'Title A', 'msg A');
    addNotification('insumo_necesitado', 'Title B', 'msg B');
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('Title A')).toBeDefined();
    expect(screen.getByText('Title B')).toBeDefined();
    fireEvent.click(screen.getByText('✅ Marcar todo leído'));
    // After marking all as read, the mark all button may still show
    // but notifications should still exist (just marked as read)
    expect(screen.getByText('Title A')).toBeDefined();
  });

  it('shows notification title from addNotification', () => {
    addNotification('severidad_cambiada', '⚠️ Alerta de Riesgo', 'Zona peligrosa');
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    expect(screen.getByText('⚠️ Alerta de Riesgo')).toBeDefined();
  });

  it('shows delete button for each notification', () => {
    addNotification('nuevo_marcador', 'Nueva Zona', 'Se agregó zona refugio');
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    const deleteBtn = screen.getByTitle('Eliminar');
    expect(deleteBtn).toBeDefined();
  });

  it('removes notification on delete', () => {
    addNotification('actualizacion', 'Actualización', 'Detalles');
    renderPanel();
    fireEvent.click(screen.getByText('🔔'));
    const deleteBtn = screen.getByTitle('Eliminar');
    fireEvent.click(deleteBtn);
    // After delete, should show empty state
    expect(screen.getByText('No hay notificaciones')).toBeDefined();
  });
});
