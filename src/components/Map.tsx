import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapMarker, MarkerType, RescuedPerson } from '../types';
import { CATEGORIES } from '../utils/categories';

interface Cluster {
  lat: number;
  lng: number;
  persons: RescuedPerson[];
  count: number;
}

interface GoogleMapProps {
  markers: MapMarker[];
  activeFilters: MarkerType[];
  selectedId: string | null;
  onMarkerClick: (marker: MapMarker) => void;
  onMapClick?: (lat: number, lng: number) => void;
  rescuedPersons?: RescuedPerson[];
  showRescuedLayer?: boolean;
  onToggleRescuedLayer?: () => void;
  highlightedRescuedId?: string | null;
  onHighlightRescuedClear?: () => void;
}

function clusterPersons(persons: RescuedPerson[], minDistance = 0.003): Cluster[] {
  if (persons.length === 0) return [];
  const clusters: Cluster[] = [];
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

function createDivIcon(html: string, size: number, className = ''): L.DivIcon {
  return L.divIcon({
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className: className || undefined,
  });
}

function pinHtml(type: MarkerType, isSelected: boolean): string {
  const cat = CATEGORIES[type];
  const s = isSelected ? 44 : 36;
  return `<div style="width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${cat.color};border:${isSelected ? '3px solid #fff' : 'none'};opacity:${isSelected ? 1 : 0.9};font-size:${s * 0.45}px;box-shadow:${isSelected ? '0 0 12px rgba(255,255,255,0.4)' : '0 2px 6px rgba(0,0,0,0.3)'};transition:all 0.2s">${cat.icon}</div>`;
}

function clusterHtml(count: number): string {
  const s = Math.min(60, 40 + count * 4);
  const color = count >= 10 ? '#EF4444' : count >= 5 ? '#F59E0B' : '#22C55E';
  return `<div style="width:${s}px;height:${s}px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;background:${color};border:2px solid #fff;font-size:${s * 0.22}px;color:#fff;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.4)"><span>🏥</span><span>${count}</span></div>`;
}

function rescuedHtml(condition: string): string {
  const color = condition === 'bueno' ? '#22C55E' : condition === 'herido' ? '#F59E0B' : '#EF4444';
  const icon = condition === 'bueno' ? '✅' : condition === 'herido' ? '⚠️' : '🚑';
  return `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${color};border:2px solid #fff;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${icon}</div>`;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  markers, activeFilters, selectedId, onMarkerClick, onMapClick,
  rescuedPersons = [], showRescuedLayer = false, onToggleRescuedLayer,
  highlightedRescuedId, onHighlightRescuedClear,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const rescuedLayerRef = useRef<L.LayerGroup>(L.layerGroup());
  const [mapReady, setMapReady] = useState(false);

  const visibleMarkers = activeFilters.length === 0
    ? markers
    : markers.filter((m) => activeFilters.includes(m.type));

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [7.0, -66.0],
      zoom: 6,
      minZoom: 5,
      maxBounds: L.latLngBounds(L.latLng(0, -76), L.latLng(13, -58)),
      maxBoundsViscosity: 1,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    markersLayerRef.current.addTo(map);
    rescuedLayerRef.current.addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    visibleMarkers.forEach((data) => {
      const isSelected = data.id === selectedId;
      const icon = createDivIcon(pinHtml(data.type, isSelected), isSelected ? 44 : 36);
      const marker = L.marker([data.lat, data.lng], { icon }).addTo(layer);

      marker.bindTooltip(`<strong>${data.title}</strong>`, {
        direction: 'top',
        offset: L.point(0, -18),
        className: 'leaflet-tooltip-custom',
      });

      marker.on('click', () => onMarkerClick(data));
    });

    if (selectedId) {
      const m = markers.find(m => m.id === selectedId);
      if (m) {
        map.setView([m.lat, m.lng], Math.max(map.getZoom(), 14), { animate: true });
      }
    }
  }, [visibleMarkers, selectedId, onMarkerClick]);

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
        const icon = createDivIcon(clusterHtml(cluster.count), Math.min(60, 40 + cluster.count * 4), 'cluster-marker');
        const marker = L.marker([cluster.lat, cluster.lng], { icon }).addTo(layer);

        const personsList = cluster.persons.map(p =>
          `<div style="padding:2px 0;font-size:11px;"><strong>${p.name}</strong> (${p.age}a) - <span style="color:${p.condition === 'bueno' ? '#22C55E' : p.condition === 'herido' ? '#F59E0B' : '#EF4444'};font-weight:600;">${p.condition}</span></div>`
        ).join('');
        marker.bindTooltip(
          `<strong>🏥 ${cluster.count} Personas Rescatadas</strong><br/><div style="margin-top:4px">${personsList}</div>`,
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

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {!mapReady && (
        <div className="map-loading">
          <div className="map-loading-spinner" />
          <span>Cargando mapa...</span>
        </div>
      )}
      {onToggleRescuedLayer && (
        <div className="map-layer-toggle">
          <button
            className={`map-layer-btn ${showRescuedLayer ? 'active' : ''}`}
            onClick={onToggleRescuedLayer}
            title={showRescuedLayer ? 'Ocultar personas rescatadas' : 'Mostrar personas rescatadas'}
          >
            🏥 Rescatados {showRescuedLayer ? 'ON' : 'OFF'}
            {rescuedPersons.length > 0 && <span className="map-layer-count">{rescuedPersons.length}</span>}
          </button>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
