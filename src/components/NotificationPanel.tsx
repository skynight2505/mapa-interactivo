import React, { useState, useEffect } from 'react';
import {
  loadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationColor,
  getNotificationIcon,
} from '../utils/notifications';
import type { EmergencyNotification } from '../types';

const NotificationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<EmergencyNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  function refresh() {
    const all = loadNotifications();
    setNotifications(all);
    setUnreadCount(all.filter((n) => !n.read).length);
  }

  const handleMarkRead = (id: string) => {
    markAsRead(id);
    refresh();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    refresh();
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `Hace ${days}d`;
  };

  return (
    <div className="notif-panel-wrapper">
      <button
        className={`header-action-btn notif-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Notificaciones de emergencia"
      >
        🔔 {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">
              🔔 Notificaciones {unreadCount > 0 && `(${unreadCount} nuevas)`}
            </span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={handleMarkAllRead}>
                ✅ Marcar todo leído
              </button>
            )}
          </div>

          <div className="notif-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <span className="notif-empty-icon">🔔</span>
                <span>No hay notificaciones</span>
              </div>
            ) : (
              notifications.slice(0, 30).map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${notif.read ? '' : 'unread'}`}
                  onClick={() => !notif.read && handleMarkRead(notif.id)}
                >
                  <div
                    className="notif-item-indicator"
                    style={{ backgroundColor: getNotificationColor(notif.severity) }}
                  />
                  <div className="notif-item-content">
                    <div className="notif-item-header">
                      <span className="notif-item-icon">
                        {getNotificationIcon(notif.type)}
                      </span>
                      <span className="notif-item-title">{notif.title}</span>
                    </div>
                    <div className="notif-item-message">{notif.message}</div>
                    <div className="notif-item-footer">
                      <span className="notif-item-time">
                        {formatTime(notif.createdAt)}
                      </span>
                      {notif.markerTitle && (
                        <span className="notif-item-zone">
                          📍 {notif.markerTitle}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="notif-item-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
