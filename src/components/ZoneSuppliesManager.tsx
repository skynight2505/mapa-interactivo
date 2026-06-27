import React, { useState } from 'react';
import type { Supply } from '../types';

interface ZoneSuppliesManagerProps {
  supplies: Supply[];
  onUpdate: (supplies: Supply[]) => void;
}

const SUPPLY_PRESETS = [
  'Agua embotellada', 'Comida enlatada', 'Leche en polvo', 'Fórmula infantil',
  'Pañales', 'Medicamentos', 'Antibióticos', 'Analgésicos',
  'Gasas', 'Vendajes', 'Alcohol', 'Guantes quirúrgicos',
  'Mascarillas', 'Mantas', 'Ropa', 'Calzado',
  'Linternas', 'Pilas', 'Velas', 'Fósforos',
  'Radio portátil', 'Cuerda', 'Cinta adhesiva', 'Plástico para toldo',
];

interface SupplyFormState {
  name: string;
  quantity: string;
  unit: string;
  status: 'needed' | 'available' | 'delivered';
}

const INITIAL_FORM: SupplyFormState = { name: '', quantity: '1', unit: 'unidad', status: 'needed' };

const STATUS_OPTIONS: { key: Supply['status']; label: string; color: string }[] = [
  { key: 'needed', label: 'Necesitado', color: '#EF4444' },
  { key: 'available', label: 'Disponible', color: '#22C55E' },
  { key: 'delivered', label: 'Entregado', color: '#3B82F6' },
];

const ZoneSuppliesManager: React.FC<ZoneSuppliesManagerProps> = ({ supplies, onUpdate }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<SupplyFormState>(INITIAL_FORM);
  const [showPresets, setShowPresets] = useState(false);

  const addSupply = () => {
    if (!form.name.trim()) return;
    const newSupply: Supply = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      quantity: parseInt(form.quantity) || 1,
      unit: form.unit.trim() || 'unidad',
      status: form.status,
    };
    onUpdate([...supplies, newSupply]);
    setForm(INITIAL_FORM);
    setShowAdd(false);
  };

  const removeSupply = (id: string) => {
    onUpdate(supplies.filter((s) => s.id !== id));
  };

  const cycleStatus = (supply: Supply) => {
    const order: Supply['status'][] = ['needed', 'available', 'delivered'];
    const idx = order.indexOf(supply.status);
    return order[(idx + 1) % order.length];
  };

  const toggleStatus = (supply: Supply) => {
    onUpdate(supplies.map((s) =>
      s.id === supply.id ? { ...s, status: cycleStatus(s) } : s
    ));
  };

  const selectPreset = (name: string) => {
    setForm((prev) => ({ ...prev, name }));
    setShowPresets(false);
  };

  const needed = supplies.filter((s) => s.status === 'needed').length;
  const available = supplies.filter((s) => s.status === 'available').length;
  const delivered = supplies.filter((s) => s.status === 'delivered').length;

  return (
    <div className="zone-supplies-manager">
      <div className="zone-supplies-summary">
        <div className="zone-supplies-summary-item" style={{ borderColor: '#EF4444' }}>
          <span className="zone-supplies-summary-value" style={{ color: '#EF4444' }}>{needed}</span>
          <span className="zone-supplies-summary-label">Necesitados</span>
        </div>
        <div className="zone-supplies-summary-item" style={{ borderColor: '#22C55E' }}>
          <span className="zone-supplies-summary-value" style={{ color: '#22C55E' }}>{available}</span>
          <span className="zone-supplies-summary-label">Disponibles</span>
        </div>
        <div className="zone-supplies-summary-item" style={{ borderColor: '#3B82F6' }}>
          <span className="zone-supplies-summary-value" style={{ color: '#3B82F6' }}>{delivered}</span>
          <span className="zone-supplies-summary-label">Entregados</span>
        </div>
      </div>

      <div className="zone-supplies-list">
        {supplies.length === 0 ? (
          <div className="zone-supplies-empty">
            No hay insumos registrados. Agrega los que necesita esta zona.
          </div>
        ) : (
          supplies.map((supply) => {
            const statusColor = STATUS_OPTIONS.find((s) => s.key === supply.status)?.color || '#64748b';
            return (
              <div key={supply.id} className="zone-supply-item">
                <div className="zone-supply-item-info">
                  <div className="zone-supply-item-name">{supply.name}</div>
                  <div className="zone-supply-item-qty">{supply.quantity} {supply.unit}</div>
                </div>
                <button
                  className="zone-supply-status-btn"
                  style={{ backgroundColor: statusColor, borderColor: statusColor }}
                  onClick={() => toggleStatus(supply)}
                  title="Cambiar estado"
                >
                  {supply.status === 'needed' ? '⚠️' : supply.status === 'available' ? '✅' : '🚚'}
                  {' '}
                  {STATUS_OPTIONS.find((s) => s.key === supply.status)?.label}
                </button>
                <button
                  className="zone-supply-remove-btn"
                  onClick={() => removeSupply(supply.id)}
                  title="Eliminar insumo"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>

      {showAdd ? (
        <div className="zone-supplies-form">
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Insumo</label>
            <input
              className="form-input"
              placeholder="Nombre del insumo"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              onFocus={() => setShowPresets(true)}
            />
            {showPresets && (
              <div className="zone-supplies-presets">
                {SUPPLY_PRESETS.filter((p) => p.toLowerCase().includes(form.name.toLowerCase()))
                  .map((preset) => (
                    <button
                      key={preset}
                      className="zone-supplies-preset-item"
                      onClick={() => selectPreset(preset)}
                    >
                      {preset}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Cantidad</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Unidad</label>
              <input
                className="form-input"
                placeholder="kg, L, caja..."
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estado inicial</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Supply['status'] }))}
            >
              <option value="needed">⚠️ Necesitado</option>
              <option value="available">✅ Disponible</option>
              <option value="delivered">🚚 Entregado</option>
            </select>
          </div>
          <div className="form-row">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={addSupply}>
              ✅ Agregar
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowAdd(false); setShowPresets(false); }}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button className="zone-supplies-add-btn" onClick={() => setShowAdd(true)}>
          ➕ Agregar Insumo
        </button>
      )}
    </div>
  );
};

export default ZoneSuppliesManager;
