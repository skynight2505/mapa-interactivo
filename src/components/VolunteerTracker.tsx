import React, { useState, useEffect, useCallback } from 'react';
import type { VolunteerGroup, VolunteerMember, CheckInStatus } from '../types';
import { SPECIALIZATION_LABELS, CHECKIN_STATUS_LABELS } from '../types';
import { useI18n } from '../utils/i18n';

const STORAGE_KEY = 'volunteer_groups';

interface VolunteerTrackerProps {
  zoneName: string;
}

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

const SAMPLE_VOLUNTEERS: VolunteerGroup[] = [
  {
    id: 'vg1', name: 'Equipo Alfa', organization: 'Bomberos Caracas',
    leaderName: 'Carlos Mendoza', leaderPhone: '+58 412-555-1001',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    members: [
      { id: 'vm1', name: 'Carlos Mendoza', specialization: 'bombero', phone: '+58 412-555-1001',
        emergencyContact: 'Ana Mendoza', emergencyPhone: '+58 414-555-2001',
        arrivedAt: new Date(Date.now() - 7200000).toISOString(), status: 'en_zona' },
      { id: 'vm2', name: 'Luis Pérez', specialization: 'rescate_urbano', phone: '+58 412-555-1002',
        emergencyContact: 'María Pérez', emergencyPhone: '+58 414-555-2002',
        arrivedAt: new Date(Date.now() - 7000000).toISOString(), status: 'en_zona' },
      { id: 'vm3', name: 'Pedro García', specialization: 'paramedico', phone: '+58 412-555-1003',
        emergencyContact: 'José García', emergencyPhone: '+58 414-555-2003',
        arrivedAt: new Date(Date.now() - 6800000).toISOString(), status: 'descanso' },
    ],
  },
  {
    id: 'vg2', name: 'Brigada Médica', organization: 'Cruz Roja Venezolana',
    leaderName: 'Dra. María López', leaderPhone: '+58 424-555-3001',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    members: [
      { id: 'vm4', name: 'María López', specialization: 'medico', phone: '+58 424-555-3001',
        emergencyContact: 'Roberto López', emergencyPhone: '+58 416-555-4001',
        arrivedAt: new Date(Date.now() - 5400000).toISOString(), status: 'en_zona' },
      { id: 'vm5', name: 'Ana Torres', specialization: 'psicologo', phone: '+58 424-555-3002',
        emergencyContact: 'Pedro Torres', emergencyPhone: '+58 416-555-4002',
        arrivedAt: new Date(Date.now() - 5000000).toISOString(), status: 'en_zona',
        notes: 'Especialista en trauma y crisis' },
    ],
  },
  {
    id: 'vg3', name: 'Equipo Bravo', organization: 'Defensa Civil',
    leaderName: 'Ramón Torres', leaderPhone: '+58 412-555-5001',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    members: [
      { id: 'vm6', name: 'Ramón Torres', specialization: 'busqueda_rescate', phone: '+58 412-555-5001',
        emergencyContact: 'Carmen Torres', emergencyPhone: '+58 414-555-6001',
        arrivedAt: new Date(Date.now() - 3600000).toISOString(), status: 'en_zona' },
      { id: 'vm7', name: 'Diego Ramírez', specialization: 'ingeniero', phone: '+58 412-555-5002',
        emergencyContact: 'Laura Ramírez', emergencyPhone: '+58 414-555-6002',
        arrivedAt: new Date(Date.now() - 3200000).toISOString(), status: 'regresando' },
      { id: 'vm8', name: 'Sofía Castillo', specialization: 'comunicaciones', phone: '+58 412-555-5003',
        emergencyContact: 'Miguel Castillo', emergencyPhone: '+58 414-555-6003',
        arrivedAt: new Date(Date.now() - 2800000).toISOString(), status: 'en_zona' },
    ],
  },
];

function loadGroups(): VolunteerGroup[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* ignore */ }
  return SAMPLE_VOLUNTEERS;
}

