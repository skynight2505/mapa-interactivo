import React, { useState, useMemo } from 'react';
import type { RescuedPerson, TerrainType } from '../types';
import { TERRAIN_LABELS } from '../types';

interface RescuedExportPanelProps {
  onExportJSON: (data: RescuedPerson[]) => void;
  onExportCSV: (data: RescuedPerson[]) => void;
  rescuedPersons: RescuedPerson[];
  onAddPerson: (person: RescuedPerson) => void;
  onSearchResult?: (person: RescuedPerson) => void;
  searchHighlight?: string | null;
}

const RescuedExportPanel: React.FC<RescuedExportPanelProps> = ({
  onExportJSON,
  onExportCSV,
  rescuedPersons,
  onAddPerson,
  onSearchResult,
  searchHighlight,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState<'masculino' | 'femenino' | 'otro'>('masculino');
  const [zoneName, setZoneName] = useState('');
  const [lat, setLat] = useState(10.4806);
  const [lng, setLng] = useState(-66.9036);
  const [terrain, setTerrain] = useState<TerrainType>('urbano');
  const [rescuedBy, setRescuedBy] = useState('');
  const [condition, setCondition] = useState<'bueno' | 'herido' | 'critico'>('bueno');
  const [notes, setNotes] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return rescuedPersons.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.zoneName.toLowerCase().includes(q) ||
      (p.rescuedBy && p.rescuedBy.toLowerCase().includes(q))
    );
  }, [searchQuery, rescuedPersons]);

  const handleAdd = () => {
    if (!name.trim() || !zoneName.trim()) return;
    const person: RescuedPerson = {
      id: crypto.randomUUID(),
      name: name.trim(),
      age,
      gender,
      zoneId: '',
      zoneName: zoneName.trim(),
      lat,
      lng,
      terrain,
      rescuedAt: new Date().toISOString(),
      rescuedBy: rescuedBy.trim(),
      condition,
      notes: notes.trim(),
      verified: false,
      createdAt: new Date().toISOString(),
    };
    onAddPerson(person);
    setName('');
    setAge(0);
    setZoneName('');
    setRescuedBy('');
    setNotes('');
    setShowForm(false);
  };

  const handleSearchClick = (person: RescuedPerson) => {
    if (onSearchResult) onSearchResult(person);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowForm(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏥 Personas Rescatadas</h2>
          <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
        </div>
        <div className="modal-body">
          {/* Verification notice */}
          <div className="rescued-verify-notice">
            <span className="rescued-verify-icon">🔍</span>
            <div>
              <strong>Verificación de Desaparecidos</strong>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                Puedes verificar el estado de las personas en{' '}
                <a
                  href="http://desaparecidosterremotovenezuela.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#60A5FA', textDecoration: 'underline' }}
                >
                  desaparecidosterremotovenezuela.com
                </a>
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="rescued-search">
            <span className="rescued-search-icon">🔎</span>
            <input
              className="rescued-search-input"
              type="text"
              placeholder="Buscar por nombre, zona o rescatista..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="rescued-search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>

          {/* Search results */}
          {searchQuery.trim() && (
            <div className="rescued-search-results">
              <div className="rescued-search-results-header">
                {searchResults.length} resultado(s) para "{searchQuery}"
              </div>
              {searchResults.length === 0 ? (
                <div className="rescued-search-empty">
                  No se encontraron personas con ese término
                </div>
              ) : (
                searchResults.map(p => (
                  <div
                    key={p.id}
                    className={`rescued-search-item ${searchHighlight === p.id ? 'highlighted' : ''}`}
                    onClick={() => handleSearchClick(p)}
                  >
                    <div className="rescued-search-item-avatar" style={{
                      backgroundColor: p.condition === 'bueno' ? '#22C55E' : p.condition === 'herido' ? '#F59E0B' : '#EF4444'
                    }}>
                      {p.gender === 'femenino' ? '👩' : p.gender === 'masculino' ? '👨' : '🧑'}
                    </div>
                    <div className="rescued-search-item-info">
                      <div className="rescued-search-item-name">{p.name}</div>
                      <div className="rescued-search-item-meta">
                        📍 {p.zoneName} · {p.age} años · {p.condition.toUpperCase()}
                      </div>
                    </div>
                    <span className="rescued-search-item-action">🗺️</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Stats */}
          <div className="rescued-stats">
            <div className="rescued-stat">
              <div className="rescued-stat-value">{rescuedPersons.length}</div>
              <div className="rescued-stat-label">Total</div>
            </div>
            <div className="rescued-stat" style={{ borderColor: '#22C55E' }}>
              <div className="rescued-stat-value" style={{ color: '#4ADE80' }}>
                {rescuedPersons.filter(p => p.condition === 'bueno').length}
              </div>
              <div className="rescued-stat-label">Buen Estado</div>
            </div>
            <div className="rescued-stat" style={{ borderColor: '#F59E0B' }}>
              <div className="rescued-stat-value" style={{ color: '#FBBF24' }}>
                {rescuedPersons.filter(p => p.condition === 'herido').length}
              </div>
              <div className="rescued-stat-label">Heridos</div>
            </div>
            <div className="rescued-stat" style={{ borderColor: '#EF4444' }}>
              <div className="rescued-stat-value" style={{ color: '#F87171' }}>
                {rescuedPersons.filter(p => p.condition === 'critico').length}
              </div>
              <div className="rescued-stat-label">Crítico</div>
            </div>
          </div>

          {/* Persons list */}
          {!searchQuery.trim() && rescuedPersons.length > 0 && (
            <div className="rescued-list">
              {rescuedPersons.map(p => {
                const terrainInfo = p.terrain ? TERRAIN_LABELS[p.terrain] : null;
                return (
                  <div key={p.id} className="rescued-item">
                    <div className="rescued-item-avatar" style={{
                      backgroundColor: p.condition === 'bueno' ? '#22C55E' : p.condition === 'herido' ? '#F59E0B' : '#EF4444'
                    }}>
                      {p.gender === 'femenino' ? '👩' : p.gender === 'masculino' ? '👨' : '🧑'}
                    </div>
                    <div className="rescued-item-info">
                      <div className="rescued-item-name">{p.name}, {p.age} años</div>
                      <div className="rescued-item-meta">
                        📍 {p.zoneName}
                        {terrainInfo && <> · {terrainInfo.icon} {terrainInfo.label}</>}
                      </div>
                      <div className="rescued-item-meta">
                        🏥 {p.condition.toUpperCase()} · 🛟 {p.rescuedBy || 'Sin registro'}
                      </div>
                    </div>
                    <div className="rescued-item-actions">
                      <a
                        href={`http://desaparecidosterremotovenezuela.com/buscar?q=${encodeURIComponent(p.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rescued-verify-btn"
                        title="Verificar en desaparecidos"
                      >
                        🔍
                      </a>
                      {onSearchResult && (
                        <button
                          className="rescued-verify-btn"
                          onClick={() => handleSearchClick(p)}
                          title="Ver en mapa"
                        >
                          🗺️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add form toggle */}
          {!showForm ? (
            <button className="form-add-btn" onClick={() => setShowForm(true)}>
              ➕ Registrar Persona Rescatada
            </button>
          ) : (
            <div className="rescued-add-form">
              <div className="form-section-title">📝 Datos de la Persona</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input className="form-input" placeholder="Nombre completo" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input className="form-input" type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Sexo</label>
                  <select className="form-select" value={gender} onChange={e => setGender(e.target.value as typeof gender)}>
                    <option value="masculino">👨 Masculino</option>
                    <option value="femenino">👩 Femenino</option>
                    <option value="otro">🧑 Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Condición</label>
                  <select className="form-select" value={condition} onChange={e => setCondition(e.target.value as typeof condition)}>
                    <option value="bueno">✅ Bueno</option>
                    <option value="herido">⚠️ Herido</option>
                    <option value="critico">🔴 Crítico</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Zona de Rescate *</label>
                <input className="form-input" placeholder="Nombre de la zona" value={zoneName} onChange={e => setZoneName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Terreno</label>
                  <select className="form-select" value={terrain} onChange={e => setTerrain(e.target.value as TerrainType)}>
                    {Object.entries(TERRAIN_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rescatado por</label>
                  <input className="form-input" placeholder="Nombre o grupo" value={rescuedBy} onChange={e => setRescuedBy(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea className="form-textarea" placeholder="Detalles adicionales..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitud</label>
                  <input className="form-input" type="number" step="any" value={lat} onChange={e => setLat(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitud</label>
                  <input className="form-input" type="number" step="any" value={lng} onChange={e => setLng(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleAdd}>
                ✅ Registrar Persona
              </button>
            </div>
          )}

          {/* Export buttons */}
          {rescuedPersons.length > 0 && (
            <div className="rescued-export-actions">
              <button className="btn btn-primary" onClick={() => onExportJSON(rescuedPersons)}>
                📥 Exportar JSON
              </button>
              <button className="btn btn-secondary" onClick={() => onExportCSV(rescuedPersons)}>
                📊 Exportar CSV
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescuedExportPanel;
