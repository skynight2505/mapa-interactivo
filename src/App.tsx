import { useState, useCallback, useEffect, useRef } from 'react';
import React from 'react';
import { useI18n } from './utils/i18n';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import Sidebar from './components/Sidebar';
import GoogleMap from './components/Map';

import MarkerPopup from './components/MarkerPopup';
import MapSearch from './components/MapSearch';
import MarkerForm from './components/MarkerForm';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import RescuerModePanel from './components/RescuerModePanel';
import RescuedExportPanel from './components/RescuedExportPanel';
import OnboardingGuide from './components/OnboardingGuide';
import { loadMarkers, saveMarkers, addMarker, updateMarker, deleteMarker, tryLoadFromCloud, saveRescuedPersons, tryLoadRescuedFromCloud, getAllGroupZones, addGroupZone, updateGroupZone, deleteGroupZone, tryLoadGroupZonesFromCloud } from './utils/storage';
import { getCurrentUser, logout, canEdit, canAdd, canDelete, type User } from './utils/auth';
import { importFromJSON, exportToJSON, exportToCSV, exportRescuedJSON, exportRescuedCSV } from './utils/export';
import { generateAutoNotifications, requestNotificationPermission } from './utils/notifications';
import { SAMPLE_MARKERS } from './data/sampleData';
import type { MapMarker, MarkerType, RescuedPerson, GroupZone } from './types';

// ===== IMPORT MODAL =====
interface ImportModalProps {
  onImport: (markers: MapMarker[]) => void;
  onClose: () => void;
  error: string;
  setError: (e: string) => void;
}