function saveGroups(groups: VolunteerGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

const VolunteerTracker: React.FC<VolunteerTrackerProps> = ({ zoneName }) => {
  const { t } = useI18n();
  const [groups, setGroups] = useState<VolunteerGroup[]>(loadGroups);
  const [expandedGroup, setExpandedGroup] = useState<string | null>('vg1');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for new group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupOrg, setNewGroupOrg] = useState('');
  const [newLeaderName, setNewLeaderName] = useState('');
  const [newLeaderPhone, setNewLeaderPhone] = useState('');
  const [newSpec, setNewSpec] = useState<string>('general');
  const [newEmergName, setNewEmergName] = useState('');
  const [newEmergPhone, setNewEmergPhone] = useState('');

  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  const totalMembers = groups.reduce((sum, g) => sum + g.members.length, 0);
  const inZone = groups.reduce((sum, g) => sum + g.members.filter((m) => m.status === 'en_zona').length, 0);
  const resting = groups.reduce((sum, g) => sum + g.members.filter((m) => m.status === 'descanso').length, 0);
  const returning = groups.reduce((sum, g) => sum + g.members.filter((m) => m.status === 'regresando').length, 0);

  const toggleMemberStatus = useCallback((groupId: string, memberId: string, newStatus: CheckInStatus) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.map((m) =>
                m.id === memberId
                  ? { ...m, status: newStatus, checkedOutAt: newStatus === 'fuera' ? new Date().toISOString() : undefined }
                  : m
              ),
            }
          : g
      )
    );
  }, []);

  const addNewMember = useCallback((groupId: string) => {
    const newMember: VolunteerMember = {
      id: crypto.randomUUID(),
      name: 'Nuevo Voluntario',
      specialization: 'general',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
      arrivedAt: new Date().toISOString(),
      status: 'en_zona',
    };
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, members: [...g.members, newMember] } : g
      )
    );
  }, []);

  const removeMember = useCallback((groupId: string, memberId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, members: g.members.filter((m) => m.id !== memberId) } : g
      )
    );
  }, []);

  const handleAddGroup = () => {
    if (!newGroupName.trim() || !newLeaderName.trim()) return;
    const newGroup: VolunteerGroup = {
      id: crypto.randomUUID(),
      name: newGroupName.trim(),
      organization: newGroupOrg.trim() || 'Sin organización',
      leaderName: newLeaderName.trim(),
      leaderPhone: newLeaderPhone.trim(),
      createdAt: new Date().toISOString(),
      members: [
        {
          id: crypto.randomUUID(),
          name: newLeaderName.trim(),
          specialization: newSpec as VolunteerMember['specialization'],
          phone: newLeaderPhone.trim(),
          emergencyContact: newEmergName.trim(),
          emergencyPhone: newEmergPhone.trim(),
          arrivedAt: new Date().toISOString(),
          status: 'en_zona',
        },
      ],
    };
    setGroups((prev) => [...prev, newGroup]);
    setExpandedGroup(newGroup.id);
    setShowAddForm(false);
    setNewGroupName('');
    setNewGroupOrg('');
    setNewLeaderName('');
    setNewLeaderPhone('');
    setNewSpec('general');
    setNewEmergName('');
    setNewEmergPhone('');
  };

  return (
    <div className="volunteer-tracker">
      {/* Summary Stats */}
      <div className="volunteer-summary">
        <div className="volunteer-summary-title">👥 Voluntarios en {zoneName}</div>
        <div className="volunteer-stats-grid">
          <div className="volunteer-stat">
            <div className="volunteer-stat-value">{totalMembers}</div>
            <div className="volunteer-stat-label">{t('rescued.total')}</div>
          </div>
          <div className="volunteer-stat" style={{ borderColor: '#22C55E' }}>
            <div className="volunteer-stat-value" style={{ color: '#4ADE80' }}>{inZone}</div>
            <div className="volunteer-stat-label">En Zona</div>
          </div>
          <div className="volunteer-stat" style={{ borderColor: '#EAB308' }}>
            <div className="volunteer-stat-value" style={{ color: '#FBBF24' }}>{resting}</div>
            <div className="volunteer-stat-label">Descanso</div>
          </div>
          <div className="volunteer-stat" style={{ borderColor: '#3B82F6' }}>
            <div className="volunteer-stat-value" style={{ color: '#60A5FA' }}>{returning}</div>
            <div className="volunteer-stat-label">Regresando</div>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="volunteer-safety-notice">
        <span className="volunteer-safety-icon">🛡️</span>
        <div className="volunteer-safety-text">
          <strong>Garantía de Seguridad:</strong> Cada voluntario tiene registrado su contacto de emergencia.
          Se verifica el regreso seguro de todos los miembros antes del cierre de la zona.
        </div>
      </div>

      {/* Groups List */}
      <div className="volunteer-groups">
        {groups.map((group) => (
          <div key={group.id} className="volunteer-group">
            <div
              className="volunteer-group-header"
              onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
            >
              <div className="volunteer-group-info">
                <div className="volunteer-group-name">
                  {expandedGroup === group.id ? '▼' : '▶'} {group.name}
                </div>
                <div className="volunteer-group-org">{group.organization}</div>
              </div>
              <div className="volunteer-group-meta">
                <span className="volunteer-group-count">{group.members.length} miembros</span>
                <span className="volunteer-group-leader">👑 {group.leaderName}</span>
              </div>
            </div>

            {expandedGroup === group.id && (
              <div className="volunteer-group-body">
                <div className="volunteer-group-contact">
                  📞 Líder: {group.leaderPhone}
                </div>

                {group.members.map((member) => {
                  const spec = SPECIALIZATION_LABELS[member.specialization];
                  const status = CHECKIN_STATUS_LABELS[member.status];
                  return (
                    <div key={member.id} className={`volunteer-member ${member.status}`}>
                      <div className="volunteer-member-avatar" style={{ backgroundColor: spec.color }}>
                        {spec.icon}
                      </div>
                      <div className="volunteer-member-info">
                        <div className="volunteer-member-name">{member.name}</div>
                        <div className="volunteer-member-spec" style={{ color: spec.color }}>
                          {spec.label}
                        </div>
                        <div className="volunteer-member-contact">
                          📱 {member.phone} · 🆘 {member.emergencyContact}: {member.emergencyPhone}
                        </div>
                        <div className="volunteer-member-time">
                          ⏱️ Llegó hace {formatTime(member.arrivedAt)}
                          {member.checkedOutAt && ` · Salio hace ${formatTime(member.checkedOutAt)}`}
                        </div>
                        {member.notes && (
                          <div className="volunteer-member-notes">📝 {member.notes}</div>
                        )}
                      </div>
                      <div className="volunteer-member-actions">
                        <span
                          className="volunteer-status-badge"
                          style={{ color: status.color, backgroundColor: status.bg }}
                        >
                          {status.label}
                        </span>
                        <div className="volunteer-status-buttons">
                          {(['en_zona', 'descanso', 'regresando', 'fuera'] as CheckInStatus[]).map((s) => (
                            <button
                              key={s}
                              className={`volunteer-status-btn ${member.status === s ? 'active' : ''}`}
                              style={{
                                borderColor: CHECKIN_STATUS_LABELS[s].color,
                                color: member.status === s ? '#fff' : CHECKIN_STATUS_LABELS[s].color,
                                backgroundColor: member.status === s ? CHECKIN_STATUS_LABELS[s].color : 'transparent',
                              }}
                              onClick={() => toggleMemberStatus(group.id, member.id, s)}
                              title={CHECKIN_STATUS_LABELS[s].label}
                            >
                              {s === 'en_zona' ? '📍' : s === 'descanso' ? '😴' : s === 'regresando' ? '🚶' : '🚪'}
                            </button>
                          ))}
                          <button
                            className="volunteer-remove-btn"
                            onClick={() => removeMember(group.id, member.id)}
                            title="Remover miembro"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button className="volunteer-add-member-btn" onClick={() => addNewMember(group.id)}>
                  ➕ Agregar Miembro
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Group */}
      <button className="volunteer-add-group-btn" onClick={() => setShowAddForm(!showAddForm)}>
        ➕ Registrar Nuevo Grupo de Voluntarios
      </button>

      {showAddForm && (
        <div className="volunteer-add-group-form">
          <div className="form-group">
            <label className="form-label">Nombre del Grupo</label>
            <input
              className="form-input"
              placeholder="Ej: Equipo Charlie"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Organización</label>
            <input
              className="form-input"
              placeholder="Ej: Cruz Roja"
              value={newGroupOrg}
              onChange={(e) => setNewGroupOrg(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre del Líder</label>
              <input
                className="form-input"
                placeholder="Nombre completo"
                value={newLeaderName}
                onChange={(e) => setNewLeaderName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono del Líder</label>
              <input
                className="form-input"
                placeholder="+58 412-XXX-XXXX"
                value={newLeaderPhone}
                onChange={(e) => setNewLeaderPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Especialización Principal</label>
            <select
              className="form-select"
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
            >
              {Object.entries(SPECIALIZATION_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contacto de Emergencia (fuera de la zona)</label>
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Nombre del contacto"
                value={newEmergName}
                onChange={(e) => setNewEmergName(e.target.value)}
              />
              <input
                className="form-input"
                placeholder="Teléfono de emergencia"
                value={newEmergPhone}
                onChange={(e) => setNewEmergPhone(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleAddGroup}
          >
            ✅ Registrar Grupo
          </button>
        </div>
      )}
    </div>
  );
};

export default VolunteerTracker;
