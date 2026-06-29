import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapMarker, MarkerType, RescuedPerson, GroupZone } from '../types';
import { CATEGORIES } from '../utils/categories';
import { useI18n } from '../utils/i18n';
import { tMarkerContent } from '../utils/translateContent';


interface Cluster {
  lat: number;
  lng: number;
  markers: MapMarker[];
  count: number;
}

interface SearchTarget {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
}

interface GoogleMapProps {
  markers: MapMarker[];
  groupZones: GroupZone[];
  activeFilters: MarkerType[];
  selectedId: string | null;
  onMarkerClick: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onGroupClick?: (groupId: string) => void;
  activeGroupId?: string | null;
  rescuedPersons?: RescuedPerson[];
  showRescuedLayer?: boolean;
  highlightedRescuedId?: string | null;
  onHighlightRescuedClear?: () => void;
  searchTarget?: SearchTarget | null;
  onClearSearchTarget?: () => void;
}

function createDivIcon(html: string, size: number, className = ''): L.DivIcon {
  return L.divIcon({
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: className || undefined,
  });
}

function pinHtml(type: MarkerType, isSelected: boolean, verified?: boolean): string {
  const cat = CATEGORIES[type];
  if (!cat) return `<div style="width:36px;height:36px;border-radius:50%;background:#64748b;display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff">❓</div>`;
  const s = isSelected ? 44 : 36;
  const border = verified ? '2px solid #22c55e' : isSelected ? '3px solid #fff' : 'none';
  const shadow = verified ? '0 0 12px rgba(34,197,94,0.5)' : isSelected ? '0 0 12px rgba(255,255,255,0.4)' : '0 2px 6px rgba(0,0,0,0.3)';
  return `<div style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${cat.color};border:${border};opacity:${isSelected ? 1 : 0.9};font-size:${s * 0.45}px;box-shadow:${shadow};transition:all 0.2s">${cat.icon}</div>`;
}

function markerClusterHtml(count: number): string {
  const s = Math.min(56, 36 + count * 3);
  const color = count >= 8 ? '#EF4444' : count >= 4 ? '#F59E0B' : '#3B82F6';
  return `<div style="width:${s}px;height:${s}px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.6);font-size:${s * 0.22}px;color:#fff;font-weight:bold;box-shadow:0 2px 12px rgba(0,0,0,0.5);cursor:pointer"><span>📌</span><span>${count}</span></div>`;
}

function groupZoneHtml(_name: string, count: number): string {
  return `<div style="width:56px;height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:14px;background:linear-gradient(135deg,#7C3AED,#6366F1);border:3px solid #A78BFA;font-size:18px;color:#fff;font-weight:bold;box-shadow:0 4px 16px rgba(124,58,237,0.5);cursor:pointer;transition:all 0.2s"><span>📋</span><span style="font-size:11px;margin-top:2px">${count}</span></div>`;
}

function rescuedHtml(condition: string): string {
  const color = condition === 'bueno' ? '#22C55E' : condition === 'herido' ? '#F59E0B' : '#EF4444';
  const icon = condition === 'bueno' ? '✅' : condition === 'herido' ? '⚠️' : '🚑';
  return `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${color};border:2px solid #fff;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${icon}</div>`;
}

function clusterPersons(persons: RescuedPerson[], minDistance = 0.003): { lat: number; lng: number; persons: RescuedPerson[]; count: number }[] {
  if (persons.length === 0) return [];
  const clusters: { lat: number; lng: number; persons: RescuedPerson[]; count: number }[] = [];
  const used = new Set<string>();
  for (const person of persons) {
    if (used.has(person.id)) continue;
    const group: RescuedPerson[] = [person];
    used.add(person.id);
    for (const other of persons) {
      if (used.has(other.id)) continue;
      const dist = Math.sqrt(Math.pow(person.lat - other.lat, 2) + Math.pow(person.lng - other.lng, 2));
      if (dist < minDistance) {
        group.push(other);
        used.add(other.id);
      }
    }
    const avgLat = group.reduce((s, p) => s + p.lat, 0) / group.length;
    const avgLng = group.reduce((s, p) => s + p.lng, 0) / group.length;
    clusters.push({ lat: avgLat, lng: avgLng, persons: group, count: group.length });
  }
  return clusters;
}

