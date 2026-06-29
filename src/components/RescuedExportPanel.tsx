import React, { useState, useMemo } from 'react';
import type { RescuedPerson, TerrainType } from '../types';
import { TERRAIN_LABELS } from '../types';
import { useI18n } from '../utils/i18n';
import { tTerrain } from '../utils/translateContent';

interface RescuedExportPanelProps {
  onExportJSON: (data: RescuedPerson[]) => void;
  onExportCSV: (data: RescuedPerson[]) => void;
  rescuedPersons: RescuedPerson[];
  onAddPerson: (person: RescuedPerson) => void;
  onSearchResult?: (person: RescuedPerson) => void;
  searchHighlight?: string | null;
  onClose?: () => void;
}

const RescuedExportPanel: React.FC<RescuedExportPanelProps> = ({
  onExportJSON,
  onExportCSV,
  rescuedPersons,
  onAddPerson,
  onSearchResult,
  searchHighlight,
  onClose,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState<RescuedPerson | null>(null);
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
  const [verificationUrl, setVerificationUrl] = useState('');
  const [rescueLinks, setRescueLinks] = useState<{ label: string; url: string }[]>([]);
  const resetForm = () => {
    setName(''); setAge(0); setGender('masculino'); setZoneName('');
    setLat(10.4806); setLng(-66.9036); setTerrain('urbano');
    setRescuedBy(''); setCondition('bueno'); setNotes('');
    setVerificationUrl(''); setRescueLinks([]);
    setEditingPerson(null); setShowForm(false);
  };

  const openEdit = (p: RescuedPerson) => {
    setEditingPerson(p);
    setName(p.name); setAge(p.age); setGender(p.gender);
    setZoneName(p.zoneName); setLat(p.lat); setLng(p.lng);
    setTerrain(p.terrain || 'urbano'); setRescuedBy(p.rescuedBy || '');
    setCondition(p.condition); setNotes(p.notes || '');
    setVerificationUrl(p.verificationUrl || '');
    setRescueLinks(p.rescueLinks ? [...p.rescueLinks] : []);
    setShowForm(true);
  };
  const { t, lang } = useI18n();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return rescuedPersons.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.zoneName.toLowerCase().includes(q) ||
      (p.rescuedBy && p.rescuedBy.toLowerCase().includes(q))
    );
  }, [searchQuery, rescuedPersons]);

  const handleSave = () => {
    if (!name.trim() || !zoneName.trim()) return;
    const now = new Date().toISOString();
    const person: RescuedPerson = {
      id: editingPerson?.id || crypto.randomUUID(),
      name: name.trim(),
      age,
      gender,
      zoneId: editingPerson?.zoneId || '',
      zoneName: zoneName.trim(),
      lat,
      lng,
      terrain,
      rescuedAt: editingPerson?.rescuedAt || now,
      rescuedBy: rescuedBy.trim(),
      condition,
      notes: notes.trim(),
      verified: editingPerson?.verified || false,
      verificationUrl: verificationUrl.trim() || undefined,
      rescueLinks: rescueLinks.length > 0 ? rescueLinks.filter(l => l.label.trim() && l.url.trim()) : undefined,
      createdAt: editingPerson?.createdAt || now,
    };
    onAddPerson(person);
    resetForm();
  };

  const handleSearchClick = (person: RescuedPerson) => {
    if (onSearchResult) onSearchResult(person);
  };

  return (
    <div className="modal-overlay" onClick={() => { resetForm(); onClose?.(); }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('rescued.title')}</h2>
          <button className="modal-close" onClick={() => { resetForm(); onClose?.(); }}>✕</button>
        </div>
        <div className="modal-body">
          {/* Verification notice */}
          <div className="rescued-verify-notice">
            <span className="rescued-verify-icon">🔍</span>
            <div>
              <strong>{t('rescued.verifyTitle')}</strong>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                {t('rescued.verifyDesc')}{' '}
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
              placeholder={t('rescued.searchPlaceholder')}
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
                {searchResults.length} {t('rescued.resultsFor')} "{searchQuery}"
              </div>
              {searchResults.length === 0 ? (
                <div className="rescued-search-empty">
                  {t('rescued.noResults')}
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
                        📍 {p.zoneName} · {p.age} {t('rescued.yearsOld')} · {p.condition.toUpperCase()}
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
              <div className="rescued-stat-label">{t('rescued.total')}</div>
            </div>
            <div className="rescued-stat" style={{ borderColor: '#22C55E' }}>
              <div className="rescued-stat-value" style={{ color: '#4ADE80' }}>
                {rescuedPersons.filter(p => p.condition === 'bueno').length}
              </div>
              <div className="rescued-stat-label">{t('rescued.goodCondition')}</div>
            </div>
            <div className="rescued-stat" style={{ borderColor: '#F59E0B' }}>
              <div className="rescued-stat-value" style={{ color: '#FBBF24' }}>
                {rescuedPersons.filter(p => p.condition === 'herido').length}
              </div>
              <div className="rescued-stat-label">{t('rescued.injured')}</div>
            </div>
            <div className="rescued-stat" style={{ borderColor: '#EF4444' }}>
              <div className="rescued-stat-value" style={{ color: '#F87171' }}>
                {rescuedPersons.filter(p => p.condition === 'critico').length}
              </div>
              <div className="rescued-stat-label">{t('rescued.critical')}</div>
            </div>
          </div>

          {/* Persons list */}
          {!searchQuery.trim() && rescuedPersons.length > 0 && (
            <div className="rescued-list">
              {rescuedPersons.map(p => {
                const terrainLabel = p.terrain ? tTerrain(p.terrain, lang) : null;
                return (
                  <div key={p.id} className="rescued-item">
                    <div className="rescued-item-avatar" style={{
                      backgroundColor: p.condition === 'bueno' ? '#22C55E' : p.condition === 'herido' ? '#F59E0B' : '#EF4444'
                    }}>
                      {p.gender === 'femenino' ? '👩' : p.gender === 'masculino' ? '👨' : '🧑'}
                    </div>
                    <div className="rescued-item-info">
                      <div className="rescued-item-name">{p.name}, {p.age} {t('rescued.yearsOld')}</div>
                      <div className="rescued-item-meta">
                        📍 {p.zoneName}
                        {terrainLabel && <> · {terrainLabel}</>}
                      </div>
                      <div className="rescued-item-meta">
                        🏥 {p.condition.toUpperCase()} · 🛟 {p.rescuedBy || t('rescued.noRecord')}
                      </div>
                    </div>
                    <div className="rescued-item-actions">
                      <a
                        href={`http://desaparecidosterremotovenezuela.com/buscar?q=${encodeURIComponent(p.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rescued-verify-btn"
                        title={t('rescued.verifyOnSite')}
                      >
                        🔍
                      </a>
                      {onSearchResult && (
                        <button
                          className="rescued-verify-btn"
                          onClick={() => handleSearchClick(p)}
                          title={t('rescued.viewOnMap')}
                        >
                          🗺️
                        </button>
                      )}
                      <button
                        className="rescued-verify-btn"
                        onClick={() => openEdit(p)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add form toggle */}
          {!showForm ? (
            <button className="form-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
              {t('rescued.registerPerson')}
            </button>
          ) : (
            <div className="rescued-add-form">
              <div className="form-section-title">📝 {editingPerson ? t('rescued.editPerson') : t('rescued.formName').replace(' *', '')}</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('rescued.formName')}</label>
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('rescued.formAge')}</label>
                  <input className="form-input" type="number" value={age} onChange={e => setAge(parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('rescued.formGender')}</label>
                  <select className="form-select" value={gender} onChange={e => setGender(e.target.value as typeof gender)}>
                    <option value="masculino">{t('rescued.formMale')}</option>
                    <option value="femenino">{t('rescued.formFemale')}</option>
                    <option value="otro">{t('rescued.formOther')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('rescued.formCondition')}</label>
                  <select className="form-select" value={condition} onChange={e => setCondition(e.target.value as typeof condition)}>
                    <option value="bueno">{t('rescued.formGood')}</option>
                    <option value="herido">{t('rescued.formInjured')}</option>
                    <option value="critico">{t('rescued.formCritical')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('rescued.formZone')}</label>
                <input className="form-input" value={zoneName} onChange={e => setZoneName(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('rescued.formTerrain')}</label>
                  <select className="form-select" value={terrain} onChange={e => setTerrain(e.target.value as TerrainType)}>
                    {Object.entries(TERRAIN_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('rescued.formRescuedBy')}</label>
                  <input className="form-input" value={rescuedBy} onChange={e => setRescuedBy(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('rescued.formNotes')}</label>
                <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('rescued.formLat')}</label>
                  <input className="form-input" type="number" step="any" value={lat} onChange={e => setLat(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('rescued.formLng')}</label>
                  <input className="form-input" type="number" step="any" value={lng} onChange={e => setLng(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              {/* Enlaces */}
              <div className="form-group">
                <div className="form-section-title">🔗 Enlaces</div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 12 }}>{t('rescued.verificationUrl')}</label>
                  <input className="form-input" type="url" placeholder="https://..." value={verificationUrl} onChange={e => setVerificationUrl(e.target.value)} />
                </div>
                {rescueLinks.map((link, i) => (
                  <div key={i} className="form-row" style={{ marginBottom: 6 }}>
                    <input className="form-input" placeholder={t('rescued.linkLabel')} value={link.label} onChange={e => {
                      const next = [...rescueLinks]; next[i] = { ...next[i], label: e.target.value }; setRescueLinks(next);
                    }} />
                    <input className="form-input" placeholder={t('rescued.linkUrl')} value={link.url} onChange={e => {
                      const next = [...rescueLinks]; next[i] = { ...next[i], url: e.target.value }; setRescueLinks(next);
                    }} />
                    <button type="button" className="form-array-remove" onClick={() => setRescueLinks(rescueLinks.filter((_, idx) => idx !== i))}>✕</button>
                  </div>
                ))}
                <button type="button" className="form-add-btn" onClick={() => setRescueLinks([...rescueLinks, { label: '', url: '' }])}>
                  {t('rescued.addLink')}
                </button>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSave}>
                {editingPerson ? t('rescued.saveChanges') : t('rescued.formSubmit')}
              </button>
            </div>
          )}

          {/* Export buttons */}
          {rescuedPersons.length > 0 && (
            <div className="rescued-export-actions">
              <button className="btn btn-primary" onClick={() => onExportJSON(rescuedPersons)}>
                {t('rescued.exportJson')}
              </button>
              <button className="btn btn-secondary" onClick={() => onExportCSV(rescuedPersons)}>
                {t('rescued.exportCsv')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RescuedExportPanel;
