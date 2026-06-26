import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../utils/categories';
import type { MapMarker, MarkerType, HelpGroup, Supply, TerrainType } from '../types';
import { TERRAIN_LABELS } from '../types';

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

    onSave(result);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? '✏️ Editar Zona' : '➕ Nueva Zona'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Tipo de zona */}
            <div className="form-group">
              <label className="form-label">Tipo de Zona</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as MarkerType)}
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.type} value={cat.type}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div className="form-group">
              <label className="form-label">Título *</label>
              <input
                className="form-input"
                type="text"
                placeholder="Nombre de la zona"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-textarea"
                placeholder="Describe la situación en esta zona..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Terreno */}
            <div className="form-group">
              <label className="form-label">🏔️ Tipo de Terreno</label>
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
                <label className="form-label">Severidad</label>
                <select
                  className="form-select"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as typeof severity)}
                >
                  <option value="baja">🟢 Baja</option>
                  <option value="media">🟡 Media</option>
                  <option value="alta">🟠 Alta</option>
                  <option value="critica">🔴 Crítica</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={isActive ? 'true' : 'false'}
                  onChange={(e) => setIsActive(e.target.value === 'true')}
                >
                  <option value="true">✅ Activo / Abierto</option>
                  <option value="false">❌ Inactivo / Cerrado</option>
                </select>
              </div>
            </div>

            {/* Coordenadas */}
            <div className="form-group">
              <label className="form-label">📍 Coordenadas</label>
              <div className="form-row">
                <div>
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    placeholder="Latitud"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  />
                  <div className="form-hint">Lat (ej: 10.4806)</div>
                </div>
                <div>
                  <input
                    className="form-input"
                    type="number"
                    step="any"
                    placeholder="Longitud"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  />
                  <div className="form-hint">Lng (ej: -66.9036)</div>
                </div>
              </div>
            </div>

            {/* Grupos de ayuda */}
            <div className="form-group">
              <div className="form-section-title">👥 Grupos de Ayuda</div>
              {groups.map((group, i) => (
                <div key={group.id} className="form-group" style={{ marginBottom: 12 }}>
                  <div className="form-row">
                    <input
                      className="form-input"
                      placeholder="Nombre del grupo"
                      value={group.name}
                      onChange={(e) => updateGroup(i, 'name', e.target.value)}
                    />
                    <input
                      className="form-input"
                      placeholder="Contacto (teléfono)"
                      value={group.contact}
                      onChange={(e) => updateGroup(i, 'contact', e.target.value)}
                    />
                  </div>
                  <div className="form-row" style={{ marginTop: 8 }}>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Miembros"
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
                ➕ Agregar grupo
              </button>
            </div>

            {/* Insumos */}
            <div className="form-group">
              <div className="form-section-title">📦 Insumos</div>
              {supplies.map((supply, i) => (
                <div key={supply.id} className="form-group" style={{ marginBottom: 12 }}>
                  <div className="form-row-3">
                    <input
                      className="form-input"
                      placeholder="Nombre del insumo"
                      value={supply.name}
                      onChange={(e) => updateSupply(i, 'name', e.target.value)}
                    />
                    <input
                      className="form-input"
                      type="number"
                      placeholder="Cantidad"
                      value={supply.quantity}
                      onChange={(e) => updateSupply(i, 'quantity', parseInt(e.target.value) || 0)}
                    />
                    <input
                      className="form-input"
                      placeholder="Unidad"
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
                      <option value="needed">⚠️ Necesitado</option>
                      <option value="available">✅ Disponible</option>
                      <option value="delivered">🚚 Entregado</option>
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
                ➕ Agregar insumo
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? '💾 Guardar Cambios' : '➕ Crear Zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkerForm;
