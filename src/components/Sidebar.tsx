import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '../utils/categories';
import type { MapMarker, GroupZone } from '../types';
import { useI18n } from '../utils/i18n';
import { tCategory, tSeverity, tMarkerContent } from '../utils/translateContent';
import LinkifiedText from './LinkifiedText';

interface SidebarProps {
  markers: MapMarker[];
  groupZones?: GroupZone[];
  selectedId: string | null;
  onSelect: (marker: MapMarker) => void;
  onDelete: (id: string) => void;
  onEdit: (marker: MapMarker) => void;
  isEditMode: boolean;
  userCanEdit: boolean;
  userCanDelete: boolean;
  userCanAdd: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAddNew: () => void;
  onCreateGroup?: (name: string, markerIds: string[]) => void;
  onDeleteGroup?: (groupId: string) => void;
  onRemoveFromGroup?: (groupId: string, markerId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  markers,
  groupZones = [],
  selectedId,
  onSelect,
  onDelete,
  onEdit,
  isEditMode,
  userCanEdit,
  userCanDelete,
  userCanAdd,
  collapsed,
  onToggleCollapse,
  onAddNew,
  onCreateGroup = () => {},
  onDeleteGroup = () => {},

  onRemoveFromGroup = () => {},
}) => {
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [selectedForGroup, setSelectedForGroup] = useState<Set<string>>(new Set());
  const { t, lang } = useI18n();

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return markers;
    const q = search.toLowerCase();
    return markers.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        tCategory(m.type, lang).toLowerCase().includes(q)
    );
  }, [markers, search, lang]);

  const handleCreateGroup = () => {
    if (!groupNameInput.trim() || selectedForGroup.size === 0) return;
    onCreateGroup(groupNameInput.trim(), Array.from(selectedForGroup));
    setShowCreateGroup(false);
    setGroupNameInput('');
    setSelectedForGroup(new Set());
  };

  const toggleSelectForGroup = (id: string) => {
    setSelectedForGroup(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const groupMarkers = (groupId: string): MapMarker[] => {
    const zone = groupZones.find(z => z.id === groupId);
    if (!zone) return [];
    return markers.filter(m => zone.markerIds.includes(m.id));
  };

  const ungroupedMarkers = useMemo(() => {
    const groupedIds = new Set(groupZones.flatMap(z => z.markerIds));
    return filtered.filter(m => !groupedIds.has(m.id));
  }, [filtered, groupZones]);

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-search">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('sidebar.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="sidebar-list">
          {/* Group Zones */}
          {groupZones.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('sidebar.zones')}</div>
              {groupZones.map(zone => {
                const isExpanded = expandedGroups.has(zone.id);
                const children = groupMarkers(zone.id);
                return (
                  <div key={zone.id} className="group-card">
                    <div className="group-card-header" onClick={() => toggleGroup(zone.id)}>
                      <span className="group-card-icon">📋</span>
                      <div className="group-card-info">
                        <strong>{zone.name}</strong>
                        <span className="group-card-count">{children.length} zonas</span>
                      </div>
                      <span className="group-card-toggle">{isExpanded ? '▾' : '▸'}</span>
                      {isEditMode && (
                        <button
                          className="group-card-delete"
                          title="Eliminar grupo"
                          onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar este grupo?')) onDeleteGroup(zone.id); }}
                        >🗑️</button>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="group-card-children">
                        {children.length === 0 ? (
                          <div className="sidebar-empty-text" style={{ padding: '8px 12px', fontSize: 12 }}>Sin zonas</div>
                        ) : (
                          children.map(marker => {
                            const cat = CATEGORIES[marker.type];
                            return (
                              <div
                                key={marker.id}
                                className={`marker-card ${selectedId === marker.id ? 'selected' : ''}`}
                                onClick={() => onSelect(marker)}
                              >
                                <div className="marker-card-icon" style={{ backgroundColor: cat.bgColor }}>
                                  {cat.icon}
                                </div>
                                <div className="marker-card-content">
                                  <div className="marker-card-title">
                                    {tMarkerContent(marker, lang, 'title')}
                                    {marker.verified && <span className="verified-badge-sm">✅</span>}
                                  </div>
                                  <div className="marker-card-meta">
                                    <span className="marker-card-badge" style={{ backgroundColor: cat.bgColor, color: cat.color }}>
                                      {tCategory(marker.type, lang)}
                                    </span>
                                    {marker.severity && (
                                      <span className="marker-card-badge" style={{
                                        backgroundColor: marker.severity === 'critica' ? '#FEE2E2' : marker.severity === 'alta' ? '#FFF7ED' : marker.severity === 'media' ? '#FEFCE8' : '#F0FDF4',
                                        color: marker.severity === 'critica' ? '#DC2626' : marker.severity === 'alta' ? '#EA580C' : marker.severity === 'media' ? '#CA8A04' : '#16A34A',
                                      }}>
                                        {tSeverity(marker.severity, lang)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {isEditMode && (
                                  <button
                                    className="marker-card-remove-group"
                                    title="Quitar del grupo"
                                    onClick={(e) => { e.stopPropagation(); onRemoveFromGroup(zone.id, marker.id); }}
                                  >✕</button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Group Mode */}
          {isEditMode && showCreateGroup && (
            <div className="create-group-form">
              <strong style={{ color: '#e2e8f0', fontSize: 13, marginBottom: 8, display: 'block' }}>
                📋 {t('sidebar.addNew')}
              </strong>
              <input
                type="text"
                placeholder="Nombre del grupo (ej: Catia)"
                value={groupNameInput}
                onChange={e => setGroupNameInput(e.target.value)}
                className="create-group-input"
              />
              <p style={{ color: '#94a3b8', fontSize: 11, margin: '6px 0' }}>
                Selecciona las zonas que irán dentro del grupo:
              </p>
              <div className="create-group-select-list">
                {ungroupedMarkers.map(m => (
                  <label key={m.id} className="create-group-item" onClick={() => toggleSelectForGroup(m.id)}>
                    <input
                      type="checkbox"
                      checked={selectedForGroup.has(m.id)}
                      onChange={() => toggleSelectForGroup(m.id)}
                    />
                    <span>{CATEGORIES[m.type].icon}</span>
                    <span style={{ fontSize: 12 }}>{m.title}</span>
                  </label>
                ))}
                {ungroupedMarkers.length === 0 && (
                  <span style={{ color: '#64748b', fontSize: 12 }}>No hay zonas sin grupo</span>
                )}
              </div>
              <div className="create-group-actions">
                <button className="btn btn-primary" onClick={handleCreateGroup} disabled={!groupNameInput.trim() || selectedForGroup.size === 0}>
                  Crear Grupo ({selectedForGroup.size})
                </button>
                <button className="btn btn-secondary" onClick={() => { setShowCreateGroup(false); setSelectedForGroup(new Set()); }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Ungrouped markers */}
          {groupZones.length > 0 && ungroupedMarkers.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('sidebar.zones')}</div>
            </div>
          )}
          {ungroupedMarkers.length === 0 && !showCreateGroup ? (
            <div className="sidebar-empty">
              <div className="sidebar-empty-icon">📋</div>
              <div className="sidebar-empty-text">
                {search ? t('sidebar.noResults') : t('sidebar.noZones')}
              </div>
            </div>
          ) : (
            !showCreateGroup && ungroupedMarkers.map((marker) => {
              const cat = CATEGORIES[marker.type];
              return (
                <div
                  key={marker.id}
                  className={`marker-card ${selectedId === marker.id ? 'selected' : ''}`}
                  onClick={() => onSelect(marker)}
                >
                  <div
                    className="marker-card-icon"
                    style={{ backgroundColor: cat.bgColor }}
                  >
                    {cat.icon}
                  </div>
                  <div className="marker-card-content">
                    <div className="marker-card-title">
                      {tMarkerContent(marker, lang, 'title')}
                      {marker.verified && <span className="verified-badge-sm">✅</span>}
                    </div>
                    <div className="marker-card-desc"><LinkifiedText text={tMarkerContent(marker, lang, 'description')} /></div>
                    <div className="marker-card-meta">
                      <span
                        className="marker-card-badge"
                        style={{
                          backgroundColor: cat.bgColor,
                          color: cat.color,
                        }}
                      >
                        {tCategory(marker.type, lang)}
                      </span>
                      {marker.severity && (
                        <span
                          className="marker-card-badge"
                          style={{
                            backgroundColor:
                              marker.severity === 'critica'
                                ? '#FEE2E2'
                                : marker.severity === 'alta'
                                ? '#FFF7ED'
                                : marker.severity === 'media'
                                ? '#FEFCE8'
                                : '#F0FDF4',
                            color:
                              marker.severity === 'critica'
                                ? '#DC2626'
                                : marker.severity === 'alta'
                                ? '#EA580C'
                                : marker.severity === 'media'
                                ? '#CA8A04'
                                : '#16A34A',
                          }}
                        >
                          {tSeverity(marker.severity, lang)}
                        </span>
                      )}
                      {marker.groups.length > 0 && (
                        <span className="marker-card-badge" style={{ backgroundColor: '#DBEAFE', color: '#2563EB' }}>
                          👥 {marker.groups.length}
                        </span>
                      )}
                      {marker.supplies.length > 0 && (
                        <span className="marker-card-badge" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
                          📦 {marker.supplies.length}
                        </span>
                      )}
                    </div>
                  </div>
                  {isEditMode && (userCanEdit || userCanDelete) && (
                    <div className="marker-card-actions">
                      {userCanEdit && (
                        <button
                          title={t('sidebar.edit')}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(marker);
                          }}
                        >
                          ✏️
                        </button>
                      )}
                      {userCanDelete && (
                        <button
                          title={t('sidebar.delete')}
                          className="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t('sidebar.confirmDelete'))) {
                              onDelete(marker.id);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="sidebar-count">
          {t('sidebar.showing')} {filtered.length} {t('sidebar.of')} {markers.length} {t('sidebar.zones')}
          {groupZones.length > 0 && <> · {groupZones.length} grupos</>}
        </div>

        {userCanAdd && (
          <div className="sidebar-footer">
            <button className="add-marker-btn" onClick={onAddNew}>
              {t('sidebar.addNew')}
            </button>
            <button
              className="add-marker-btn"
              style={{ borderColor: '#7C3AED', color: '#A78BFA', marginTop: 6 }}
              onClick={() => { setShowCreateGroup(true); }}
            >
              📋 Crear Grupo
            </button>
          </div>
        )}
      </aside>
      <button
        className={`sidebar-toggle ${collapsed ? 'shifted' : ''}`}
        onClick={onToggleCollapse}
      >
        {collapsed ? '▶' : '◀'}
      </button>
    </>
  );
};

export default Sidebar;