function clusterMarkers(markers: MapMarker[], minDistance: number): Cluster[] {
  if (markers.length === 0) return [];
  const clusters: Cluster[] = [];
  const used = new Set<string>();
  for (const marker of markers) {
    if (used.has(marker.id)) continue;
    const group: MapMarker[] = [marker];
    used.add(marker.id);
    for (const other of markers) {
      if (used.has(other.id)) continue;
      const dist = Math.sqrt(Math.pow(marker.lat - other.lat, 2) + Math.pow(marker.lng - other.lng, 2));
      if (dist < minDistance) {
        group.push(other);
        used.add(other.id);
      }
    }
    const avgLat = group.reduce((s, m) => s + m.lat, 0) / group.length;
    const avgLng = group.reduce((s, m) => s + m.lng, 0) / group.length;
    clusters.push({ lat: avgLat, lng: avgLng, markers: group, count: group.length });
  }
  return clusters;
}

function getClusterDistance(zoom: number): number {
  if (zoom <= 7) return 0.08;
  if (zoom <= 9) return 0.04;
  if (zoom <= 11) return 0.02;
  if (zoom <= 13) return 0.008;
  return 0.003;
}

export default function GoogleMap({
  markers, groupZones, activeFilters, selectedId, onMarkerClick, onMapClick, onGroupClick, activeGroupId,
  rescuedPersons = [], showRescuedLayer = false,
  highlightedRescuedId, onHighlightRescuedClear,
  searchTarget, onClearSearchTarget,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const clusterLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const groupZoneLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const rescuedLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const [mapReady, setMapReady] = useState(false);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;
  const onGroupClickRef = useRef(onGroupClick);
  onGroupClickRef.current = onGroupClick;
  const renderAllRef = useRef<() => void>(() => {});
  const { lang, t } = useI18n();

  const visibleMarkers = activeFilters.length === 0
    ? markers
    : markers.filter((m) => activeFilters.includes(m.type));

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Let Leaflet detect touch natively; only assist if detection failed
    if (('ontouchstart' in window || navigator.maxTouchPoints > 0) && !L.Browser.touch) {
      (L.Browser as Record<string, boolean>).touch = true;
    }

    const map = L.map(mapRef.current, {
      center: [7.0, -66.0],
      zoom: 6,
      minZoom: 5,
      maxBounds: L.latLngBounds(L.latLng(0, -76), L.latLng(13, -58)),
      maxBoundsViscosity: 0.8,
      zoomControl: true,
      attributionControl: false,
      tapTolerance: 5,
      bounceAtZoomLimits: false,
      worldCopyJump: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: 'center',
      boxZoom: true,
      closePopupOnClick: false,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      inertia: true,
      inertiaDeceleration: 5000,
      inertiaMaxSpeed: 1500,
      easeLinearity: 0.2,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickRef.current) onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    map.on('zoomend', () => {
      try { renderAllRef.current(); } catch {}
    });
    map.on('moveend', () => {
      try { renderAllRef.current(); } catch {}
    });

    markersLayerRef.current.addTo(map);
    clusterLayerRef.current.addTo(map);
    groupZoneLayerRef.current.addTo(map);
    rescuedLayerRef.current.addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Watch container for size changes (mobile keyboard, address bar, rotation)
    let resizeTimer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => map.invalidateSize(), 100);
    });
    ro.observe(mapRef.current);

    // Touch state cleanup: if pinch/touch gets stuck, reset dragging on next interaction
    const container = map.getContainer();
    const resetTouch = () => {
      // Leaflet sometimes leaves dragging enabled but in a stuck state
      // after interrupted gestures on some Android devices
      requestAnimationFrame(() => {
        try {
          if (map.dragging && !(map.dragging as L.Handler & { enabled: () => boolean }).enabled()) {
            (map.dragging as L.Handler & { enable: () => void }).enable();
          }
          if (map.touchZoom && !(map.touchZoom as L.Handler & { enabled: () => boolean }).enabled()) {
            (map.touchZoom as L.Handler & { enable: () => void }).enable();
          }
        } catch {}
      });
    };
    container.addEventListener('touchend', resetTouch, { passive: true });
    container.addEventListener('touchcancel', resetTouch, { passive: true });
    // Also reset when the view changes (zoomend/moveend fires after any gesture)
    map.on('zoomend', resetTouch);
    map.on('moveend', resetTouch);

    return () => {
      clearTimeout(resizeTimer);
      ro.disconnect();
      container.removeEventListener('touchend', resetTouch);
      container.removeEventListener('touchcancel', resetTouch);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  function renderAll() {
    const map = mapInstanceRef.current;
    if (!map) return;
    const zoom = map.getZoom();
    const minDistance = getClusterDistance(zoom);

    // --- Group Zones (always rendered) ---
    const gzLayer = groupZoneLayerRef.current;
    gzLayer.clearLayers();
    groupZones.forEach(zone => {
      const icon = createDivIcon(groupZoneHtml(zone.name, zone.markerIds.length), 56, 'cluster-marker');
      const marker = L.marker([zone.lat, zone.lng], { icon }).addTo(gzLayer);
      marker.bindTooltip(
        `<strong style="font-size:13px;">📋 ${zone.name}</strong><br/><span style="font-size:11px;color:#94a3b8;">${zone.markerIds.length} zonas agrupadas</span>`,
        { direction: 'top', offset: L.point(0, -28), className: 'leaflet-tooltip-custom' }
      );
      marker.on('click', () => {
        if (zone.id !== activeGroupId) {
          try { map.setView([zone.lat, zone.lng], Math.min(zoom + 2, 16), { animate: true }); } catch {}
        }
        if (onGroupClickRef.current) onGroupClickRef.current(zone.id);
      });
    });

    // --- Ungrouped markers: auto-cluster or individual ---
    const mkrLayer = markersLayerRef.current;
    const clLayer = clusterLayerRef.current;
    mkrLayer.clearLayers();
    clLayer.clearLayers();

    // Determine which group is active (prop passed from parent)
    const ungroupedIds = new Set(groupZones.flatMap(z => z.markerIds));
    const ungrouped = visibleMarkers.filter(m => !ungroupedIds.has(m.id));

    // Only show grouped markers when their group is active
    if (activeGroupId) {
      const zone = groupZones.find(z => z.id === activeGroupId);
      if (zone) {
        zone.markerIds.forEach(id => {
          const data = visibleMarkers.find(m => m.id === id);
          if (!data) return;
          const isSelected = data.id === selectedId;
          const icon = createDivIcon(pinHtml(data.type, isSelected, data.verified), isSelected ? 44 : 36);
          const marker = L.marker([data.lat, data.lng], { icon }).addTo(mkrLayer);
          const translatedTitle = tMarkerContent(data, lang, 'title');
          marker.bindTooltip(`<strong>${translatedTitle}</strong>`, {
            direction: 'top', offset: L.point(0, -18), className: 'leaflet-tooltip-custom', sticky: true,
          });
          marker.on('click', () => onMarkerClickRef.current(data));
        });
      }
    }

    // Ungrouped: cluster when zoomed out
    if (zoom >= 14 || ungrouped.length <= 5) {
      ungrouped.forEach((data) => {
        const isSelected = data.id === selectedId;
        const icon = createDivIcon(pinHtml(data.type, isSelected, data.verified), isSelected ? 44 : 36);
        const marker = L.marker([data.lat, data.lng], { icon }).addTo(mkrLayer);
        const translatedTitle = tMarkerContent(data, lang, 'title');
        marker.bindTooltip(`<strong>${translatedTitle}</strong>`, {
          direction: 'top', offset: L.point(0, -18), className: 'leaflet-tooltip-custom', sticky: true,
        });
        marker.on('click', () => onMarkerClickRef.current(data));
      });
    } else {
      const clusters = clusterMarkers(ungrouped, minDistance);
      clusters.forEach(cluster => {
        if (cluster.count === 1) {
          const data = cluster.markers[0];
          const isSelected = data.id === selectedId;
          const icon = createDivIcon(pinHtml(data.type, isSelected, data.verified), isSelected ? 44 : 36);
          const marker = L.marker([data.lat, data.lng], { icon }).addTo(mkrLayer);
          const translatedTitle = tMarkerContent(data, lang, 'title');
          marker.bindTooltip(`<strong>${translatedTitle}</strong>`, {
            direction: 'top', offset: L.point(0, -18), className: 'leaflet-tooltip-custom', sticky: true,
          });
          marker.on('click', () => onMarkerClickRef.current(data));
        } else {
          const icon = createDivIcon(markerClusterHtml(cluster.count), Math.min(56, 36 + cluster.count * 3), 'cluster-marker');
          const marker = L.marker([cluster.lat, cluster.lng], { icon }).addTo(clLayer);
          const listHtml = cluster.markers.map(m => {
            const cat = CATEGORIES[m.type];
            return `<div style="padding:2px 0;font-size:11px;"><span>${cat.icon}</span> <strong>${m.title}</strong> <span style="color:#94a3b8;font-size:10px;">(${cat.label})</span></div>`;
          }).join('');
          marker.bindTooltip(
            `<strong style="font-size:12px;">📌 ${cluster.count} zonas</strong><br/><div style="margin-top:4px;max-height:200px;overflow-y:auto;">${listHtml}</div>`,
            { direction: 'top', offset: L.point(0, -28), className: 'leaflet-tooltip-custom' }
          );
          marker.on('click', () => {
            map.setView([cluster.lat, cluster.lng], Math.min(zoom + 2, 16), { animate: true });
          });
        }
      });
    }
  }

  renderAllRef.current = renderAll;

  // Re-render when markers, groupZones, filters, selectedId, lang, or activeGroupId change
  useEffect(() => {
    renderAllRef.current();
  }, [visibleMarkers, groupZones, selectedId, lang, activeGroupId]);

  // Selected marker pan
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;
    const m = markers.find(m => m.id === selectedId);
    if (m) {
      map.setView([m.lat, m.lng], Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [selectedId, markers]);

  // Rescued persons layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layer = rescuedLayerRef.current;
    layer.clearLayers();

    if (!showRescuedLayer || rescuedPersons.length === 0) return;

    const clusters = clusterPersons(rescuedPersons);
    const zoom = map.getZoom();

    if (zoom >= 14 || rescuedPersons.length <= 10) {
      rescuedPersons.forEach(person => {
        const icon = createDivIcon(rescuedHtml(person.condition), 28, 'rescued-marker');
        const marker = L.marker([person.lat, person.lng], { icon }).addTo(layer);
        const terrainInfo = person.terrain ? ` · ${person.terrain}` : '';
        marker.bindTooltip(
          `<strong>🏥 ${person.name}</strong><br/>
          <span style="font-size:11px;color:#999;">${person.age}a · ${person.gender}${terrainInfo}</span><br/>
          <span style="font-size:11px;font-weight:600;color:${person.condition === 'bueno' ? '#22C55E' : person.condition === 'herido' ? '#F59E0B' : '#EF4444'}">${person.condition.toUpperCase()}</span>`,
          { direction: 'top', offset: L.point(0, -14), className: 'leaflet-tooltip-custom' }
        );
      });
    } else {
      clusters.forEach(cluster => {
        const icon = createDivIcon(markerClusterHtml(cluster.count), Math.min(60, 40 + cluster.count * 4), 'cluster-marker');
        const marker = L.marker([cluster.lat, cluster.lng], { icon }).addTo(layer);

        const personsList = cluster.persons.map(p =>
          `<div style="padding:2px 0;font-size:11px;"><strong>${p.name}</strong> (${p.age}a) - <span style="color:${p.condition === 'bueno' ? '#22C55E' : p.condition === 'herido' ? '#F59E0B' : '#EF4444'};font-weight:600;">${p.condition}</span></div>`
        ).join('');
        marker.bindTooltip(
          `<strong>${cluster.count} ${t('btn.rescuedPersons')}</strong><br/><div style="margin-top:4px">${personsList}</div>`,
          { direction: 'top', offset: L.point(0, -30), className: 'leaflet-tooltip-custom' }
        );

        marker.on('click', () => {
          map.setView([cluster.lat, cluster.lng], Math.min(zoom + 2, 18), { animate: true });
        });
      });
    }
  }, [showRescuedLayer, rescuedPersons]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !highlightedRescuedId || !showRescuedLayer) return;

    const person = rescuedPersons.find(p => p.id === highlightedRescuedId);
    if (!person) return;

    map.setView([person.lat, person.lng], 17, { animate: true });

    const icon = createDivIcon(rescuedHtml(person.condition), 28, 'rescued-marker');
    const highlightMarker = L.marker([person.lat, person.lng], { icon }).addTo(map);

    const terrainInfo = person.terrain ? ` · ${person.terrain}` : '';
    highlightMarker.bindTooltip(
      `<strong>🔍 ${person.name}</strong><br/>
      <span style="font-size:11px;color:#999;">${person.age}a · ${person.gender}${terrainInfo}</span><br/>
      <span style="font-size:11px;font-weight:600;color:${person.condition === 'bueno' ? '#22C55E' : person.condition === 'herido' ? '#F59E0B' : '#EF4444'}">${person.condition.toUpperCase()}</span>`,
      { direction: 'top', offset: L.point(0, -14), className: 'leaflet-tooltip-custom' }
    ).openTooltip();

    const timer = setTimeout(() => {
      highlightMarker.remove();
      if (onHighlightRescuedClear) onHighlightRescuedClear();
    }, 3000);
    return () => {
      clearTimeout(timer);
      highlightMarker.remove();
    };
  }, [highlightedRescuedId, showRescuedLayer, rescuedPersons, onHighlightRescuedClear]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !searchTarget) return;
    map.flyTo([searchTarget.lat, searchTarget.lng], 13, { animate: true, duration: 1.5 });
    const icon = createDivIcon(
      `<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#3b82f6;border:3px solid #fff;font-size:20px;box-shadow:0 0 20px rgba(59,130,246,0.6);cursor:pointer">📍</div>`,
      40, 'search-target-marker'
    );
    const marker = L.marker([searchTarget.lat, searchTarget.lng], { icon }).addTo(map);
    marker.bindTooltip(`<strong>${searchTarget.name}</strong><br/><span style="font-size:11px;color:#94a3b8;">${t('map.clickForOptions')}</span>`, {
      direction: 'top', offset: L.point(0, -20), className: 'leaflet-tooltip-custom'
    }).openTooltip();
    marker.on('click', () => {
      marker.unbindTooltip();
      marker.bindPopup(`
        <div style="min-width:200px;">
          <strong style="font-size:14px;">📍 ${searchTarget.name}</strong>
          <div style="margin:8px 0;display:flex;flex-direction:column;gap:4px;">
            <button class="search-popup-btn search-popup-btn-remove" data-action="remove">
              ${t('map.removeMarker')}
            </button>
          </div>
        </div>
      `, { className: 'search-popup', closeButton: true }).openPopup();
      marker.getPopup()?.on('remove', () => {
        marker.bindTooltip(`<strong>${searchTarget.name}</strong>`, {
          direction: 'top', offset: L.point(0, -20), className: 'leaflet-tooltip-custom'
        });
      });
    });
    marker.on('popupopen', () => {
      const el = marker.getPopup()?.getElement();
      if (!el) return;
      const btn = el.querySelector('[data-action="remove"]');
      if (btn) {
        btn.addEventListener('click', () => { onClearSearchTarget?.(); map.closePopup(); }, { once: true });
      }
    });
    return () => { marker.remove(); };
  }, [searchTarget, onClearSearchTarget]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {!mapReady && (
        <div className="map-loading">
          <div className="map-loading-spinner" />
          <span>{t('map.loading')}</span>
        </div>
      )}
    </div>
  );
}
