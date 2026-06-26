import React from 'react';
import { CATEGORIES } from '../utils/categories';
import { SEVERITY_COLORS } from '../utils/categories';
import type { MapMarker } from '../types';
import { TERRAIN_LABELS } from '../types';
import SiteStatusDashboard from './SiteStatusDashboard';

interface MarkerPopupProps {
  marker: MapMarker;
  onClose: () => void;
}

const MarkerPopup: React.FC<MarkerPopupProps> = ({ marker, onClose }) => {
  const cat = CATEGORIES[marker.type];

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div
          className="detail-icon"
          style={{ backgroundColor: cat.bgColor }}
        >
          {cat.icon}
        </div>
        <div className="detail-title-group">
          <div className="detail-title">{marker.title}</div>
          <div className="detail-type">
            {cat.label}
            {marker.severity && (
              <>
                {' · '}
                <span style={{ color: SEVERITY_COLORS[marker.severity] }}>
                  Severidad: {marker.severity.toUpperCase()}
                </span>
              </>
            )}
            {marker.terrain && TERRAIN_LABELS[marker.terrain] && (
              <>
                {' · '}
                <span style={{ color: TERRAIN_LABELS[marker.terrain].color }}>
                  {TERRAIN_LABELS[marker.terrain].icon} {TERRAIN_LABELS[marker.terrain].label}
                </span>
              </>
            )}
          </div>
        </div>
        <button className="detail-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-body">
        <p className="detail-description">{marker.description}</p>

        {/* Site Status Dashboard */}
        <SiteStatusDashboard marker={marker} />

        {/* Grupos de ayuda */}
        <div className="detail-section">
          <div className="detail-section-title">
            👥 Grupos de Ayuda ({marker.groups.length})
          </div>
          {marker.groups.length === 0 ? (
            <p className="detail-no-data">No hay grupos asignados a esta zona</p>
          ) : (
            marker.groups.map((group) => (
              <div key={group.id} className="detail-group-item">
                <div className="detail-group-avatar">
                  {group.name.charAt(0)}
                </div>
                <div className="detail-group-info">
                  <div className="detail-group-name">{group.name}</div>
                  <div className="detail-group-contact">📞 {group.contact}</div>
                </div>
                <div className="detail-group-members">
                  {group.memberCount} miembros
                </div>
              </div>
            ))
          )}
        </div>

        {/* Insumos necesarios */}
        <div className="detail-section">
          <div className="detail-section-title">
            📦 Insumos ({marker.supplies.length})
          </div>
          {marker.supplies.length === 0 ? (
            <p className="detail-no-data">No hay insumos registrados</p>
          ) : (
            marker.supplies.map((supply) => (
              <div key={supply.id} className="detail-supply-item">
                <div>
                  <div className="detail-supply-name">{supply.name}</div>
                  <div className="detail-supply-qty">
                    {supply.quantity} {supply.unit}
                  </div>
                </div>
                <span className={`supply-status ${supply.status}`}>
                  {supply.status === 'needed'
                    ? '⚠️ Necesitado'
                    : supply.status === 'available'
                    ? '✅ Disponible'
                    : '🚚 Entregado'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Coordenadas */}
        <div className="detail-coords">
          📍 Coordenadas: {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
          <br />
          <span style={{ fontSize: 10, color: '#475569' }}>
            Creado: {new Date(marker.createdAt).toLocaleString('es-VE')} ·
            Actualizado: {new Date(marker.updatedAt).toLocaleString('es-VE')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarkerPopup;
