import React, { useEffect, useRef, useCallback, useState } from 'react';
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

function clusterPersons(persons: RescuedPerson[], minDistance: number = 0.003): Cluster[] {
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

function createSvgIcon(type: MarkerType, isSelected: boolean): string {
  const cat = CATEGORIES[type];
  const size = isSelected ? 44 : 36;
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${cat.color}" stroke="${isSelected ? '#fff' : 'transparent'}" stroke-width="${isSelected ? 3 : 0}" opacity="${isSelected ? 1 : 0.9}"/>
      <text x="${cx}" y="${cy + 2}" text-anchor="middle" dominant-baseline="central" font-size="${size * 0.45}">${cat.icon}</text>
    </svg>`
  )}`;
}

function createClusterIcon(count: number): string {
  const size = Math.min(60, 40 + count * 4);
  const color = count >= 10 ? '#EF4444' : count >= 5 ? '#F59E0B' : '#22C55E';
  const cx = size / 2;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cx}" r="${cx - 2}" fill="${color}" stroke="#fff" stroke-width="2" opacity="0.9"/>
      <text x="${cx}" y="${cx - 4}" text-anchor="middle" dominant-baseline="central" font-size="${size * 0.25}" fill="#fff" font-weight="bold">🏥</text>
      <text x="${cx}" y="${cx + 8}" text-anchor="middle" dominant-baseline="central" font-size="${size * 0.3}" fill="#fff" font-weight="bold">${count}</text>
    </svg>`
  )}`;
}