function ImportModal({ onImport, onClose, error, setError }: ImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const markers = await importFromJSON(file);
      onImport(markers);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('import.error'));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('import.title')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 16 }}>
            {t('import.desc')}
            {t('import.desc2')}
          </p>

          <div className="import-dropzone" onClick={() => fileRef.current?.click()}>
            {t('import.dropzone')}
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
          <button className="btn btn-secondary" onClick={onClose}>{t('form.cancel')}</button>
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
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [searchTarget, setSearchTarget] = useState<{ lat: number; lng: number; name: string; displayName: string } | null>(null);
  const [groupZones, setGroupZones] = useState<GroupZone[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [desktopMode, setDesktopMode] = useState(
    () => localStorage.getItem('mapa-desktop-mode') === 'true'
  );
  const { t } = useI18n();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768
  );

  // Sync sidebar collapsed state with screen size and desktop mode
  useEffect(() => {
    if (desktopMode) {
      setSidebarCollapsed(false);
      return;
    }
    const onResize = () => setSidebarCollapsed(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [desktopMode]);

  const handleToggleDesktopMode = useCallback(() => {
    setDesktopMode(prev => {
      const next = !prev;
      localStorage.setItem('mapa-desktop-mode', String(next));
      return next;
    });
  }, []);

    // Load all cloud data in parallel, then fall back to local
    useEffect(() => {
      // Cache-busting: force reload if app version changed
      const APP_VERSION = '2026-06-28-v2';
      try {
        const prev = localStorage.getItem('mapa-app-version');
        if (prev && prev !== APP_VERSION) {
          if ('caches' in window) {
            caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
          }
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => {
              regs.forEach(r => r.unregister());
            });
          }
          localStorage.clear();
          sessionStorage.clear();
          localStorage.setItem('mapa-app-version', APP_VERSION);
          window.location.reload();
          return;
        }
        localStorage.setItem('mapa-app-version', APP_VERSION);
      } catch { /* ignore */ }

      // Clean up old cached earthquake data
      try {
        localStorage.removeItem('mapa-earthquake-events');
        localStorage.removeItem('mapa-terremoto-notifications');
      } catch { /* ignore */ }
  
      setUser(getCurrentUser());
      requestNotificationPermission();

    // Load all cloud data in parallel
    Promise.all([
      tryLoadFromCloud(),
      tryLoadRescuedFromCloud(),
      tryLoadGroupZonesFromCloud(),
    ]).then(([cloudMarkers, cloudRescued, cloudGroups]) => {
      // Markers
      if (cloudMarkers && cloudMarkers.length > 0) {
        setMarkers(cloudMarkers);
      } else {
        let markerData = loadMarkers();
        if (markerData.length === 0) {
          saveMarkers(SAMPLE_MARKERS);
          markerData = SAMPLE_MARKERS;
        }
        setMarkers(markerData);
      }

      // Rescued persons
      if (cloudRescued && cloudRescued.length > 0) {
        setRescuedPersons(cloudRescued);
      } else {
        try {
          const saved = localStorage.getItem('rescued_persons');
          if (saved) {
            const rescuedData: RescuedPerson[] = JSON.parse(saved);
            if (rescuedData.length > 0) setRescuedPersons(rescuedData);
          }
        } catch { /* ignore */ }
      }

      // Group zones
      if (cloudGroups && cloudGroups.length > 0) {
        setGroupZones(cloudGroups);
      } else {
        setGroupZones(getAllGroupZones());
      }

      // Auto-group only now: both markers AND groups are settled
      setLoading(false);
    });

    // Auto-sync every 30s: silently refresh data from cloud
    const pollInterval = setInterval(() => {
      tryLoadFromCloud().then(data => { if (data) setMarkers(data); });
      tryLoadRescuedFromCloud().then(data => { if (data) setRescuedPersons(data); });
      tryLoadGroupZonesFromCloud().then(data => { if (data) setGroupZones(data); });
    }, 30000);
    return () => clearInterval(pollInterval);

  }, []);

  // Auto-group: run once after cloud data is loaded
  const didAutoGroup = useRef(false);
  useEffect(() => {
    if (markers.length > 0 && !loading && !didAutoGroup.current) {
      didAutoGroup.current = true;
      const timer = setTimeout(() => autoDetectGroups(), 400);
      return () => clearTimeout(timer);
    }
  }, [markers.length, loading]);

  const handleUpdateMarker = useCallback((id: string, updates: Partial<MapMarker>) => {
    setMarkers((prev) => {
      const updated = prev.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      );
      saveMarkers(updated);
      return updated;
    });
  }, []);

  const handleAddRescued = useCallback((person: RescuedPerson) => {
    setRescuedPersons(prev => {
      const exists = prev.findIndex(p => p.id === person.id);
      const updated = exists >= 0
        ? prev.map((p, i) => i === exists ? person : p)
        : [...prev, person];
      saveRescuedPersons(updated);
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
    setActiveGroupId(prev => {
      if (!marker) return prev;
      const zone = groupZones.find(z => z.markerIds.includes(marker.id));
      return zone ? zone.id : prev;
    });
  }, [groupZones]);

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
    } else {
      setActiveGroupId(null);
    }
  }, [isPlacingMarker]);

  const handleSaveMarker = useCallback((marker: MapMarker) => {
    let updated: MapMarker[];
    if (editingMarker) {
      updated = updateMarker(marker);
    } else {
      updated = addMarker(marker);
      generateAutoNotifications([marker]);
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
    if (isRescueMode) {
      setIsRescueMode(false);
      return;
    }
    setSelectedId(null);
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
    if (!user) return;
    setIsEditMode((prev) => !prev);
    if (isRescueMode) setIsRescueMode(false);
  }, [isRescueMode, user]);

  const handleToggleRescue = useCallback(() => {
    if (!isRescueMode && !selectedId) {
      return; // Can't enter rescue mode without a selected marker
    }
    setIsRescueMode((prev) => !prev);
    if (isEditMode) setIsEditMode(false);
  }, [isEditMode, isRescueMode, selectedId]);

  const handleRefreshMap = useCallback(async () => {
    setRefreshLoading(true);
    try {
      const merged = await tryLoadFromCloud();
      if (merged && merged.length > 0) {
        setMarkers(merged);
        saveMarkers(merged);
      }
      const rescued = await tryLoadRescuedFromCloud();
      if (rescued && rescued.length > 0) {
        setRescuedPersons(rescued);
        saveRescuedPersons(rescued);
      }
      const groupZs = await tryLoadGroupZonesFromCloud();
      if (groupZs && groupZs.length > 0) {
        setGroupZones(groupZs);
      }
    } finally {
      setRefreshLoading(false);
    }
  }, []);

  const autoDetectGroups = useCallback(() => {
    // Known Venezuelan cities and their neighborhoods/urbanizations
    const NEIGHBORHOODS: Record<string, string[]> = {
      'caracas': [
        'petare', 'chacao', 'baruta', 'el hatillo', 'la candelaria', 'el paraíso', 'el paraiso',
        'la florida', 'los palos grandes', 'las mercedes', 'altamira', 'sabana grande',
        'el rosal', 'la castellana', 'los chorros', 'santa edu vigis', 'sebucán', 'sebucan',
        'la carlota', 'bello monte', 'colinas de bello monte', 'san bernardino',
        'san agustín', 'san agustin', 'el silencio', 'catia', '23 de enero',
        'antímano', 'antimano', 'el valle', 'caricuao', 'la vega', 'san juan',
        'san josé', 'san jose', 'la pastora', 'el junquito', 'macarao', 'la trinidad',
        'parque central', 'la yaguara', 'gato negro', 'propatria', 'lomas de ½aro',
        'la bandeja', 'el cementerio', 'coche', 'el peñón', 'el penon',
      ],
      'la guaira': [
        'maiquetía', 'maiquetia', 'catia la mar', 'macuto', 'caraballeda',
        'naiguatá', 'naiguata', 'pariata', 'punta de mulatos', 'tanaguarena',
      ],
      'maracaibo': [
        'bella vista', 'la vereda del lago', 'el milagro', 'santa lucía', 'santa lucia',
        'las delicias', 'ziruma', 'la limpia', 'haticos', 'san jacinto',
        'venezuela', 'el taladro', 'la salina', 'el varillal',
      ],
      'valencia': [
        'el viñedo', 'el vinedo', 'la isabelica', 'naguanagua', 'san diego',
        'los guayos', 'prebo', 'guaparo', 'la valencia', 'la viña', 'el trigal',
        'candelaria', 'san blas',
      ],
      'barquisimeto': [
        'cabudare', 'las trinitarias', 'el obelisco', 'bararida', 'santa rosa',
        'el cují', 'el cuji', 'la erita', 'la florida',
      ],
      'maracay': [
        'las delicias', 'san jacinto', 'santa rita', 'caña de azúcar', 'caña de azucar',
        'la floresta', 'san miguel', 'los almendrones', 'pedernales', 'la soledad',
      ],
    };

    const ALL_CITIES = Object.keys(NEIGHBORHOODS);

    // Skip markers that already have a parentGroupId
    const ungrouped = markers.filter(m => !m.parentGroupId);

    // Extract city + neighborhood from marker title/description
    function extractLocation(m: MapMarker): { city: string; neighborhood: string | null; rawHood: string | null } {
      const text = (m.title + ' ' + (m.description || '')).toLowerCase();
      for (const [city, hoods] of Object.entries(NEIGHBORHOODS)) {
        for (const hood of hoods) {
          if (text.includes(hood)) {
            const cityName = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            return { city: cityName, neighborhood: hood, rawHood: hood };
          }
        }
      }
      for (const city of ALL_CITIES) {
        if (text.includes(city)) {
          const cityName = city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          return { city: cityName, neighborhood: null, rawHood: null };
        }
      }
      return { city: '', neighborhood: null, rawHood: null };
    }

    // First pass: assign markers to (city, rawHood) buckets
    const bucketMap = new Map<string, MapMarker[]>();
    const bucketKey = (loc: { city: string; rawHood: string | null }) => loc.rawHood || loc.city;
    for (const m of ungrouped) {
      const loc = extractLocation(m);
      if (!loc.city) continue;
      const key = bucketKey(loc);
      if (!bucketMap.has(key)) bucketMap.set(key, []);
      bucketMap.get(key)!.push(m);
    }

    // Only process buckets with 3+ markers
    const significant = Array.from(bucketMap.entries()).filter(([, mks]) => mks.length >= 3);
    if (significant.length === 0) return;

    // Derive group name from most frequent word in marker titles (≥4 chars)
    function deriveName(mks: MapMarker[], fallback: string): string {
      const freq: Record<string, number> = {};
      for (const m of mks) {
        const words = m.title.split(/[-–—,;\s]+/).map(w => w.trim().toLowerCase()).filter(w => w.length >= 4);
        for (const w of words) {
          freq[w] = (freq[w] || 0) + 1;
        }
      }
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0 && sorted[0][1] >= 2) {
        return sorted[0][0].charAt(0).toUpperCase() + sorted[0][0].slice(1);
      }
      return fallback.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    const groupedNames = new Set(groupZones.map(z => z.name));
    const newZones: GroupZone[] = [];

    for (const [key, mks] of significant) {
      const name = deriveName(mks, key);

      // If a group with this name already exists, merge markers into it
      if (groupedNames.has(name)) {
        const existing = groupZones.find(z => z.name === name)!;
        const mergedIds = [...new Set([...existing.markerIds, ...mks.map(m => m.id)])];
        const avgLat = mks.reduce((s, m) => s + m.lat, 0) / mks.length;
        const avgLng = mks.reduce((s, m) => s + m.lng, 0) / mks.length;
        const updatedZones = updateGroupZone({ ...existing, markerIds: mergedIds, lat: avgLat, lng: avgLng, updatedAt: new Date().toISOString() });
        setGroupZones(updatedZones);
        setMarkers(prev => {
          const next = prev.map(m => mks.some(c => c.id === m.id) ? { ...m, parentGroupId: existing.id, updatedAt: new Date().toISOString() } : m);
          saveMarkers(next);
          return next;
        });
        continue;
      }

      newZones.push({
        id: crypto.randomUUID(),
        name,
        lat: mks.reduce((s, m) => s + m.lat, 0) / mks.length,
        lng: mks.reduce((s, m) => s + m.lng, 0) / mks.length,
        markerIds: mks.map(m => m.id),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    if (newZones.length === 0) return;

    const allZones = [...groupZones, ...newZones];
    setGroupZones(allZones);
    newZones.forEach(z => addGroupZone(z));
    setMarkers(prev => {
      const next = prev.map(m => {
        const zone = newZones.find(z => z.markerIds.includes(m.id));
        return zone ? { ...m, parentGroupId: zone.id, updatedAt: new Date().toISOString() } : m;
      });
      saveMarkers(next);
      return next;
    });
  }, [markers, groupZones]);

  const handleCreateGroupZone = useCallback((name: string, markerIds: string[]) => {
    if (markerIds.length === 0) return;
    const markersToGroup = markers.filter(m => markerIds.includes(m.id));
    if (markersToGroup.length === 0) return;
    const finalName = name.trim();

    // If group with same name exists, merge markers into it
    const existing = groupZones.find(z => z.name === finalName);
    if (existing) {
      const mergedIds = [...new Set([...existing.markerIds, ...markerIds])];
      const mergedMarkers = markers.filter(m => mergedIds.includes(m.id));
      const avgLat = mergedMarkers.reduce((s, m) => s + m.lat, 0) / mergedMarkers.length;
      const avgLng = mergedMarkers.reduce((s, m) => s + m.lng, 0) / mergedMarkers.length;
      const updated = updateGroupZone({ ...existing, markerIds: mergedIds, lat: avgLat, lng: avgLng, updatedAt: new Date().toISOString() });
      setGroupZones(updated);
      setMarkers(prev => {
        const next = prev.map(m => markerIds.includes(m.id) ? { ...m, parentGroupId: existing.id, updatedAt: new Date().toISOString() } : m);
        saveMarkers(next);
        return next;
      });
      return;
    }

    const avgLat = markersToGroup.reduce((s, m) => s + m.lat, 0) / markersToGroup.length;
    const avgLng = markersToGroup.reduce((s, m) => s + m.lng, 0) / markersToGroup.length;
    const zone: GroupZone = {
      id: crypto.randomUUID(),
      name: finalName,
      lat: avgLat,
      lng: avgLng,
      markerIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = addGroupZone(zone);
    setGroupZones(updated);
    setMarkers(prev => {
      const next = prev.map(m => markerIds.includes(m.id) ? { ...m, parentGroupId: zone.id, updatedAt: new Date().toISOString() } : m);
      saveMarkers(next);
      return next;
    });
  }, [markers, groupZones]);

  const handleDeleteGroupZone = useCallback((groupId: string) => {
    const updated = deleteGroupZone(groupId);
    setGroupZones(updated);
    // Unlink markers from this group
    setMarkers(prev => {
      const next = prev.map(m => m.parentGroupId === groupId ? { ...m, parentGroupId: undefined, updatedAt: new Date().toISOString() } : m);
      saveMarkers(next);
      return next;
    });
  }, []);

  const handleRemoveMarkerFromGroup = useCallback((groupId: string, markerId: string) => {
    const zones = getAllGroupZones();
    const zone = zones.find(z => z.id === groupId);
    if (!zone) return;
    const updated = updateGroupZone({ ...zone, markerIds: zone.markerIds.filter(id => id !== markerId) });
    setGroupZones(updated);
    setMarkers(prev => {
      const next = prev.map(m => m.id === markerId ? { ...m, parentGroupId: undefined, updatedAt: new Date().toISOString() } : m);
      saveMarkers(next);
      return next;
    });
  }, []);

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
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Cargando...</p>
        </div>
      )}
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
        desktopMode={desktopMode}
        onToggleDesktopMode={handleToggleDesktopMode}
      />

      <FilterBar
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        onClearFilters={handleClearFilters}
      />

      <div className={`app-body${desktopMode ? ' desktop-mode' : ''}`}>
        <Sidebar
          markers={markers}
          groupZones={groupZones}
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
          onCreateGroup={handleCreateGroupZone}
          onDeleteGroup={handleDeleteGroupZone}
          onRemoveFromGroup={handleRemoveMarkerFromGroup}
        />

        <div className="map-container">
          <MapSearch
            onSelect={(r) => setSearchTarget({ lat: r.lat, lng: r.lng, name: r.displayName.split(',')[0], displayName: r.displayName })}
            onClear={() => setSearchTarget(null)}
            userCanEdit={userCanEdit}
            onAddMarker={(lat, lng) => { setNewMarkerCoords({ lat, lng }); setIsPlacingMarker(true); setShowForm(true); }}
            markers={markers}
            onViewMarker={(id) => handleSelectMarker(markers.find(m => m.id === id)!)}
          />
          <GoogleMap
            markers={markers}
            groupZones={groupZones}
            activeFilters={activeFilters}
            selectedId={selectedId}
            onMarkerClick={handleSelectMarker}
            onMapClick={handleMapClick}
            onGroupClick={(groupId) => {
              setActiveGroupId(prev => prev === groupId ? null : groupId);
            }}
            activeGroupId={activeGroupId}
            rescuedPersons={rescuedPersons}
            showRescuedLayer={showRescuedLayer}
            highlightedRescuedId={highlightedRescuedId}
            onHighlightRescuedClear={() => setHighlightedRescuedId(null)}
            searchTarget={searchTarget}
            onClearSearchTarget={() => setSearchTarget(null)}
          />

          <div className="map-layer-toggle">
            <button
              className={`map-layer-btn ${showRescuedLayer ? 'active' : ''}`}
              onClick={() => setShowRescuedLayer(prev => !prev)}
              title={showRescuedLayer ? t('map.layerHide') : t('map.layerShow')}
            >
              🏥 {t('btn.rescuedPersons')} {showRescuedLayer ? 'ON' : 'OFF'}
              {rescuedPersons.length > 0 && <span className="map-layer-count">{rescuedPersons.length}</span>}
            </button>
          </div>

          {isPlacingMarker && (
            <div className="click-marker-prompt">
              {t('map.clickToPlace')}
              <button
                className="click-marker-cancel"
                onClick={() => setIsPlacingMarker(false)}
              >
                {t('map.cancel')}
              </button>
            </div>
          )}

          {selectedMarker && !showForm && !isRescueMode && (
            <MarkerPopup marker={selectedMarker} onClose={handleClosePopup} userCanEdit={userCanEdit} />
          )}

          {selectedMarker && isRescueMode && (
            <RescuerModePanel
              marker={selectedMarker}
              rescuedPersons={rescuedPersons}
              onClose={handleClosePopup}
              onUpdateMarker={handleUpdateMarker}
              onAddRescued={handleAddRescued}
            />
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
            onClose={() => setShowRescuedPanel(false)}
          />
        )}

        {showAdminPanel && userCanEdit && (
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
            onRefreshMap={handleRefreshMap}
            refreshLoading={refreshLoading}
            onAutoGroup={autoDetectGroups}
          />
        )}

        <OnboardingGuide />
      </div>
    </div>
  );
}

export default App;
