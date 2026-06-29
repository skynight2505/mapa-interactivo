import type { EmergencyNotification, NotificationType, MapMarker } from '../types';

const NOTIF_KEY = 'mapa-terremoto-notifications';

// ===== STORAGE =====
export function loadNotifications(): EmergencyNotification[] {
  const data = localStorage.getItem(NOTIF_KEY);
  return data ? JSON.parse(data) : [];
}

function saveNotifications(notifs: EmergencyNotification[]): void {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

// ===== CRUD =====
export function addNotification(
  type: NotificationType,
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'critical' = 'info',
  markerId?: string,
  markerTitle?: string
): EmergencyNotification {
  const notif: EmergencyNotification = {
    id: crypto.randomUUID(),
    type,
    title,
    message,
    markerId,
    markerTitle,
    severity,
    read: false,
    createdAt: new Date().toISOString(),
  };

  const existing = loadNotifications();
  existing.unshift(notif);
  saveNotifications(existing.slice(0, 100));

  tryBrowserNotification(title, message, severity);

  return notif;
}

export function markAsRead(id: string): void {
  const notifs = loadNotifications();
  const n = notifs.find((x) => x.id === id);
  if (n) {
    n.read = true;
    saveNotifications(notifs);
  }
}

export function markAllAsRead(): void {
  const notifs = loadNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(notifs);
}

export function deleteNotification(id: string): void {
  const notifs = loadNotifications().filter((n) => n.id !== id);
  saveNotifications(notifs);
}

export function getUnreadCount(): number {
  return loadNotifications().filter((n) => !n.read).length;
}

// ===== AUTO-GENERATE NOTIFICATIONS =====
export function generateAutoNotifications(markers: MapMarker[]): void {
  if (markers.length === 0) return;

  markers.forEach((m) => {
    if (m.type === 'personas_atrapadas' && m.severity === 'critica') {
      addNotification(
        'emergencia',
        '🚨 Personas Atrapadas - Emergencia',
        `${m.title}: ${m.description}`,
        'critical',
        m.id,
        m.title
      );
    }

    if (m.type === 'edificio_derrumbado' && (m.severity === 'alta' || m.severity === 'critica')) {
      addNotification(
        'emergencia',
        '🏚️ Edificio Derrumbado Reportado',
        `${m.title}: ${m.description}`,
        'critical',
        m.id,
        m.title
      );
    }

    if (m.type === 'zona_riesgo' && (m.severity === 'alta' || m.severity === 'critica')) {
      addNotification(
        'severidad_cambiada',
        '⚠️ Zona de Riesgo Identificada',
        `${m.title}: ${m.description}`,
        'warning',
        m.id,
        m.title
      );
    }

    if (m.type === 'via_obstruida') {
      addNotification(
        'actualizacion',
        '🚧 Vía Obstruida',
        `${m.title}: ${m.description}`,
        'info',
        m.id,
        m.title
      );
    }

    if (m.type === 'zona_refugio') {
      addNotification(
        'nuevo_marcador',
        '🏠 Zona Refugio Disponible',
        `${m.title}: ${m.description}`,
        'info',
        m.id,
        m.title
      );
    }
  });
}

// ===== BROWSER NOTIFICATIONS =====
export function requestNotificationPermission(): void {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function tryBrowserNotification(title: string, body: string, severity: string): void {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const icon = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';

  new Notification(`${icon} ${title}`, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: crypto.randomUUID(),
  });
}

// ===== SEVERITY HELPERS =====
export function getNotificationColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#EF4444';
    case 'warning': return '#F59E0B';
    default: return '#3B82F6';
  }
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'emergencia': return '🚨';
    case 'insumo_necesitado': return '📦';
    case 'severidad_cambiada': return '⚠️';
    case 'nuevo_marcador': return '📍';
    case 'grupo_llego': return '👥';
    case 'zona_cerrada': return '🔒';
    case 'actualizacion': return '📋';
    default: return 'ℹ️';
  }
}
