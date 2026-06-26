import { useState, useCallback, useEffect, useRef } from 'react';
import React from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar';
import GoogleMap from './components/Map';
import MarkerPopup from './components/MarkerPopup';
import MarkerForm from './components/MarkerForm';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import RescuerModePanel from './components/RescuerModePanel';
import RescuedExportPanel from './components/RescuedExportPanel';
import { loadMarkers, saveMarkers, addMarker, updateMarker, deleteMarker } from './utils/storage';
import { getCurrentUser, logout, canEdit, canAdd, canDelete, type User } from './utils/auth';
import { importFromJSON, exportToJSON, exportToCSV, exportRescuedJSON, exportRescuedCSV } from './utils/export';
import { generateAutoNotifications, requestNotificationPermission } from './utils/notifications';
import { SAMPLE_MARKERS } from './data/sampleData';
import type { MapMarker, MarkerType, RescuedPerson } from './types';

// ===== IMPORT MODAL =====
interface ImportModalProps {
  onImport: (markers: MapMarker[]) => void;
  onClose: () => void;
  error: string;
  setError: (e: string) => void;
}

function ImportModal({ onImport, onClose, error, setError }: ImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const markers = await importFromJSON(file);
      onImport(markers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al importar');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Importar Datos</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 16 }}>
            Selecciona un archivo JSON exportado desde esta aplicación para importar los datos.
            Los marcadores existentes se mantendrán y se agregarán los nuevos.
          </p>

          <div className="import-dropzone" onClick={() => fileRef.current?.click()}>
            📁 Haz clic aquí para seleccionar un archivo JSON
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>

          {error && <div className="login-error" style={{ marginTop: 12 }}>⚠️ {error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN APP =====
function App() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<MarkerType[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMarker, setEditingMarker] = useState<MapMarker | null>(null);
  const [newMarkerCoords, setNewMarkerCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');
  const [isRescueMode, setIsRescueMode] = useState(false);
  const [showRescuedPanel, setShowRescuedPanel] = useState(false);
  const [rescuedPersons, setRescuedPersons] = useState<RescuedPerson[]>([]);
  const [showRescuedLayer, setShowRescuedLayer] = useState(false);
  const [highlightedRescuedId, setHighlightedRescuedId] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Load markers, check auth, and generate notifications on mount
  useEffect(() => {
    setUser(getCurrentUser());
    requestNotificationPermission();

    let markerData = loadMarkers();
    if (markerData.length === 0) {
      saveMarkers(SAMPLE_MARKERS);
      markerData = SAMPLE_MARKERS;
    }
    setMarkers(markerData);
    generateAutoNotifications(markerData);

    // Load rescued persons from localStorage
    try {
      const saved = localStorage.getItem('rescued_persons');
      if (saved) {
        const rescuedData: RescuedPerson[] = JSON.parse(saved);
        if (rescuedData.length > 0) setRescuedPersons(rescuedData);
      }
    } catch { /* ignore */ }
  }, []);

  const handleAddRescued = useCallback((person: RescuedPerson) => {
    setRescuedPersons(prev => {
      const updated = [...prev, person];
      localStorage.setItem('rescued_persons', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSearchRescued = useCallback((person: RescuedPerson) => {
    setHighlightedRescuedId(person.id);
    setShowRescuedLayer(true);
  }, []);

  const selectedMarker = markers.find((m) => m.id === selectedId) || null;
  const userCanEdit = canEdit(user);
  const userCanAdd = canAdd(user);
  const userCanDelete = canDelete(user);

  const handleToggleFilter = useCallback((type: MarkerType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveFilters([]);
  }, []);

  const handleSelectMarker = useCallback((marker: MapMarker) => {
    setSelectedId(marker.id);
    setSidebarCollapsed(false);
  }, []);

  const handleDeleteMarker = useCallback((id: string) => {
    const updated = deleteMarker(id);
    setMarkers(updated);
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleEditMarker = useCallback((marker: MapMarker) => {
    setEditingMarker(marker);
    setShowForm(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingMarker(null);
    setNewMarkerCoords(null);
    if (isPlacingMarker) {
      setIsPlacingMarker(false);
    } else {
      setIsPlacingMarker(true);
    }
  }, [isPlacingMarker]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isPlacingMarker) {
      setNewMarkerCoords({ lat, lng });
      setIsPlacingMarker(false);
      setEditingMarker(null);
      setShowForm(true);
    }
  }, [isPlacingMarker]);

  const handleSaveMarker = useCallback((marker: MapMarker) => {
    let updated: MapMarker[];
    if (editingMarker) {
      updated = updateMarker(marker);
    } else {
      updated = addMarker(marker);
    }
    setMarkers(updated);
    setShowForm(false);
    setEditingMarker(null);
    setNewMarkerCoords(null);
    setSelectedId(marker.id);
  }, [editingMarker]);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingMarker(null);
    setNewMarkerCoords(null);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedId(null);
    if (isRescueMode) setIsRescueMode(false);
  }, [isRescueMode]);

  const handleLogin = useCallback(() => {
    setUser(getCurrentUser());
    setShowLogin(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setIsEditMode(false);
    setIsRescueMode(false);
  }, []);

  const handleToggleEdit = useCallback(() => {
    if (!userCanEdit && !userCanAdd) {
      setShowLogin(true);
      return;
    }
    setIsEditMode((prev) => !prev);
    if (isRescueMode) setIsRescueMode(false);
  }, [userCanEdit, userCanAdd, isRescueMode]);

  const handleToggleRescue = useCallback(() => {
    setIsRescueMode((prev) => !prev);
    if (isEditMode) setIsEditMode(false);
    if (!isRescueMode && !selectedId) {
      // If no marker selected, can't enter rescue mode
      return;
    }
  }, [isEditMode, isRescueMode, selectedId]);

  const handleImportConfirm = useCallback((imported: MapMarker[]) => {
    const existing = loadMarkers();
    const existingIds = new Set(existing.map((m) => m.id));
    const newMarkers = imported.filter((m) => !existingIds.has(m.id));
    const merged = [...existing, ...newMarkers];
    saveMarkers(merged);
    setMarkers(merged);
    generateAutoNotifications(newMarkers);
    setShowImportModal(false);
    setImportError('');
  }, []);

  return (
    <div className="app-layout">
      <Header
        isEditMode={isEditMode}
        onToggleMode={handleToggleEdit}
        markerCount={markers.length}
        user={user}
        userCanEdit={userCanEdit}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onExportJSON={() => exportToJSON(markers)}
        onExportCSV={() => exportToCSV(markers)}
        onImportClick={() => setShowImportModal(true)}
        onRescuedClick={() => setShowRescuedPanel(true)}
        isRescueMode={isRescueMode}
        onToggleRescue={handleToggleRescue}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      <FilterBar
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        onClearFilters={handleClearFilters}
      />

      <div className="app-body">
        <Sidebar
          markers={markers}
          selectedId={selectedId}
          onSelect={handleSelectMarker}
          onDelete={handleDeleteMarker}
          onEdit={handleEditMarker}
          isEditMode={isEditMode}
          userCanEdit={userCanEdit}
          userCanDelete={userCanDelete}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onAddNew={handleAddNew}
          userCanAdd={userCanAdd}
        />

        <div className="map-container">
          <GoogleMap
            markers={markers}
            activeFilters={activeFilters}
            selectedId={selectedId}
            onMarkerClick={handleSelectMarker}
            onMapClick={handleMapClick}
            rescuedPersons={rescuedPersons}
            showRescuedLayer={showRescuedLayer}
            onToggleRescuedLayer={() => setShowRescuedLayer(prev => !prev)}
            highlightedRescuedId={highlightedRescuedId}
            onHighlightRescuedClear={() => setHighlightedRescuedId(null)}
          />

          {isPlacingMarker && (
            <div className="click-marker-prompt">
              📍 Haz clic en el mapa para colocar la nueva zona
              <button
                className="click-marker-cancel"
                onClick={() => setIsPlacingMarker(false)}
              >
                Cancelar
              </button>
            </div>
          )}

          {selectedMarker && !showForm && !isRescueMode && (
            <MarkerPopup marker={selectedMarker} onClose={handleClosePopup} />
          )}

          {selectedMarker && isRescueMode && (
            <RescuerModePanel marker={selectedMarker} onClose={handleClosePopup} />
          )}
        </div>

        {showForm && (
          <MarkerForm
            marker={editingMarker}
            defaultLat={newMarkerCoords?.lat}
            defaultLng={newMarkerCoords?.lng}
            onSave={handleSaveMarker}
            onClose={handleCloseForm}
          />
        )}

        {showLogin && (
          <LoginScreen onLogin={handleLogin} />
        )}

        {showImportModal && (
          <ImportModal
            onImport={handleImportConfirm}
            onClose={() => { setShowImportModal(false); setImportError(''); }}
            error={importError}
            setError={setImportError}
          />
        )}

        {showRescuedPanel && (
          <RescuedExportPanel
            rescuedPersons={rescuedPersons}
            onAddPerson={handleAddRescued}
            onExportJSON={(data) => exportRescuedJSON(data)}
            onExportCSV={(data) => exportRescuedCSV(data)}
            onSearchResult={handleSearchRescued}
            searchHighlight={highlightedRescuedId}
          />
        )}

        {showAdminPanel && userCanEdit && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}
      </div>
    </div>
  );
}

export default App;
