import React from 'react';
import { SEVERITY_COLORS } from '../utils/categories';
import type { MapMarker } from '../types';
import { useI18n } from '../utils/i18n';

interface SiteStatusDashboardProps {
  marker: MapMarker;
}

const SiteStatusDashboard: React.FC<SiteStatusDashboardProps> = ({ marker }) => {
  useI18n();

  // Calculate supply stats
  const totalSupplies = marker.supplies.length;
  const neededCount = marker.supplies.filter((s) => s.status === 'needed').length;
  const availableCount = marker.supplies.filter((s) => s.status === 'available').length;
  const deliveredCount = marker.supplies.filter((s) => s.status === 'delivered').length;

  const neededPct = totalSupplies > 0 ? (neededCount / totalSupplies) * 100 : 0;
  const availablePct = totalSupplies > 0 ? (availableCount / totalSupplies) * 100 : 0;
  const deliveredPct = totalSupplies > 0 ? (deliveredCount / totalSupplies) * 100 : 0;

  // Group stats
  const totalMembers = marker.groups.reduce((sum, g) => sum + g.memberCount, 0);

  // Overall status
  const getOverallStatus = () => {
    if (marker.type === 'personas_atrapadas' && marker.severity === 'critica') {
      return { label: 'EMERGENCIA CRÍTICA', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
    }
    if (marker.type === 'edificio_derrumbado' && marker.severity === 'critica') {
      return { label: 'COLAPSO PARCIAL', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
    }
    if (marker.type === 'zona_refugio') {
      return { label: 'ZONA SEGURA', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' };
    }
    if (marker.type === 'farmacia' || marker.type === 'supermercado' || marker.type === 'tienda_comida') {
      return { label: marker.isActive ? 'ABIERTO' : 'CERRADO', color: marker.isActive ? '#22C55E' : '#EF4444', bg: marker.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' };
    }
    if (marker.severity === 'critica') return { label: 'CRÍTICO', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' };
    if (marker.severity === 'alta') return { label: 'ALERTA ALTA', color: '#F97316', bg: 'rgba(249,115,22,0.1)' };
    if (marker.severity === 'media') return { label: 'ESTABLE', color: '#EAB308', bg: 'rgba(234,179,8,0.1)' };
    return { label: 'BAJO CONTROL', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' };
  };

  const status = getOverallStatus();

  // Time since creation
  const hoursSince = Math.floor((Date.now() - new Date(marker.createdAt).getTime()) / 3600000);

  return (
    <div className="site-dashboard">
      {/* Overall Status Banner */}
      <div className="site-status-banner" style={{ borderColor: status.color }}>
        <div className="site-status-label" style={{ color: status.color }}>
          {status.label}
        </div>
        <div className="site-status-meta">
          {marker.severity && (
            <span
              className="site-severity-dot"
              style={{ backgroundColor: SEVERITY_COLORS[marker.severity] }}
            />
          )}
          <span>Actualizado hace {hoursSince < 1 ? '<1h' : `${hoursSince}h`}</span>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="site-stats-grid">
        <div className="site-stat-card">
          <div className="site-stat-icon">👥</div>
          <div className="site-stat-value">{marker.groups.length}</div>
          <div className="site-stat-label">Grupos</div>
        </div>
        <div className="site-stat-card">
          <div className="site-stat-icon">🧑‍🤝‍🧑</div>
          <div className="site-stat-value">{totalMembers}</div>
          <div className="site-stat-label">Voluntarios</div>
        </div>
        <div className="site-stat-card">
          <div className="site-stat-icon">📦</div>
          <div className="site-stat-value">{totalSupplies}</div>
          <div className="site-stat-label">Insumos</div>
        </div>
        <div className="site-stat-card">
          <div className="site-stat-icon">⚠️</div>
          <div className="site-stat-value" style={{ color: neededCount > 0 ? '#F87171' : '#4ADE80' }}>
            {neededCount}
          </div>
          <div className="site-stat-label">Faltantes</div>
        </div>
      </div>

      {/* Supply Progress Bars */}
      {totalSupplies > 0 && (
        <div className="site-supply-progress">
          <div className="site-supply-progress-title">📊 Estado de Insumos</div>

          <div className="site-progress-bar-group">
            <div className="site-progress-label">
              <span>⚠️ Necesitados</span>
              <span>{neededCount}/{totalSupplies}</span>
            </div>
            <div className="site-progress-track">
              <div
                className="site-progress-fill needed"
                style={{ width: `${neededPct}%` }}
              />
            </div>
          </div>

          <div className="site-progress-bar-group">
            <div className="site-progress-label">
              <span>✅ Disponibles</span>
              <span>{availableCount}/{totalSupplies}</span>
            </div>
            <div className="site-progress-track">
              <div
                className="site-progress-fill available"
                style={{ width: `${availablePct}%` }}
              />
            </div>
          </div>

          <div className="site-progress-bar-group">
            <div className="site-progress-label">
              <span>🚚 Entregados</span>
              <span>{deliveredCount}/{totalSupplies}</span>
            </div>
            <div className="site-progress-track">
              <div
                className="site-progress-fill delivered"
                style={{ width: `${deliveredPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Groups Timeline */}
      {marker.groups.length > 0 && (
        <div className="site-groups-timeline">
          <div className="site-supply-progress-title">👥 Grupos Activos</div>
          {marker.groups.map((group, i) => {
            const arrivedHrs = Math.floor(
              (Date.now() - new Date(group.arrivedAt).getTime()) / 3600000
            );
            return (
              <div key={group.id} className="site-timeline-item">
                <div className="site-timeline-dot" />
                {i < marker.groups.length - 1 && <div className="site-timeline-line" />}
                <div className="site-timeline-content">
                  <div className="site-timeline-name">{group.name}</div>
                  <div className="site-timeline-meta">
                    📞 {group.contact} · {group.memberCount} personas · hace {arrivedHrs}h
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SiteStatusDashboard;
