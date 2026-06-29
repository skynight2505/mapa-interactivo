import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CATEGORIES } from '../utils/categories';
import { SEVERITY_COLORS } from '../utils/categories';
import type { MapMarker, RescueLink, RescueLinkCategory } from '../types';
import { RESCUE_LINK_CATEGORIES } from '../types';
import SiteStatusDashboard from './SiteStatusDashboard';
import { useI18n } from '../utils/i18n';
import { loadZoneLinks, saveAllLinks, loadAllLinks } from '../utils/links';
import { tCategory, tTerrain, tSeverity, tMarkerContent, tLinkCategory } from '../utils/translateContent';
import LinkifiedText from './LinkifiedText';

interface MarkerPopupProps {
  marker: MapMarker;
  onClose: () => void;
  userCanEdit?: boolean;
}

const CATEGORY_ORDER: RescueLinkCategory[] = ['whatsapp', 'canal_informativo', 'pagina'];

const MarkerPopup: React.FC<MarkerPopupProps> = ({ marker, onClose, userCanEdit }) => {
  const cat = CATEGORIES[marker.type] || { icon: '❓', color: '#64748b', bgColor: '#1e293b', label: 'Desconocido' };
  const { t, lang } = useI18n();
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const dy = e.touches[0].clientY - touchStartY.current;
      if (dy > 80) { onClose(); }
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [showImages, setShowImages] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const lbTouchStartX = useRef(0);
  const lbTouchStartY = useRef(0);
  const [zoneLinks, setZoneLinks] = useState<RescueLink[]>(() => loadZoneLinks(marker.id));
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState<RescueLinkCategory>('whatsapp');
  const [linkDesc, setLinkDesc] = useState('');

  const refreshLinks = () => setZoneLinks(loadZoneLinks(marker.id));

  const categorizedLinks = useMemo(() => {
    return CATEGORY_ORDER.map((cat) => ({
      cat,
      config: RESCUE_LINK_CATEGORIES[cat],
      links: zoneLinks.filter((l) => l.category === cat),
    })).filter((g) => g.links.length > 0);
  }, [zoneLinks]);

  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    const newLink: RescueLink = {
      id: crypto.randomUUID(),
      title: linkTitle.trim(),
      url: linkUrl.trim(),
      category: linkCategory,
      zoneId: marker.id,
      zoneName: marker.title,
      description: linkDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const all = loadAllLinks();
    saveAllLinks([...all, newLink]);
    setLinkTitle('');
    setLinkUrl('');
    setLinkCategory('whatsapp');
    setLinkDesc('');
    setShowLinkForm(false);
    refreshLinks();
  };

  const handleDeleteLink = (id: string) => {
    const all = loadAllLinks();
    saveAllLinks(all.filter((l) => l.id !== id));
    refreshLinks();
  };

  const getDomain = (urlStr: string) => {
    try {
      return new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`).hostname;
    } catch {
      return urlStr;
    }
  };

  return (
    <div className="detail-panel" ref={panelRef}>
      <div className="detail-header">
        <div
          className="detail-icon"
          style={{ backgroundColor: cat.bgColor }}
        >
          {cat.icon}
        </div>
        <div className="detail-title-group">
          <div className="detail-title">
            {tMarkerContent(marker, lang, 'title')}
            {marker.verified && (
              <span className="verified-badge" title={`${t('popup.verifiedBy')} ${marker.verifiedSource || 'fuente oficial'}`}>
                {t('popup.verified')}
              </span>
            )}
          </div>
          <div className="detail-type">
            {tCategory(marker.type, lang)}
            {marker.severity && (
              <>
                {' · '}
                <span style={{ color: SEVERITY_COLORS[marker.severity] }}>
                  {t('popup.severity')} {tSeverity(marker.severity, lang)}
                </span>
              </>
            )}
            {marker.terrain && (
              <>
                {' · '}
                <span>
                  {tTerrain(marker.terrain, lang)}
                </span>
              </>
            )}
          </div>
        </div>
        <button className="detail-close" onClick={onClose}>✕</button>
      </div>

      <div className="detail-body">
        <p className="detail-description"><LinkifiedText text={tMarkerContent(marker, lang, 'description')} /></p>

        {/* Imágenes — colapsable */}
        {marker.images && marker.images.length > 0 && (
          <div className="detail-section">
            <div
              className="detail-section-title"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}
              onClick={() => setShowImages(!showImages)}
            >
              {t('popup.photos')} ({marker.images.length}) {showImages ? '▼' : '▶'}
            </div>
            {showImages && (
              <div className="detail-image-grid">
                {marker.images.map((img, i) => (
                  <div key={i} className="detail-image-thumb" onClick={() => { setLightboxIdx(i); setZoom(1); setPan({ x: 0, y: 0 }); }}>
                    <img src={img} alt={`${t('popup.photos')} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lightbox con zoom, pan y swipe */}
        {lightboxIdx !== null && marker.images && marker.images[lightboxIdx] && (
          <div
            className="lightbox-overlay"
            onClick={() => setLightboxIdx(null)}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setZoom(prev => Math.max(0.5, Math.min(5, prev - e.deltaY * 0.002)));
            }}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                lbTouchStartX.current = e.touches[0].clientX;
                lbTouchStartY.current = e.touches[0].clientY;
                setIsPanning(false);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1 && zoom > 1) {
                const dx = e.touches[0].clientX - lbTouchStartX.current;
                const dy = e.touches[0].clientY - lbTouchStartY.current;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                  setIsPanning(true);
                  setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
                }
                lbTouchStartX.current = e.touches[0].clientX;
                lbTouchStartY.current = e.touches[0].clientY;
              }
            }}
            onTouchEnd={(e) => {
              if (!isPanning && zoom === 1) {
                const dx = e.changedTouches[0].clientX - lbTouchStartX.current;
                if (Math.abs(dx) > 50) {
                  e.preventDefault();
                  const next = dx < 0 ? lightboxIdx + 1 : lightboxIdx - 1;
                  if (next >= 0 && next < (marker.images?.length || 1)) {
                    setLightboxIdx(next);
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }
                }
              }
              setIsPanning(false);
            }}
          >
            <button className="lightbox-close" onClick={() => setLightboxIdx(null)}>✕</button>
            <button className="lightbox-zoom-btn lightbox-zoom-in" onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(5, prev + 0.5)); }}>🔍+</button>
            <button className="lightbox-zoom-btn lightbox-zoom-out" onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(0.5, prev - 0.5)); }}>🔍−</button>
            {zoom !== 1 && (
              <button className="lightbox-zoom-btn lightbox-zoom-reset" onClick={(e) => { e.stopPropagation(); setZoom(1); setPan({ x: 0, y: 0 }); }}>↺</button>
            )}
            {lightboxIdx > 0 && (
              <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); setZoom(1); setPan({ x: 0, y: 0 }); }}>‹</button>
            )}
            {lightboxIdx < (marker.images?.length || 1) - 1 && (
              <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); setZoom(1); setPan({ x: 0, y: 0 }); }}>›</button>
            )}
            <div className="lightbox-counter">{lightboxIdx + 1} / {marker.images.length}</div>
            <div
              className="lightbox-image-wrap"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => {
                if (zoom > 1) {
                  setIsPanning(true);
                  setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
                }
              }}
              onMouseMove={(e) => {
                if (isPanning && zoom > 1) {
                  setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
                }
              }}
              onMouseUp={() => setIsPanning(false)}
              onMouseLeave={() => setIsPanning(false)}
              style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
            >
              <img
                className="lightbox-image"
                src={marker.images[lightboxIdx]}
                alt={`${t('popup.photos')} ${lightboxIdx + 1}`}
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isPanning ? 'none' : 'transform 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Site Status Dashboard */}
        <SiteStatusDashboard marker={marker} />

        {/* Grupos de ayuda */}
        <div className="detail-section">
          <div className="detail-section-title">
            {t('popup.helpGroups')} ({marker.groups.length})
          </div>
          {marker.groups.length === 0 ? (
            <p className="detail-no-data">{t('popup.noGroups')}</p>
          ) : (
            marker.groups.map((group) => (
              <div key={group.id} className="detail-group-item">
                <div className="detail-group-avatar">
                  {group.name.charAt(0)}
                </div>
                <div className="detail-group-info">
                  <div className="detail-group-name">{group.name}</div>
                  <div className="detail-group-contact">📞 {group.contact}</div>
                </div>
                <div className="detail-group-members">
                  {group.memberCount} {t('popup.members')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Insumos necesarios */}
        <div className="detail-section">
          <div className="detail-section-title">
            {t('popup.supplies')} ({marker.supplies.length})
          </div>
          {marker.supplies.length === 0 ? (
            <p className="detail-no-data">{t('popup.noSupplies')}</p>
          ) : (
            marker.supplies.map((supply) => (
              <div key={supply.id} className="detail-supply-item">
                <div>
                  <div className="detail-supply-name">{supply.name}</div>
                  <div className="detail-supply-qty">
                    {supply.quantity} {supply.unit}
                  </div>
                </div>
                <span className={`supply-status ${supply.status}`}>
                  {supply.status === 'needed'
                    ? t('popup.needed')
                    : supply.status === 'available'
                    ? t('popup.available')
                    : t('popup.delivered')}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Enlaces de la zona (grupos WhatsApp, canales, páginas) */}
        <div className="detail-section">
          <div className="detail-section-title">
            🔗 Grupos y Canales ({zoneLinks.length})
          </div>
          {zoneLinks.length === 0 && !showLinkForm && (
            <p className="detail-no-data">{t('popup.noLinks')}</p>
          )}
          {categorizedLinks.map(({ cat, config, links: catLinks }) => (
            <div key={cat} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: config.color, marginBottom: 4 }}>
                {config.icon} {tLinkCategory(cat, lang)}
              </div>
              {catLinks.map((link) => (
                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginBottom: 4 }}>
                  <a
                    href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#60A5FA', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {link.title}
                  </a>
                  <span style={{ fontSize: 10, color: '#475569', flexShrink: 0 }}>{getDomain(link.url)}</span>
                  {userCanEdit && (
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      style={{ width: 20, height: 20, border: 'none', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
          {userCanEdit && !showLinkForm && (
            <button
              onClick={() => setShowLinkForm(true)}
              style={{ width: '100%', padding: '8px', border: '1px dashed #475569', borderRadius: 6, background: 'transparent', color: '#94a3b8', fontSize: 12, cursor: 'pointer', textAlign: 'center', marginTop: 4 }}
            >
              {t('popup.addLink')}
            </button>
          )}
          {showLinkForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid #334155', marginTop: 4 }}>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('popup.linkTitle')}</label>
                <input className="form-input" placeholder="Ej: Rescate Centro" value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('popup.linkUrl')}</label>
                <input className="form-input" placeholder="https://chat.whatsapp.com/..." value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('popup.linkCategory')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                  {CATEGORY_ORDER.map((cat) => {
                    const cfg = RESCUE_LINK_CATEGORIES[cat];
                    return (
                      <button
                        key={cat}
                        style={{ padding: '6px', borderRadius: 6, border: `1px solid ${cfg.color}`, background: linkCategory === cat ? `${cfg.color}22` : 'transparent', color: linkCategory === cat ? cfg.color : '#94a3b8', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}
                        onClick={() => setLinkCategory(cat)}
                      >
                        {cfg.icon} {tLinkCategory(cat, lang)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('popup.linkDesc')}</label>
                <input className="form-input" placeholder="Breve descripción" value={linkDesc} onChange={(e) => setLinkDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: 12, padding: '8px' }} onClick={handleAddLink}>{t('popup.linkSubmit')}</button>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: 12, padding: '8px' }} onClick={() => setShowLinkForm(false)}>{t('popup.linkCancel')}</button>
              </div>
            </div>
          )}
        </div>

        {/* Coordenadas */}
        <div className="detail-coords">
          {t('popup.coords')} {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
          <br />
          <span style={{ fontSize: 10, color: '#475569' }}>
            {t('popup.created')} {new Date(marker.createdAt).toLocaleString('es-VE')} ·
            {t('popup.updated')} {new Date(marker.updatedAt).toLocaleString('es-VE')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarkerPopup;
