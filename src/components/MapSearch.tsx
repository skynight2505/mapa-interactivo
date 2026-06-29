import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useI18n } from '../utils/i18n';
import { CATEGORIES } from '../utils/categories';
import type { MapMarker } from '../types';

const NOMINATIM = 'https://nominatim.openstreetmap.org';

interface SearchResult {
  lat: number;
  lng: number;
  displayName: string;
  type: string;
  category: string;
  address: Record<string, string>;
}

interface MapSearchProps {
  onSelect: (result: SearchResult) => void;
  onClear: () => void;
  userCanEdit?: boolean;
  onAddMarker?: (lat: number, lng: number) => void;
  markers?: MapMarker[];
  onViewMarker?: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  city: '🏙️',
  town: '🏘️',
  village: '🏘️',
  municipality: '🏛️',
  state: '🏛️',
  region: '🗺️',
  country: '🌍',
  hospital: '🏥',
  clinic: '🏥',
  doctors: '👨‍⚕️',
  pharmacy: '💊',
  school: '🏫',
  university: '🎓',
  college: '🎓',
  kindergarten: '🧒',
  library: '📚',
  place_of_worship: '⛪',
  church: '⛪',
  mosque: '🕌',
  synagogue: '🕍',
  temple: '🛕',
  cemetery: '⚰️',
  hospital_building: '🏥',
  supermarket: '🛒',
  convenience: '🏪',
  mall: '🏬',
  shop: '🛍️',
  department_store: '🏬',
  marketplace: '🏪',
  restaurant: '🍽️',
  fast_food: '🍔',
  cafe: '☕',
  pub: '🍺',
  bar: '🍸',
  hotel: '🏨',
  motel: '🏨',
  hostel: '🏨',
  guest_house: '🏠',
  police: '👮',
  fire_station: '🚒',
  townhall: '🏛️',
  government: '🏛️',
  embassy: '🏛️',
  courthouse: '⚖️',
  prison: '🔒',
  post_office: '📮',
  bank: '🏦',
  atm: '🏧',
  fuel: '⛽',
  charging_station: '🔌',
  parking: '🅿️',
  bus_station: '🚌',
  bus_stop: '🚏',
  railway_station: '🚉',
  airport: '✈️',
  ferry_terminal: '⛴️',
  taxi: '🚕',
  stadium: '🏟️',
  sports_centre: '🏟️',
  pitch: '⚽',
  swimming_pool: '🏊',
  park: '🌳',
  playground: '🛝',
  garden: '🌻',
  forest: '🌲',
  nature_reserve: '🌿',
  beach: '🏖️',
  river: '🌊',
  lake: '💧',
  dam: '🌊',
  waterfall: '💦',
  mountain: '⛰️',
  volcano: '🌋',
  cave: '🕳️',
  island: '🏝️',
  bridge: '🌉',
  tower: '🗼',
  monument: '🗽',
  memorial: '🪦',
  museum: '🏛️',
  art_gallery: '🎨',
  theatre: '🎭',
  cinema: '🎬',
  concert_hall: '🎵',
  zoo: '🦁',
  aquarium: '🐠',
  amusement_park: '🎡',
  residential: '🏘️',
  apartments: '🏢',
  house: '🏠',
  neighbourhood: '🏘️',
  suburb: '🏘️',
  quarter: '🏘️',
  road: '🛣️',
  street: '🛤️',
  square: '🏛️',
  pedestrian: '🚶',
  cycleway: '🚴',
  industrial: '🏭',
  commercial: '🏬',
  construction: '🚧',
  farm: '🌾',
  vineyard: '🍇',
  farmyard: '🐄',
  farm_house: '🏡',
  isolated_dwelling: '🏡',
  castle: '🏰',
  ruin: '🏚️',
  archaeological_site: '🏛️',
  battlefield: '⚔️',
  military: '🎖️',
  water_tower: '💧',
  windmill: '💨',
  lighthouse: '🗼',
  observation_tower: '🗼',
  wayside_cross: '✝️',
  wayside_shrine: '⛩️',
  boundary_stone: '🪨',
};

