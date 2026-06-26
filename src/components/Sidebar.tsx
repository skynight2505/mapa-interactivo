import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '../utils/categories';
import type { MapMarker } from '../types';
import { useI18n } from '../utils/i18n';

interface SidebarProps {
  markers: MapMarker[];
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
}

const Sidebar: React.FC<SidebarProps> = ({
  markers,
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
}) => {
  const [search, setSearch] = useState('');
  const { t } = useI18n();

  const filtered = useMemo(() => {
    if (!search.trim()) return markers;
    const q = search.toLowerCase();
    return markers.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        CATEGORIES[m.type].label.toLowerCase().includes(q)
    );
  }, [markers, search]);

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
          {filtered.length === 0 ? (
            <div className="sidebar-empty">
              <div className="sidebar-empty-icon">📋</div>
              <div className="sidebar-empty-text">
                {search ? t('sidebar.noResults') : t('sidebar.noZones')}
              </div>
            </div>
          ) : (
            filtered.map((marker) => {
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
                    <div className="marker-card-title">{marker.title}</div>
                    <div className="marker-card-desc">{marker.description}</div>
                    <div className="marker-card-meta">
                      <span
                        className="marker-card-badge"
                        style={{
                          backgroundColor: cat.bgColor,
                          color: cat.color,
                        }}
                      >
                        {cat.label}
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
                          {marker.severity}
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
                          title="Editar"
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
                          title="Eliminar"
                          className="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('¿Eliminar esta zona?')) {
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
        </div>

        {userCanAdd && (
          <div className="sidebar-footer">
            <button className="add-marker-btn" onClick={onAddNew}>
              {t('sidebar.addNew')}
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
