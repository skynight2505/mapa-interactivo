import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { I18nProvider, useI18n, LANGUAGES } from '../i18n';
import type { ReactNode } from 'react';

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(I18nProvider, null, children);
  };
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'es';
  });

  describe('useI18n', () => {
    it('throws when used outside provider', () => {
      expect(() => {
        renderHook(() => useI18n());
      }).toThrow('useI18n must be used within I18nProvider');
    });

    it('provides default Spanish language', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });
      expect(result.current.lang).toBe('es');
    });

    it('translates keys correctly in Spanish', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });
      expect(result.current.t('app.title')).toBe('Mapa Interactivo Terremoto Venezuela');
      expect(result.current.t('btn.login')).toBe('Entrar');
      expect(result.current.t('filter.label')).toContain('Filtrar');
    });

    it('changes language and updates translations', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });

      act(() => {
        result.current.setLang('en');
      });

      expect(result.current.lang).toBe('en');
      expect(result.current.t('app.title')).toBe('Interactive Earthquake Map Venezuela');
      expect(result.current.t('btn.login')).toBe('Login');
    });

    it('switches to Chinese translations', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });

      act(() => {
        result.current.setLang('zh');
      });

      expect(result.current.t('app.title')).toBe('委内瑞拉地震交互地图');
      expect(result.current.t('btn.login')).toBe('登录');
    });

    it('switches to Arabic translations', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });

      act(() => {
        result.current.setLang('ar');
      });

      expect(result.current.t('app.title')).toBe('خريطة زلزال فنزويلا التفاعلية');
      expect(result.current.t('btn.login')).toBe('دخول');
    });

    it('switches to Portuguese translations', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });

      act(() => {
        result.current.setLang('pt');
      });

      expect(result.current.t('app.title')).toBe('Mapa Interativo do Terremoto da Venezuela');
      expect(result.current.t('btn.login')).toBe('Entrar');
    });

    it('returns raw key as fallback for missing translation', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });
      // @ts-expect-error Testing invalid key
      expect(result.current.t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('sets document direction to RTL for Arabic', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });

      act(() => {
        result.current.setLang('ar');
      });

      expect(result.current.dir).toBe('rtl');
      expect(document.documentElement.dir).toBe('rtl');
    });

    it('sets document direction to LTR for Spanish', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });

      act(() => {
        result.current.setLang('es');
      });

      expect(result.current.dir).toBe('ltr');
      expect(document.documentElement.dir).toBe('ltr');
    });

    it('persists language in localStorage', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useI18n(), { wrapper });

      act(() => {
        result.current.setLang('zh');
      });

      expect(localStorage.getItem('app_language')).toBe('zh');
    });
  });

  describe('LANGUAGES', () => {
    it('defines all 5 languages', () => {
      expect(Object.keys(LANGUAGES)).toEqual(['es', 'en', 'zh', 'ar', 'pt']);
    });

    it('each language has label, icon, and dir', () => {
      Object.values(LANGUAGES).forEach(lang => {
        expect(typeof lang.label).toBe('string');
        expect(typeof lang.icon).toBe('string');
        expect(['ltr', 'rtl']).toContain(lang.dir);
      });
    });

    it('only Arabic is RTL', () => {
      const rtlLangs = Object.entries(LANGUAGES).filter(([, v]) => v.dir === 'rtl');
      expect(rtlLangs).toHaveLength(1);
      expect(rtlLangs[0][0]).toBe('ar');
    });
  });
});
