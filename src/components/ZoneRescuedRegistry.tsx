import React, { useState, useMemo } from 'react';
import type { RescuedPerson } from '../types';
import { useI18n } from '../utils/i18n';

interface ZoneRescuedRegistryProps {
  zoneId: string;
  zoneName: string;
  rescuedPersons: RescuedPerson[];
  onAddPerson: (person: RescuedPerson) => void;
}

const CONDITION_OPTIONS: { key: RescuedPerson['condition']; label: string; icon: string; color: string }[] = [
  { key: 'bueno', label: 'Bueno', icon: '✅', color: '#22C55E' },
  { key: 'herido', label: 'Herido', icon: '🩹', color: '#F59E0B' },
  { key: 'critico', label: 'Crítico', icon: '🚑', color: '#EF4444' },
];

const GENDER_OPTIONS: { key: RescuedPerson['gender']; label: string }[] = [
  { key: 'masculino', label: 'Masculino' },
  { key: 'femenino', label: 'Femenino' },
  { key: 'otro', label: 'Otro' },
];

const ZoneRescuedRegistry: React.FC<ZoneRescuedRegistryProps> = ({ zoneId, zoneName, rescuedPersons, onAddPerson }) => {
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<RescuedPerson['gender']>('masculino');
  const [condition, setCondition] = useState<RescuedPerson['condition']>('bueno');
  const [notes, setNotes] = useState('');

  const zoneRescued = useMemo(
    () => rescuedPersons.filter((p) => p.zoneId === zoneId),
    [rescuedPersons, zoneId]
  );

  const handleSubmit = () => {
    if (!name.trim()) return;
    const person: RescuedPerson = {
      id: crypto.randomUUID(),
      name: name.trim(),
      age: parseInt(age) || 0,
      gender,
      zoneId,
      zoneName,
      lat: 0,
      lng: 0,
      rescuedAt: new Date().toISOString(),
      rescuedBy: 'Equipo de rescate',
      condition,
      notes: notes.trim() || undefined,
      verified: false,
      createdAt: new Date().toISOString(),
    };
    onAddPerson(person);
    setName('');
    setAge('');
    setGender('masculino');
    setCondition('bueno');
    setNotes('');
    setShowForm(false);
  };

  const criticalCount = zoneRescued.filter((p) => p.condition === 'critico').length;
  const injuredCount = zoneRescued.filter((p) => p.condition === 'herido').length;
  const goodCount = zoneRescued.filter((p) => p.condition === 'bueno').length;

  return (
    <div className="zone-rescued-registry">
      <div className="zone-rescued-summary">
        <div className="zone-rescued-summary-item" style={{ borderColor: '#22C55E' }}>
          <span className="zone-rescued-summary-value" style={{ color: '#22C55E' }}>{goodCount}</span>
          <span className="zone-rescued-summary-label">{t('rescued.goodCondition')}</span>
        </div>
        <div className="zone-rescued-summary-item" style={{ borderColor: '#F59E0B' }}>
          <span className="zone-rescued-summary-value" style={{ color: '#F59E0B' }}>{injuredCount}</span>
          <span className="zone-rescued-summary-label">{t('rescued.injured')}</span>
        </div>
        <div className="zone-rescued-summary-item" style={{ borderColor: '#EF4444' }}>
          <span className="zone-rescued-summary-value" style={{ color: '#EF4444' }}>{criticalCount}</span>
          <span className="zone-rescued-summary-label">{t('rescued.critical')}</span>
        </div>
      </div>

      <div className="zone-rescued-list">
        {zoneRescued.length === 0 ? (
          <div className="zone-rescued-empty">
            No hay personas rescatadas registradas en esta zona.
          </div>
        ) : (
          zoneRescued.map((person) => {
            const cond = CONDITION_OPTIONS.find((c) => c.key === person.condition);
            return (
              <div key={person.id} className="zone-rescued-item">
                <div className="zone-rescued-item-avatar" style={{ backgroundColor: cond?.color }}>
                  {person.gender === 'femenino' ? '👩' : person.gender === 'masculino' ? '👨' : '🧑'}
                </div>
                <div className="zone-rescued-item-info">
                  <div className="zone-rescued-item-name">{person.name}</div>
                  <div className="zone-rescued-item-meta">
                    {person.age > 0 ? `${person.age} años` : 'Edad no registrada'}
                    {' · '}
                    {person.gender}
                  </div>
                  <div className="zone-rescued-item-time">
                    Rescatado {new Date(person.rescuedAt).toLocaleString('es-VE')}
                  </div>
                  {person.notes && (
                    <div className="zone-rescued-item-notes">📝 {person.notes}</div>
                  )}
                </div>
                <div
                  className="zone-rescued-condition-badge"
                  style={{ backgroundColor: cond ? `${cond.color}22` : 'transparent', color: cond?.color }}
                >
                  {cond?.icon} {cond?.label}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm ? (
        <div className="zone-rescued-form">
          <div className="form-group">
            <label className="form-label">{t('rescued.formName')}</label>
            <input
              className="form-input"
              placeholder="Nombre de la persona rescatada"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">{t('rescued.formAge')}</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="150"
                placeholder="Edad"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">{t('rescued.formGender')}</label>
              <select
                className="form-select"
                value={gender}
                onChange={(e) => setGender(e.target.value as RescuedPerson['gender'])}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('rescued.formCondition')}</label>
            <div className="zone-rescued-condition-select">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`zone-rescued-condition-opt ${condition === opt.key ? 'active' : ''}`}
                  style={{
                    borderColor: opt.color,
                    backgroundColor: condition === opt.key ? `${opt.color}22` : 'transparent',
                    color: condition === opt.key ? opt.color : '#94a3b8',
                  }}
                  onClick={() => setCondition(opt.key)}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('rescued.formNotes')}</label>
            <textarea
              className="form-textarea"
              placeholder="Lesiones, necesidades médicas, destino..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="form-row">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
              {t('rescued.formSubmit')}
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              {t('form.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button className="zone-rescued-add-btn" onClick={() => setShowForm(true)}>
          {t('rescued.registerPerson')}
        </button>
      )}
    </div>
  );
};

export default ZoneRescuedRegistry;
