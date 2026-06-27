import React, { useState } from 'react';
import type { RescueLink, RescueLinkCategory } from '../types';
import { RESCUE_LINK_CATEGORIES } from '../types';
import { loadAllLinks, saveAllLinks } from '../utils/links';

interface ZoneLinksManagerProps {
  zoneId: string;
  zoneName: string;
}

const CATEGORY_ORDER: RescueLinkCategory[] = ['whatsapp', 'canal_informativo', 'pagina'];

const ZoneLinksManager: React.FC<ZoneLinksManagerProps> = ({ zoneId, zoneName }) => {
  const [links, setLinks] = useState<RescueLink[]>(loadAllLinks);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<RescueLinkCategory>('whatsapp');
  const [description, setDescription] = useState('');

  const zoneLinks = links.filter((l) => l.zoneId === zoneId);

  const updateLinks = (newLinks: RescueLink[]) => {
    setLinks(newLinks);
    saveAllLinks(newLinks);
  };

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return;
    const newLink: RescueLink = {
      id: crypto.randomUUID(),
      title: title.trim(),
      url: url.trim(),
      category,
      zoneId,
      zoneName,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    updateLinks([...links, newLink]);
    setTitle('');
    setUrl('');
    setCategory('whatsapp');
    setDescription('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    updateLinks(links.filter((l) => l.id !== id));
  };

  const getDomain = (urlStr: string) => {
    try {
      return new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`).hostname;
    } catch {
      return urlStr;
    }
  };

  return (
    <div className="zone-links-manager">
      <div className="zone-links-intro">
        Comparte enlaces útiles para esta zona: grupos de WhatsApp, canales de información y páginas web.
      </div>

      {zoneLinks.length === 0 ? (
        <div className="zone-links-empty">
          No hay enlaces registrados para esta zona.
        </div>
      ) : (
        CATEGORY_ORDER.map((cat) => {
          const catLinks = zoneLinks.filter((l) => l.category === cat);
          if (catLinks.length === 0) return null;
          const catConfig = RESCUE_LINK_CATEGORIES[cat];
          return (
            <div key={cat} className="zone-links-category">
              <div className="zone-links-cat-header" style={{ color: catConfig.color }}>
                {catConfig.icon} {catConfig.label}
              </div>
              {catLinks.map((link) => (
                <div key={link.id} className="zone-links-item">
                  <div className="zone-links-item-content">
                    <a
                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="zone-links-item-title"
                    >
                      {link.title}
                    </a>
                    <div className="zone-links-item-domain">{getDomain(link.url)}</div>
                    {link.description && (
                      <div className="zone-links-item-desc">{link.description}</div>
                    )}
                  </div>
                  <button
                    className="zone-links-delete-btn"
                    onClick={() => handleDelete(link.id)}
                    title="Eliminar enlace"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          );
        })
      )}

      {showForm ? (
        <div className="zone-links-form">
          <div className="form-group">
            <label className="form-label">Título</label>
            <input
              className="form-input"
              placeholder="Ej: Rescate Zona Centro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Enlace (URL)</label>
            <input
              className="form-input"
              placeholder="https://chat.whatsapp.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <div className="zone-links-category-select">
              {CATEGORY_ORDER.map((cat) => {
                const cfg = RESCUE_LINK_CATEGORIES[cat];
                return (
                  <button
                    key={cat}
                    className={`zone-links-category-opt ${category === cat ? 'active' : ''}`}
                    style={{
                      borderColor: cfg.color,
                      backgroundColor: category === cat ? `${cfg.color}22` : 'transparent',
                      color: category === cat ? cfg.color : '#94a3b8',
                    }}
                    onClick={() => setCategory(cat)}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción (opcional)</label>
            <input
              className="form-input"
              placeholder="Breve descripción del grupo o canal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-row">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleAdd}>
              ✅ Agregar Enlace
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button className="zone-links-add-btn" onClick={() => setShowForm(true)}>
          🔗 Agregar Grupo o Canal
        </button>
      )}
    </div>
  );
};

export default ZoneLinksManager;