function createRescuedIcon(condition: string): string {
  const color = condition === 'bueno' ? '#22C55E' : condition === 'herido' ? '#F59E0B' : '#EF4444';
  const icon = condition === 'bueno' ? '✅' : condition === 'herido' ? '⚠️' : '🚑';
  const size = 28;
  const cx = size / 2;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${cx}" cy="${cx}" r="${cx - 2}" fill="${color}" stroke="#fff" stroke-width="2" opacity="0.95"/>
      <text x="${cx}" y="${cx + 2}" text-anchor="middle" dominant-baseline="central" font-size="${size * 0.5}">${icon}</text>
    </svg>`
  )}`;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  markers, activeFilters, selectedId, onMarkerClick, onMapClick,
  rescuedPersons = [], showRescuedLayer = false, onToggleRescuedLayer,
  highlightedRescuedId, onHighlightRescuedClear,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersMapRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const rescuedMarkersRef = useRef<google.maps.Marker[]>([]);
  const clusterMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const visibleMarkers = activeFilters.length === 0
    ? markers
    : markers.filter((m) => activeFilters.includes(m.type));

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState('');

  const createIcon = useCallback((type: MarkerType, isSelected: boolean): google.maps.Icon => {
    const svg = createSvgIcon(type, isSelected);
    const sizeVal = isSelected ? 44 : 36;
    return {
      url: svg,
      size: new google.maps.Size(sizeVal, sizeVal),
      scaledSize: new google.maps.Size(sizeVal, sizeVal),
      anchor: new google.maps.Point(sizeVal / 2, sizeVal / 2),
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    if (!apiKey) return;

    if (window.google?.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&language=es&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    script.onerror = () => setMapError('No se pudo cargar Google Maps. Verifica tu conexión y que la API Key sea válida.');
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  function initMap() {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 10.4806, lng: -66.9036 },
      zoom: 12,
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
        { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#16213e' }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283e59' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
        { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
        { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
      ],
      mapTypeControl: true,
      mapTypeControlOptions: { style: google.maps.MapTypeControlStyle.DROPDOWN_MENU, mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'] },
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();
    setMapReady(true);
    if (onMapClick) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) onMapClick(e.latLng.lat(), e.latLng.lng());
      });
    }
  }

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersMapRef.current.forEach((marker) => marker.setMap(null));
    markersMapRef.current.clear();

    visibleMarkers.forEach((data) => {
      const isSelected = data.id === selectedId;
      const marker = new google.maps.Marker({
        position: { lat: data.lat, lng: data.lng },
        map,
        icon: createIcon(data.type, isSelected),
        title: data.title,
        animation: isSelected ? google.maps.Animation.BOUNCE : undefined,
        zIndex: isSelected ? 1000 : 1,
      });

      marker.addListener('click', () => onMarkerClick(data));
      marker.addListener('mouseover', () => {
        if (infoWindowRef.current) {
          const cat = CATEGORIES[data.type];
          const terrainInfo = data.terrain ? ` · ${data.terrain}` : '';
          infoWindowRef.current.setContent(
            `<div style="font-family:Inter,system-ui,sans-serif;padding:4px 8px;">
              <strong>${cat.icon} ${data.title}</strong><br/>
              <span style="font-size:11px;color:#666;">${cat.label}${terrainInfo}</span>
            </div>`
          );
          infoWindowRef.current.open(map, marker);
        }
      });
      marker.addListener('mouseout', () => infoWindowRef.current?.close());

      markersMapRef.current.set(data.id, marker);
    });

    if (selectedId) {
      const selectedMarker = markersMapRef.current.get(selectedId);
      if (selectedMarker) {
        map.panTo(selectedMarker.getPosition()!);
        if (map.getZoom()! < 14) map.setZoom(14);
      }
    }
  }, [visibleMarkers, selectedId, createIcon, onMarkerClick]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    rescuedMarkersRef.current.forEach(m => m.setMap(null));
    rescuedMarkersRef.current = [];
    clusterMarkersRef.current.forEach(m => m.setMap(null));
    clusterMarkersRef.current = [];

    if (!showRescuedLayer || rescuedPersons.length === 0) return;

    const clusters = clusterPersons(rescuedPersons);
    const zoom = map.getZoom() || 12;

    if (zoom >= 14 || rescuedPersons.length <= 10) {
      rescuedPersons.forEach(person => {
        const marker = new google.maps.Marker({
          position: { lat: person.lat, lng: person.lng },
          map,
          icon: { url: createRescuedIcon(person.condition) } as google.maps.Icon,
          title: `${person.name} - ${person.condition}`,
          zIndex: 500,
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            const terrainInfo = person.terrain ? ` · ${person.terrain}` : '';
            infoWindowRef.current.setContent(
              `<div style="font-family:Inter,system-ui,sans-serif;padding:6px 10px;min-width:180px;">
                <strong>🏥 ${person.name}</strong><br/>
                <span style="font-size:11px;color:#666;">Edad: ${person.age} · ${person.gender}${terrainInfo}</span><br/>
                <span style="font-size:11px;color:${person.condition === 'bueno' ? '#22C55E' : person.condition === 'herido' ? '#F59E0B' : '#EF4444'};font-weight:600;">
                  ${person.condition.toUpperCase()}
                </span><br/>
                <span style="font-size:10px;color:#999;">📍 ${person.zoneName}</span><br/>
                <span style="font-size:10px;color:#999;">Rescatado por: ${person.rescuedBy || 'N/A'}</span>
              </div>`
            );
            infoWindowRef.current.open(map, marker);
          }
        });

        rescuedMarkersRef.current.push(marker);
      });
    } else {
      clusters.forEach(cluster => {
        const marker = new google.maps.Marker({
          position: { lat: cluster.lat, lng: cluster.lng },
          map,
          icon: { url: createClusterIcon(cluster.count) } as google.maps.Icon,
          title: `${cluster.count} personas rescatadas`,
          zIndex: 600,
        });

        marker.addListener('click', () => {
          if (infoWindowRef.current) {
            const personsList = cluster.persons.map(p =>
              `<div style="padding:2px 0;font-size:11px;">
                <strong>${p.name}</strong> (${p.age}a) - <span style="color:${p.condition === 'bueno' ? '#22C55E' : p.condition === 'herido' ? '#F59E0B' : '#EF4444'};font-weight:600;">${p.condition}</span>
              </div>`
            ).join('');
            infoWindowRef.current.setContent(
              `<div style="font-family:Inter,system-ui,sans-serif;padding:6px 10px;max-width:250px;">
                <strong>🏥 ${cluster.count} Personas Rescatadas</strong><br/>
                <div style="margin-top:6px;max-height:150px;overflow-y:auto;">${personsList}</div>
              </div>`
            );
            infoWindowRef.current.open(map, marker);
            map.panTo({ lat: cluster.lat, lng: cluster.lng });
            map.setZoom(Math.min(zoom + 2, 18));
          }
        });

        clusterMarkersRef.current.push(marker);
      });
    }
  }, [showRescuedLayer, rescuedPersons]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !highlightedRescuedId || !showRescuedLayer) return;

    const person = rescuedPersons.find(p => p.id === highlightedRescuedId);
    if (!person) return;

    map.panTo({ lat: person.lat, lng: person.lng });
    map.setZoom(17);

    if (infoWindowRef.current) {
      const terrainInfo = person.terrain ? ` · ${person.terrain}` : '';
      infoWindowRef.current.setContent(
        `<div style="font-family:Inter,system-ui,sans-serif;padding:8px 12px;min-width:200px;">
          <strong>🔍 ${person.name}</strong><br/>
          <span style="font-size:11px;color:#666;">${person.age} años · ${person.gender}${terrainInfo}</span><br/>
          <span style="font-size:11px;color:${person.condition === 'bueno' ? '#22C55E' : person.condition === 'herido' ? '#F59E0B' : '#EF4444'};font-weight:600;">
            ${person.condition.toUpperCase()}
          </span><br/>
          <span style="font-size:10px;color:#999;">📍 ${person.zoneName}</span><br/>
          <span style="font-size:10px;color:#999;">Rescatado por: ${person.rescuedBy || 'N/A'}</span>
        </div>`
      );
      const marker = rescuedMarkersRef.current.find(m => {
        const pos = m.getPosition();
        return pos && Math.abs(pos.lat() - person.lat) < 0.0001 && Math.abs(pos.lng() - person.lng) < 0.0001;
      });
      if (marker) {
        infoWindowRef.current.open(map, marker);
      } else {
        infoWindowRef.current.setPosition({ lat: person.lat, lng: person.lng });
        infoWindowRef.current.open(map);
      }
    }

    const timer = setTimeout(() => {
      if (onHighlightRescuedClear) onHighlightRescuedClear();
    }, 3000);
    return () => clearTimeout(timer);
  }, [highlightedRescuedId, showRescuedLayer, rescuedPersons, onHighlightRescuedClear]);

  if (!apiKey) {
    return (
      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-placeholder-icon">🗺️</div>
          <div className="map-placeholder-text">Google Maps API Key Requerida</div>
          <div className="map-placeholder-sub">
            Para ver el mapa interactivo de Venezuela, necesitas configurar tu API Key de Google Maps.
            Crea un archivo <code style={{ color: '#f59e0b' }}>.env</code> en la raíz del proyecto:
          </div>
          <div className="map-placeholder-code">VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aquí</div>
          <div className="map-placeholder-sub" style={{ marginTop: 12 }}>
            <strong>¿Cómo obtener tu clave?</strong><br/>
            1. Ve a <a href="https://console.cloud.google.com/" target="_blank" style={{ color: '#60a5fa' }}>console.cloud.google.com</a><br/>
            2. Habilita "Maps JavaScript API"<br/>
            3. Crea credenciales → API Key<br/>
            4. Reinicia el servidor con <code style={{ color: '#f59e0b' }}>npm run dev</code>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-placeholder-icon">⚠️</div>
          <div className="map-placeholder-text">Error al cargar Google Maps</div>
          <div className="map-placeholder-sub">{mapError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
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
