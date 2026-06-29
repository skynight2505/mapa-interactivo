import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIES } from '../utils/categories';
import type { MapMarker, MarkerType, HelpGroup, Supply, TerrainType } from '../types';
import { TERRAIN_LABELS } from '../types';
import { useI18n, LANGUAGES, type Language } from '../utils/i18n';
import { tCategory } from '../utils/translateContent';

interface MarkerFormProps {
  marker?: MapMarker | null;
  defaultLat?: number;
  defaultLng?: number;
  onSave: (marker: MapMarker) => void;
  onClose: () => void;
}

const MarkerForm: React.FC<MarkerFormProps> = ({
  marker,
  defaultLat = 10.4806,
  defaultLng = -66.9036,
  onSave,
  onClose,
}) => {
  const isEditing = !!marker;
  const { t } = useI18n();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<MarkerType>('terremoto');
  const [severity, setSeverity] = useState<'baja' | 'media' | 'alta' | 'critica'>('media');
  const [terrain, setTerrain] = useState<TerrainType>('urbano');
  const [lat, setLat] = useState(defaultLat);
  const [lng, setLng] = useState(defaultLng);
  const [isActive, setIsActive] = useState(true);
  const [groups, setGroups] = useState<HelpGroup[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [translations, setTranslations] = useState<Record<string, { title: string; description: string }>>({});
  const [showTranslations, setShowTranslations] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (marker) {
      setTitle(marker.title);
      setDescription(marker.description);
      setType(marker.type);
      setSeverity(marker.severity || 'media');
      setTerrain(marker.terrain || 'urbano');
      setLat(marker.lat);
      setLng(marker.lng);
      setIsActive(marker.isActive ?? true);
      setGroups([...marker.groups]);
      setSupplies([...marker.supplies]);
      if (marker.translations) {
        const t: Record<string, { title: string; description: string }> = {};
        for (const [lang, val] of Object.entries(marker.translations)) {
          t[lang] = { title: val.title || '', description: val.description || '' };
        }
        setTranslations(t);
      }
      if (marker.images) setImages([...marker.images]);
    }
  }, [marker]);

  const addGroup = () => {
    setGroups([
      ...groups,
      {
        id: crypto.randomUUID(),
        name: '',
        contact: '',
        memberCount: 1,
        arrivedAt: new Date().toISOString(),
      },
    ]);
  };

  const updateGroup = (index: number, field: keyof HelpGroup, value: string | number) => {
    const updated = [...groups];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setGroups(updated);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  const addSupply = () => {
    setSupplies([
      ...supplies,
      {
        id: crypto.randomUUID(),
        name: '',
        quantity: 0,
        unit: 'unidades',
        status: 'needed' as const,
      },
    ]);
  };

  const updateSupply = (index: number, field: keyof Supply, value: string | number) => {
    const updated = [...supplies];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setSupplies(updated);
  };

  const removeSupply = (index: number) => {
    setSupplies(supplies.filter((_, i) => i !== index));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const pending: string[] = [];
    const maxSize = 2 * 1024 * 1024;
    const maxImages = 50 - images.length;
    let loaded = 0;
    for (let i = 0; i < files.length && pending.length < maxImages; i++) {
      if (files[i].size > maxSize) continue;
      const idx = pending.length;
      pending.push('');
      loaded++;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = ev.target?.result as string;
        if (data) pending[idx] = data;
        loaded--;
        if (loaded === 0) {
          setImages(prev => [...prev, ...pending.filter(Boolean)]);
        }
      };
      reader.readAsDataURL(files[i]);
    }
    if (loaded === 0) setImages(prev => [...prev, ...pending.filter(Boolean)]);
    if (e.target) e.target.value = '';
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();
    const result: MapMarker = {
      id: marker?.id || crypto.randomUUID(),
      type,
      title: title.trim(),
      description: description.trim(),
      lat,
      lng,
      severity,
      terrain,
      groups: groups.filter((g) => g.name.trim()),
      supplies: supplies.filter((s) => s.name.trim()),
      isActive,
      createdAt: marker?.createdAt || now,
      updatedAt: now,
    };

    const filledTranslations: Record<string, { title?: string; description?: string }> = {};
    for (const [lang, val] of Object.entries(translations)) {
      if (val.title.trim() || val.description.trim()) {
        filledTranslations[lang] = {};
        if (val.title.trim()) filledTranslations[lang].title = val.title.trim();
        if (val.description.trim()) filledTranslations[lang].description = val.description.trim();
      }
    }
    if (Object.keys(filledTranslations).length > 0) {
      result.translations = filledTranslations;
    }

    if (images.length > 0) result.images = images;

    onSave(result);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? t('form.editZone') : t('form.newZone')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Tipo de zona */}
            <div className="form-group">
              <label className="form-label">{t('form.zoneType')}</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as MarkerType)}
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.type} value={cat.type}>
                    {cat.icon} {tCategory(cat.type, 'es')}
                  </option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div className="form-group">
              <label className="form-label">{t('form.title')}</label>
              <input
                className="form-input"
                type="text"
                placeholder={t('form.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label className="form-label">{t('form.description')}</label>
              <textarea
                className="form-textarea"
                placeholder={t('form.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Terreno */}
            <div className="form-group">
              <label className="form-label">{t('form.terrain')}</label>
              <select
                className="form-select"
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as TerrainType)}
              >
                {Object.entries(TERRAIN_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.icon} {val.label} — {val.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Severidad y estado */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('form.severity')}</label>
                <select
                  className="form-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as typeof severity)}
                >
                  <option value="baja">{t('form.sevLow')}</option>
                  <option value="media">{t('form.sevMed')}</option>
                  <option value="alta">{t('form.sevHigh')}</option>
                  <option value="critica">{t('form.sevCritical')}</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.status')}</label>
                <select
                  className="form-select"
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                >
                  <option value="true">{t('form.statusActive')}</option>
                  <option value="false">{t('form.statusInactive')}</option>
                </select>
              </div>
            </div>

            {/* Coordenadas */}
            <div className="form-group">
              <label className="form-label">{t('form.coordinates')}</label>
              <div className="form-row">
                <div>
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    placeholder={t('form.latPlaceholder')}
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  />
                  <div className="form-hint">{t('form.latHint')}</div>
                </div>
                <div>
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    placeholder={t('form.lngPlaceholder')}
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  />
                  <div className="form-hint">{t('form.lngHint')}</div>
                </div>
              </div>
            </div>

            {/* Grupos de ayuda */}
            <div className="form-group">
              <div className="form-section-title">{t('form.helpGroups')}</div>
              {groups.map((group, i) => (
                <div key={group.id} className="form-group" style={{ marginBottom: 12 }}>
                  <div className="form-row">
                    <input
                      className="form-input"
                      placeholder={t('form.groupName')}
                      value={group.name}
                      onChange={(e) => updateGroup(i, 'name', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder={t('form.groupContact')}
                      value={group.contact}
                      onChange={(e) => updateGroup(i, 'contact', e.target.value)}
                    />
                  </div>
                  <div className="form-row" style={{ marginTop: 8 }}>
                    <input
                      className="form-input"
                      type="number"
                      placeholder={t('form.membersPlaceholder')}
                      value={group.memberCount}
                      onChange={(e) => updateGroup(i, 'memberCount', parseInt(e.target.value) || 0)}
                      style={{ width: 120 }}
                    />
                    <button
                      type="button"
                      className="form-array-remove"
                      onClick={() => removeGroup(i)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="form-add-btn" onClick={addGroup}>
                {t('form.addGroup')}
              </button>
            </div>

            {/* Insumos */}
            <div className="form-group">
              <div className="form-section-title">{t('form.supplies')}</div>
              {supplies.map((supply, i) => (
                <div key={supply.id} className="form-group" style={{ marginBottom: 12 }}>
                  <div className="form-row-3">
                    <input
                      className="form-input"
                      placeholder={t('form.supplyName')}
                      value={supply.name}
                      onChange={(e) => updateSupply(i, 'name', e.target.value)}
                    />
                    <input
                      className="form-input"
                      type="number"
                      placeholder={t('form.quantity')}
                      value={supply.quantity}
                      onChange={(e) => updateSupply(i, 'quantity', parseInt(e.target.value) || 0)}
                    />
                    <input
                      className="form-input"
                      placeholder={t('form.unit')}
                      value={supply.unit}
                      onChange={(e) => updateSupply(i, 'unit', e.target.value)}
                    />
                  </div>
                  <div className="form-row" style={{ marginTop: 8 }}>
                    <select
                      className="form-select"
                      value={supply.status}
                      onChange={(e) => updateSupply(i, 'status', e.target.value)}
                    >
                      <option value="needed">{t('popup.needed')}</option>
                      <option value="available">{t('popup.available')}</option>
                      <option value="delivered">{t('popup.delivered')}</option>
                    </select>
                    <button
                      type="button"
                      className="form-array-remove"
                      onClick={() => removeSupply(i)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="form-add-btn" onClick={addSupply}>
                {t('form.addSupply')}
              </button>
            </div>

            {/* Imágenes */}
            <div className="form-group">
              <div className="form-section-title">{t('popup.photos')}</div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <div className="form-image-grid">
                {images.map((img, i) => (
                  <div key={i} className="form-image-item">
                    <img src={img} alt={`Foto ${i + 1}`} />
                    <button type="button" className="form-image-remove" onClick={() => handleImageRemove(i)}>✕</button>
                  </div>
                ))}
                {images.length < 50 && (
                  <button type="button" className="form-image-add" onClick={() => fileRef.current?.click()}>
                    +
                  </button>
                )}
              </div>
              {images.length >= 50 && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{t('form.maxImages')}</div>}
            </div>

            {/* Traducciones */}
            <div className="form-group">
              <div
                className="form-section-title"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => setShowTranslations(!showTranslations)}
              >
                🌐 {t('form.translations')} {showTranslations ? '▼' : '▶'}
              </div>
              {showTranslations && (
                <>
                  {(['en', 'pt', 'zh', 'ar'] as Language[]).map((lang) => (
                    <div key={lang} className="form-translation-group">
                      <div className="form-translation-header">
                        <span>{LANGUAGES[lang].icon} <strong>{LANGUAGES[lang].label}</strong></span>
                      </div>
                      <input
                        className="form-input"
                        type="text"
                        placeholder={`${t('form.title')} (${lang.toUpperCase()})`}
                        value={translations[lang]?.title || ''}
                        onChange={(e) => setTranslations(prev => ({
                          ...prev,
                          [lang]: { ...prev[lang], title: e.target.value, description: prev[lang]?.description || '' }
                        }))}
                      />
                      <textarea
                        className="form-textarea"
                        placeholder={`${t('form.description')} (${lang.toUpperCase()})`}
                        value={translations[lang]?.description || ''}
                        onChange={(e) => setTranslations(prev => ({
                          ...prev,
                          [lang]: { ...prev[lang], title: prev[lang]?.title || '', description: e.target.value }
                        }))}
                        rows={2}
                        style={{ marginTop: 6 }}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('form.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? t('form.saveChanges') : t('form.createZone')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkerForm;
