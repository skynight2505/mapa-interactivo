import React from 'react';
import type { ZoneServices, ServiceStatus } from '../types';

interface ZoneServicesStatusProps {
  services: ZoneServices;
  onUpdate?: (services: ZoneServices) => void;
  isEditMode?: boolean;
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string; icon: string }> = {
  disponible: { label: 'Disponible', color: '#22C55E', bg: 'rgba(34,197,94,0.15)', icon: '✅' },
  parcial: { label: 'Parcial', color: '#EAB308', bg: 'rgba(234,179,8,0.15)', icon: '🟡' },
  dañado: { label: 'Dañado', color: '#F97316', bg: 'rgba(249,115,22,0.15)', icon: '🟠' },
  no_disponible: { label: 'No Disponible', color: '#EF4444', bg: 'rgba(239,68,68,0.15)', icon: '❌' },
};

const SERVICE_ITEMS: { key: keyof ZoneServices; label: string; icon: string }[] = [
  { key: 'agua', label: 'Agua Potable', icon: '💧' },
  { key: 'luz', label: 'Electricidad', icon: '⚡' },
  { key: 'gasolina', label: 'Gasolina', icon: '⛽' },
  { key: 'gas', label: 'Gas', icon: '🔥' },
  { key: 'internet', label: 'Internet', icon: '🌐' },
  { key: 'telefono', label: 'Teléfono', icon: '📱' },
];

const ZoneServicesStatus: React.FC<ZoneServicesStatusProps> = ({ services, onUpdate, isEditMode }) => {
  const cycleStatus = (current: ServiceStatus): ServiceStatus => {
    const order: ServiceStatus[] = ['disponible', 'parcial', 'dañado', 'no_disponible'];
    const idx = order.indexOf(current);
    return order[(idx + 1) % order.length];
  };

  const handleToggle = (key: keyof ZoneServices) => {
    if (!isEditMode || !onUpdate) return;
    onUpdate({ ...services, [key]: cycleStatus(services[key]) });
  };

  return (
    <div className="zone-services">
      <div className="zone-services-title">🔌 Estado de Servicios</div>
      <div className="zone-services-grid">
        {SERVICE_ITEMS.map((item) => {
          const status = services[item.key];
          const config = STATUS_CONFIG[status];
          return (
            <div
              key={item.key}
              className={`zone-service-card ${isEditMode ? 'editable' : ''}`}
              style={{ borderColor: config.color }}
              onClick={() => handleToggle(item.key)}
            >
              <div className="zone-service-icon">{item.icon}</div>
              <div className="zone-service-info">
                <div className="zone-service-name">{item.label}</div>
                <div className="zone-service-status" style={{ color: config.color }}>
                  {config.icon} {config.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isEditMode && (
        <div className="zone-services-hint">
          💡 Haz clic en un servicio para cambiar su estado
        </div>
      )}
    </div>
  );
};

export default ZoneServicesStatus;