const TYPE_LABELS: Record<string, Record<string, string>> = {
  hospital: { es: 'Hospital', en: 'Hospital', pt: 'Hospital', zh: '医院', ar: 'مستشفى' },
  clinic: { es: 'Clínica', en: 'Clinic', pt: 'Clínica', zh: '诊所', ar: 'عيادة' },
  pharmacy: { es: 'Farmacia', en: 'Pharmacy', pt: 'Farmácia', zh: '药店', ar: 'صيدلية' },
  school: { es: 'Escuela', en: 'School', pt: 'Escola', zh: '学校', ar: 'مدرسة' },
  university: { es: 'Universidad', en: 'University', pt: 'Universidade', zh: '大学', ar: 'جامعة' },
  supermarket: { es: 'Supermercado', en: 'Supermarket', pt: 'Supermercado', zh: '超市', ar: 'سوبر ماركت' },
  mall: { es: 'Centro Comercial', en: 'Mall', pt: 'Shopping', zh: '购物中心', ar: 'مركز تسوق' },
  shop: { es: 'Tienda', en: 'Shop', pt: 'Loja', zh: '商店', ar: 'متجر' },
  restaurant: { es: 'Restaurante', en: 'Restaurant', pt: 'Restaurante', zh: '餐厅', ar: 'مطعم' },
  hotel: { es: 'Hotel', en: 'Hotel', pt: 'Hotel', zh: '酒店', ar: 'فندق' },
  police: { es: 'Policía', en: 'Police', pt: 'Polícia', zh: '警察局', ar: 'شرطة' },
  fire_station: { es: 'Estación de Bomberos', en: 'Fire Station', pt: 'Corpo de Bombeiros', zh: '消防站', ar: 'محطة إطفاء' },
  park: { es: 'Parque', en: 'Park', pt: 'Parque', zh: '公园', ar: 'حديقة' },
  stadium: { es: 'Estadio', en: 'Stadium', pt: 'Estádio', zh: '体育场', ar: 'ملعب' },
  residential: { es: 'Zona Residencial', en: 'Residential Area', pt: 'Área Residencial', zh: '住宅区', ar: 'منطقة سكنية' },
  neighbourhood: { es: 'Urbanización / Barrio', en: 'Neighborhood', pt: 'Bairro', zh: '街区', ar: 'حي' },
  suburb: { es: 'Urbanización', en: 'Suburb', pt: 'Subúrbio', zh: '郊区', ar: 'ضاحية' },
  town: { es: 'Pueblo', en: 'Town', pt: 'Vila', zh: '城镇', ar: 'بلدة' },
  city: { es: 'Ciudad', en: 'City', pt: 'Cidade', zh: '城市', ar: 'مدينة' },
  village: { es: 'Aldea', en: 'Village', pt: 'Aldeia', zh: '村庄', ar: 'قرية' },
  bank: { es: 'Banco', en: 'Bank', pt: 'Banco', zh: '银行', ar: 'بنك' },
  fuel: { es: 'Gasolinera', en: 'Gas Station', pt: 'Posto de Gasolina', zh: '加油站', ar: 'محطة وقود' },
  parking: { es: 'Estacionamiento', en: 'Parking', pt: 'Estacionamento', zh: '停车场', ar: 'موقف سيارات' },
  bus_station: { es: 'Terminal de Buses', en: 'Bus Terminal', pt: 'Terminal Rodoviário', zh: '公交总站', ar: 'محطة حافلات' },
  railway_station: { es: 'Estación de Tren', en: 'Train Station', pt: 'Estação Ferroviária', zh: '火车站', ar: 'محطة قطار' },
  airport: { es: 'Aeropuerto', en: 'Airport', pt: 'Aeroporto', zh: '机场', ar: 'مطار' },
  place_of_worship: { es: 'Lugar de Culto', en: 'Place of Worship', pt: 'Local de Culto', zh: '礼拜场所', ar: 'مكان عبادة' },
  church: { es: 'Iglesia', en: 'Church', pt: 'Igreja', zh: '教堂', ar: 'كنيسة' },
  government: { es: 'Gobierno', en: 'Government', pt: 'Governo', zh: '政府', ar: 'حكومة' },
  apartments: { es: 'Edificio Residencial', en: 'Apartment Building', pt: 'Edifício Residencial', zh: '公寓楼', ar: 'مبنى سكني' },
  house: { es: 'Casa', en: 'House', pt: 'Casa', zh: '房屋', ar: 'منزل' },
  industrial: { es: 'Zona Industrial', en: 'Industrial Area', pt: 'Zona Industrial', zh: '工业区', ar: 'منطقة صناعية' },
  commercial: { es: 'Zona Comercial', en: 'Commercial Area', pt: 'Área Comercial', zh: '商业区', ar: 'منطقة تجارية' },
  museum: { es: 'Museo', en: 'Museum', pt: 'Museu', zh: '博物馆', ar: 'متحف' },
  theatre: { es: 'Teatro', en: 'Theater', pt: 'Teatro', zh: '剧院', ar: 'مسرح' },
  cinema: { es: 'Cine', en: 'Cinema', pt: 'Cinema', zh: '电影院', ar: 'سينما' },
  beach: { es: 'Playa', en: 'Beach', pt: 'Praia', zh: '海滩', ar: 'شاطئ' },
  mountain: { es: 'Montaña', en: 'Mountain', pt: 'Montanha', zh: '山', ar: 'جبل' },
};

