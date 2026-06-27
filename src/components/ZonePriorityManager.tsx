import React, { useState } from 'react';
import type { MapMarker, TerrainType } from '../types';
import { SEVERITY_COLORS } from '../utils/categories';
import { TERRAIN_LABELS } from '../types';

interface ZonePriorityManagerProps {
  marker: MapMarker;
  onUpdate: (updates: Partial<MapMarker>) => void;
}

type SeverityKey = NonNullable<MapMarker['severity']>;
const SEVERITY_OPTIONS: { key: SeverityKey; label: string; icon: string; color: string }[] = [
  { key: 'baja', label: 'Baja', icon: '🟢', color: '#22C55E' },
  { key: 'media', label: 'Media', icon: '🟡', color: '#EAB308' },
  { key: 'alta', label: 'Alta', icon: '🟠', color: '#F97316' },
  { key: 'critica', label: 'Crítica', icon: '🔴', color: '#EF4444' },
];

const ZonePriorityManager: React.FC<ZonePriorityManagerProps> = ({ marker, onUpdate }) => {
  const [activeSeverity, setActiveSeverity] = useState<SeverityKey>(marker.severity || 'media');
  const [activeTerrain, setActiveTerrain] = useState<TerrainType>(marker.terrain || 'urbano');
  const [saved, setSaved] = useState(false);

  const handleSaveSeverity = (severity: SeverityKey) => {
    setActiveSeverity(severity);
    onUpdate({ severity });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveTerrain = (terrain: TerrainType) => {
    setActiveTerrain(terrain);
    onUpdate({ terrain });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="zone-priority-manager">
      <div className="zone-priority-section">
        <div className="zone-priority-section-title">⚠️ Gravedad de la Zona</div>
        <div className="zone-priority-current" style={{ color: SEVERITY_COLORS[activeSeverity] }}>
          Nivel actual: {activeSeverity.toUpperCase()}
        </div>
        <div className="zone-priority-options">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`zone-priority-opt ${activeSeverity === opt.key ? 'active' : ''}`}
              style={{
                borderColor: opt.color,
                backgroundColor: activeSeverity === opt.key ? `${opt.color}22` : 'transparent',
                color: activeSeverity === opt.key ? opt.color : '#94a3b8',
              }}
              onClick={() => handleSaveSeverity(opt.key)}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="zone-priority-section">
        <div className="zone-priority-section-title">🏔️ Tipo de Terreno</div>
        <div className="zone-priority-options terrain">
          {(Object.entries(TERRAIN_LABELS) as [TerrainType, typeof TERRAIN_LABELS[TerrainType]][]).map(([key, val]) => (
            <button
              key={key}
              className={`zone-priority-opt terrain-opt ${activeTerrain === key ? 'active' : ''}`}
              style={{
                borderColor: val.color,
                backgroundColor: activeTerrain === key ? `${val.color}22` : 'transparent',
                color: activeTerrain === key ? val.color : '#94a3b8',
              }}
              onClick={() => handleSaveTerrain(key)}
            >
              {val.icon} {val.label}
            </button>
          ))}
        </div>
      </div>

      {saved && (
        <div className="zone-priority-saved">
          ✅ Cambios guardados
        </div>
      )}
    </div>
  );
};

export default ZonePriorityManager;
