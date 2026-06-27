import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginScreen from '../LoginScreen';
import { I18nProvider } from '../../utils/i18n';

function renderWithProviders() {
  return render(
    React.createElement(I18nProvider, null,
      React.createElement(LoginScreen, { onLogin: vi.fn() })
    )
  );
}

describe('LoginScreen', () => {
  beforeEach(() => {
    localStorage.clear();
    // Set up default admin user (same as module init)
    function simpleHash(str: string): string {
      let hash = 0;
      const salt = 'mapa-salt-2026';
      const salted = salt + str + salt;
      for (let i = 0; i < salted.length; i++) {
        const char = salted.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
      }
      return 'h_' + Math.abs(hash).toString(36);
    }
    localStorage.setItem('mapa-terremoto-users', JSON.stringify([
      { username: 'admin', passwordHash: simpleHash('admin123'), role: 'admin', displayName: 'Administrador' },
    ]));
  });

  it('renders the login form', () => {
    renderWithProviders();
    expect(screen.getByText('Acceso de Administración')).toBeDefined();
    expect(screen.getByText('🚪 Iniciar Sesión')).toBeDefined();
    expect(screen.getByPlaceholderText('Tu usuario')).toBeDefined();
    expect(screen.getByPlaceholderText('Tu contraseña')).toBeDefined();
  });

  it('shows error on invalid credentials', async () => {
    renderWithProviders();
    fireEvent.change(screen.getByPlaceholderText('Tu usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByText('🚪 Iniciar Sesión'));

    await waitFor(() => {
      expect(screen.getByText(/⚠️/)).toBeDefined();
    });
  });

  it('calls onLogin on successful login', async () => {
    const onLogin = vi.fn();
    render(
      React.createElement(I18nProvider, null,
        React.createElement(LoginScreen, { onLogin })
      )
    );

    fireEvent.change(screen.getByPlaceholderText('Tu usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByText('🚪 Iniciar Sesión'));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledOnce();
    });
  });

  it('shows loading text briefly on submit', () => {
    renderWithProviders();
    fireEvent.change(screen.getByPlaceholderText('Tu usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Tu contraseña'), { target: { value: 'admin123' } });

    // Before click: shows normal submit text
    expect(screen.getByText('🚪 Iniciar Sesión')).toBeDefined();

    fireEvent.click(screen.getByText('🚪 Iniciar Sesión'));

    // After fireEvent.click (wrapped in act), loading=true is flushed synchronously
    // Button text changes to loading state
    expect(screen.getByText('⏳ Entrando...')).toBeDefined();
  });

  it('requires both fields', () => {
    renderWithProviders();
    const submitBtn = screen.getByText('🚪 Iniciar Sesión');
    expect(submitBtn).toBeDefined();
    // Both inputs are required
    const usernameInput = screen.getByPlaceholderText('Tu usuario');
    expect((usernameInput as HTMLInputElement).required).toBe(true);
    const passwordInput = screen.getByPlaceholderText('Tu contraseña');
    expect((passwordInput as HTMLInputElement).required).toBe(true);
  });
});
