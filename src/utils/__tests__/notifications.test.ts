import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationColor,
  getNotificationIcon,
} from '../notifications';

describe('notifications', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadNotifications', () => {
    it('returns empty array when no notifications exist', () => {
      expect(loadNotifications()).toEqual([]);
    });

    it('loads saved notifications', () => {
      const notif = {
        id: 'n-1',
        type: 'emergencia' as const,
        title: 'Test',
        message: 'Test message',
        severity: 'critical' as const,
        read: false,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      localStorage.setItem('mapa-terremoto-notifications', JSON.stringify([notif]));
      const loaded = loadNotifications();
      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('Test');
    });
  });

  describe('addNotification', () => {
    it('creates and stores a new notification', () => {
      const notif = addNotification('emergencia', 'Alert!', 'Danger', 'critical');
      expect(notif.id).toBeDefined();
      expect(notif.title).toBe('Alert!');
      expect(notif.read).toBe(false);
      expect(loadNotifications()).toHaveLength(1);
    });

    it('prepends new notifications (newest first)', () => {
      addNotification('emergencia', 'First', 'msg1');
      addNotification('insumo_necesitado', 'Second', 'msg2');
      const all = loadNotifications();
      expect(all[0].title).toBe('Second');
      expect(all[1].title).toBe('First');
    });

    it('limits to 100 notifications', () => {
      for (let i = 0; i < 110; i++) {
        addNotification('emergencia', `Notif ${i}`, `msg ${i}`);
      }
      expect(loadNotifications()).toHaveLength(100);
    });

    it('includes marker reference when provided', () => {
      const notif = addNotification(
        'emergencia', 'Alert', 'msg', 'critical', 'marker-1', 'Zone Alpha'
      );
      expect(notif.markerId).toBe('marker-1');
      expect(notif.markerTitle).toBe('Zone Alpha');
    });
  });

  describe('markAsRead', () => {
    it('marks a single notification as read', () => {
      const notif = addNotification('emergencia', 'Read me', 'msg');
      expect(getUnreadCount()).toBe(1);
      markAsRead(notif.id);
      expect(getUnreadCount()).toBe(0);
      const loaded = loadNotifications();
      expect(loaded[0].read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', () => {
      addNotification('emergencia', 'A', 'msg');
      addNotification('emergencia', 'B', 'msg');
      addNotification('emergencia', 'C', 'msg');
      expect(getUnreadCount()).toBe(3);
      markAllAsRead();
      expect(getUnreadCount()).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('removes a notification by id', () => {
      const a = addNotification('emergencia', 'A', 'msg');
      addNotification('emergencia', 'B', 'msg');
      deleteNotification(a.id);
      const remaining = loadNotifications();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe('B');
    });
  });

  describe('getUnreadCount', () => {
    it('returns 0 when no notifications', () => {
      expect(getUnreadCount()).toBe(0);
    });

    it('counts only unread notifications', () => {
      const a = addNotification('emergencia', 'A', 'msg');
      addNotification('emergencia', 'B', 'msg');
      expect(getUnreadCount()).toBe(2);
      markAsRead(a.id);
      expect(getUnreadCount()).toBe(1);
    });
  });

  describe('getNotificationColor', () => {
    it('returns red for critical', () => {
      expect(getNotificationColor('critical')).toBe('#EF4444');
    });

    it('returns yellow for warning', () => {
      expect(getNotificationColor('warning')).toBe('#F59E0B');
    });

    it('returns blue for info/default', () => {
      expect(getNotificationColor('info')).toBe('#3B82F6');
      expect(getNotificationColor('other')).toBe('#3B82F6');
    });
  });

  describe('getNotificationIcon', () => {
    it('returns correct icons for known types', () => {
      expect(getNotificationIcon('emergencia')).toBe('🚨');
      expect(getNotificationIcon('insumo_necesitado')).toBe('📦');
      expect(getNotificationIcon('severidad_cambiada')).toBe('⚠️');
      expect(getNotificationIcon('nuevo_marcador')).toBe('📍');
      expect(getNotificationIcon('grupo_llego')).toBe('👥');
      expect(getNotificationIcon('zona_cerrada')).toBe('🔒');
      expect(getNotificationIcon('actualizacion')).toBe('📋');
    });
  });
});
