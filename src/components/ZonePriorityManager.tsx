import React, { useState } from 'react';
import type { MapMarker, TerrainType } from '../types';
import { SEVERITY_COLORS } from '../utils/categories';
import { useI18n } from '../utils/i18n';
import { tTerrain, tSeverity } from '../utils/translateContent';

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
  const { lang, t } = useI18n();
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
          {tSeverity(activeSeverity, lang)}
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
              {opt.icon} {tSeverity(opt.key, lang)}
            </button>
          ))}
        </div>
      </div>

      <div className="zone-priority-section">
        <div className="zone-priority-section-title">{t('form.terrain')}</div>
        <div className="zone-priority-options terrain">
          {(['urbano', 'montañoso', 'costero', 'rural', 'industrial', 'mixin'] as TerrainType[]).map((key) => (
            <button
              key={key}
              className={`zone-priority-opt terrain-opt ${activeTerrain === key ? 'active' : ''}`}
              style={{
                backgroundColor: activeTerrain === key ? 'rgba(59,130,246,0.15)' : 'transparent',
                color: activeTerrain === key ? '#60a5fa' : '#94a3b8',
              }}
              onClick={() => handleSaveTerrain(key)}
            >
              {tTerrain(key, lang)}
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