const INFO_LABELS: Record<string, Record<string, string>> = {
  state: { es: 'Estado', en: 'State', pt: 'Estado', zh: '州', ar: 'ولاية' },
  city: { es: 'Ciudad', en: 'City', pt: 'Cidade', zh: '城市', ar: 'مدينة' },
  town: { es: 'Pueblo', en: 'Town', pt: 'Vila', zh: '城镇', ar: 'بلدة' },
  village: { es: 'Aldea', en: 'Village', pt: 'Aldeia', zh: '村庄', ar: 'قرية' },
  municipality: { es: 'Municipio', en: 'Municipality', pt: 'Município', zh: '市镇', ar: 'بلدية' },
  region: { es: 'Región', en: 'Region', pt: 'Região', zh: '地区', ar: 'منطقة' },
  country: { es: 'País', en: 'Country', pt: 'País', zh: '国家', ar: 'بلد' },
  suburb: { es: 'Urbanización', en: 'Suburb', pt: 'Subúrbio', zh: '郊区', ar: 'ضاحية' },
  neighbourhood: { es: 'Barrio', en: 'Neighborhood', pt: 'Bairro', zh: '街区', ar: 'حي' },
  quarter: { es: 'Sector', en: 'Quarter', pt: 'Bairro', zh: '区', ar: 'ربع' },
  borough: { es: 'Distrito', en: 'Borough', pt: 'Distrito', zh: '行政区', ar: 'حي' },
  district: { es: 'Distrito', en: 'District', pt: 'Distrito', zh: '区', ar: 'منطقة' },
  postcode: { es: 'Código Postal', en: 'Postcode', pt: 'CEP', zh: '邮政编码', ar: 'الرمز البريدي' },
  road: { es: 'Calle', en: 'Street', pt: 'Rua', zh: '街道', ar: 'شارع' },
  house_number: { es: 'Número', en: 'Number', pt: 'Número', zh: '门牌号', ar: 'رقم المبنى' },
  amenity: { es: 'Servicio', en: 'Amenity', pt: 'Serviço', zh: '设施', ar: 'مرفق' },
  building: { es: 'Edificio', en: 'Building', pt: 'Edifício', zh: '建筑', ar: 'مبنى' },
  coords: { es: 'Coordenadas', en: 'Coordinates', pt: 'Coordenadas', zh: '坐标', ar: 'الإحداثيات' },
};

function getIcon(type: string, category: string): string {
  if (TYPE_ICONS[type]) return TYPE_ICONS[type];
  if (category === 'place') return '📍';
  if (category === 'boundary') return '🏛️';
  if (category === 'building') return '🏢';
  if (category === 'amenity') return '🏪';
  if (category === 'shop') return '🛍️';
  if (category === 'leisure') return '🎯';
  if (category === 'tourism') return '🗺️';
  if (category === 'natural') return '🌳';
  if (category === 'waterway') return '💧';
  if (category === 'highway') return '🛣️';
  if (category === 'railway') return '🚉';
  if (category === 'landuse') return '🗺️';
  if (category === 'man_made') return '🏗️';
  return '📍';
}

function getTypeLabel(type: string, lang: string): string {
  if (TYPE_LABELS[type]?.[lang]) return TYPE_LABELS[type][lang];
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function MapSearch({ onSelect, onClear, userCanEdit, onAddMarker, markers = [], onViewMarker }: MapSearchProps) {
  const { lang, t } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${NOMINATIM}/search?format=jsonv2&q=${encodeURIComponent(q)}&countrycodes=ve&limit=20&accept-language=es&addressdetails=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const mapped: SearchResult[] = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        type: item.type,
        category: item.category,
        address: item.address || {},
      }));
      setResults(mapped);
      setShowResults(mapped.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = useCallback((val: string) => {
    setQuery(val);
    setSelectedResult(null);
    onClear();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 400);
  }, [search, onClear]);

  const handleSelect = useCallback((result: SearchResult) => {
    setQuery(result.displayName.split(',')[0]);
    setResults([]);
    setShowResults(false);
    setSelectedResult(result);
    onSelect(result);
  }, [onSelect]);

  const handleClear = useCallback(() => {
    clearTimeout(timerRef.current);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedResult(null);
    onClearRef.current();
    inputRef.current?.focus();
  }, []);

  const onClearRef = useRef(onClear);
  onClearRef.current = onClear;

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimeout(timerRef.current);
        setShowResults(false);
        setQuery('');
        setSelectedResult(null);
        onClearRef.current();
        inputRef.current?.blur();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    document.addEventListener('keydown', handleKey);
    return () => {
      clearTimeout(timerRef.current);
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const nearbyMarkers = useMemo(() => {
    if (!selectedResult) return [];
    return markers.filter(m => {
      const dLat = Math.abs(m.lat - selectedResult.lat);
      const dLng = Math.abs(m.lng - selectedResult.lng);
      return dLat < 0.02 && dLng < 0.02;
    });
  }, [selectedResult, markers]);

  return (
    <div className="map-search" ref={wrapperRef}>
      <div className="map-search-input-wrap">
        <span className="map-search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          className="map-search-input"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        {query && (
          <button className="map-search-clear" onClick={handleClear} title={t('search.clearTitle')}>✕</button>
        )}
        {loading && <span className="map-search-spinner" />}
      </div>

      {showResults && results.length > 0 && (
        <ul className="map-search-results">
          {results.map((r, i) => (
            <li key={i} className="map-search-result" onClick={() => handleSelect(r)}>
              <span className="map-search-result-icon">{getIcon(r.type, r.category)}</span>
              <div className="map-search-result-info">
                <span className="map-search-result-name">{r.displayName.split(',')[0]}</span>
                <span className="map-search-result-addr">{r.displayName.split(',').slice(1).join(',').trim()}</span>
              </div>
              <span className="map-search-result-type">{getTypeLabel(r.type, lang)}</span>
            </li>
          ))}
        </ul>
      )}

      {selectedResult && (
        <div className="map-search-info">
          <div className="map-search-info-header">
            <span className="map-search-info-icon">{getIcon(selectedResult.type, selectedResult.category)}</span>
            <div>
              <strong>{selectedResult.displayName.split(',')[0]}</strong>
              <span className="map-search-info-type">{getTypeLabel(selectedResult.type, lang)}</span>
              <span className="map-search-info-addr">{selectedResult.displayName.split(',').slice(1).join(',').trim()}</span>
            </div>
          </div>
          <div className="map-search-info-details">
            {selectedResult.address.state && <span>🏛️ {INFO_LABELS.state[lang]}: {selectedResult.address.state}</span>}
            {selectedResult.address.city && <span>🏙️ {INFO_LABELS.city[lang]}: {selectedResult.address.city}</span>}
            {selectedResult.address.town && <span>🏘️ {INFO_LABELS.town[lang]}: {selectedResult.address.town}</span>}
            {selectedResult.address.village && <span>🏘️ {INFO_LABELS.village[lang]}: {selectedResult.address.village}</span>}
            {selectedResult.address.municipality && <span>🏛️ {INFO_LABELS.municipality[lang]}: {selectedResult.address.municipality}</span>}
            {selectedResult.address.region && <span>🗺️ {INFO_LABELS.region[lang]}: {selectedResult.address.region}</span>}
            {selectedResult.address.suburb && <span>🏘️ {INFO_LABELS.suburb[lang]}: {selectedResult.address.suburb}</span>}
            {selectedResult.address.neighbourhood && <span>🏘️ {INFO_LABELS.neighbourhood[lang]}: {selectedResult.address.neighbourhood}</span>}
            {selectedResult.address.quarter && <span>🏘️ {INFO_LABELS.quarter[lang]}: {selectedResult.address.quarter}</span>}
            {selectedResult.address.district && <span>🗺️ {INFO_LABELS.district[lang]}: {selectedResult.address.district}</span>}
            {selectedResult.address.road && <span>🛣️ {INFO_LABELS.road[lang]}: {selectedResult.address.road}</span>}
            {selectedResult.address.house_number && <span>🔢 {INFO_LABELS.house_number[lang]}: {selectedResult.address.house_number}</span>}
            {selectedResult.address.country && <span>🌍 {INFO_LABELS.country[lang]}: {selectedResult.address.country}</span>}
            <span>📍 {INFO_LABELS.coords[lang]}: {selectedResult.lat.toFixed(4)}, {selectedResult.lng.toFixed(4)}</span>
          </div>
          {nearbyMarkers.length > 0 && (
            <div className="map-search-nearby">
              <div className="map-search-nearby-title">
                📍 {t('search.nearbyZones')} ({nearbyMarkers.length})
              </div>
              <div className="map-search-nearby-list">
                {nearbyMarkers.map(m => {
                  const cat = CATEGORIES[m.type];
                  return (
                    <div key={m.id} className="map-search-nearby-item" onClick={() => onViewMarker?.(m.id)}>
                      <span className="map-search-nearby-icon" style={{ backgroundColor: cat?.bgColor || '#333' }}>
                        {cat?.icon || '📍'}
                      </span>
                      <div className="map-search-nearby-item-info">
                        <strong>{m.title}</strong>
                        <span>{cat?.label || m.type}</span>
                      </div>
                      <span className="map-search-nearby-severity" style={{ color: cat?.color || '#999' }}>
                        {m.severity === 'critica' ? '🔴' : m.severity === 'alta' ? '🟠' : m.severity === 'media' ? '🟡' : '🟢'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="map-search-info-actions">
            <button className="map-search-info-btn map-search-info-btn-remove" onClick={handleClear}>
              {t('search.removeMarker')}
            </button>
            {userCanEdit && onAddMarker && (
              <button className="map-search-info-btn map-search-info-btn-add" onClick={() => { onAddMarker(selectedResult.lat, selectedResult.lng); handleClear(); }}>
                {t('search.addMarkerHere')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
