import React from 'react';
import type { RescueTool } from '../types';
import { useI18n } from '../utils/i18n';

const RECOMMENDED_TOOLS: RescueTool[] = [
  // Rescate
  { id: 't1', name: 'Pico y pala', description: 'Para despejar escombros y abrir paso', icon: '⛏️', priority: 'alta', category: 'rescate' },
  { id: 't2', name: 'Cuerdas de rescate', description: 'Mínimo 30m de cuerda resistente', icon: '🪢', priority: 'alta', category: 'rescate' },
  { id: 't3', name: 'Martillo hidráulico', description: 'Para romper concreto y metal', icon: '🔨', priority: 'media', category: 'rescate' },
  { id: 't4', name: 'Sierra de mano', description: 'Para cortar escombros de madera', icon: '🪚', priority: 'media', category: 'rescate' },

  // Comunicación
  { id: 't5', name: 'Radio VHF/UHF', description: 'Comunicación sin señal celular', icon: '📻', priority: 'alta', category: 'comunicacion' },
  { id: 't6', name: 'Bitchat (Mesh)', description: 'App P2P sin internet por Bluetooth', icon: '📲', priority: 'alta', category: 'comunicacion' },
  { id: 't7', name: 'Batería externa', description: 'Mínimo 20,000mAh para cargar dispositivos', icon: '🔋', priority: 'alta', category: 'comunicacion' },
  { id: 't8', name: 'Linterna LED recargable', description: 'Al menos 1000 lúmenes', icon: '🔦', priority: 'media', category: 'comunicacion' },

  // Salud
  { id: 't9', name: 'Botiquín completo', description: 'Gasas, vendajes, antiséptico, analgésicos', icon: '🩹', priority: 'alta', category: 'salud' },
  { id: 't10', name: 'Oxígeno portátil', description: 'Cilindro de oxígeno de emergencia', icon: '🫁', priority: 'alta', category: 'salud' },
  { id: 't11', name: 'Inmovilizadores', description: 'Para fracturas y lesiones', icon: '🦴', priority: 'media', category: 'salud' },
  { id: 't12', name: 'Mascarillas N95', description: 'Protección contra polvo de escombros', icon: '😷', priority: 'media', category: 'salud' },

  // Logística
  { id: 't13', name: 'Agua embotellada', description: 'Mínimo 5L por persona por día', icon: '🧴', priority: 'alta', category: 'logistica' },
  { id: 't14', name: 'Comida no perecedera', description: 'Latas, barras energéticas, frutos secos', icon: '🥫', priority: 'alta', category: 'logistica' },
  { id: 't15', name: 'Tiendas de campaña', description: 'Refugio temporal y protección', icon: '⛺', priority: 'media', category: 'logistica' },
  { id: 't16', name: 'Mantas térmicas', description: 'Para proteger del frío y shock', icon: '🧣', priority: 'media', category: 'logistica' },

  // Seguridad
  { id: 't17', name: 'Chaleco reflectivo', description: 'Visibilidad en zona de escombros', icon: '🦺', priority: 'media', category: 'seguridad' },
  { id: 't18', name: 'Casco de seguridad', description: 'Protección contra caída de escombros', icon: '⛑️', priority: 'alta', category: 'seguridad' },
  { id: 't19', name: 'Guantes de trabajo', description: 'Protección para manos', icon: '🧤', priority: 'media', category: 'seguridad' },
  { id: 't20', name: 'Cinta delimitadora', description: 'Para marcar zonas peligrosas', icon: '🚨', priority: 'baja', category: 'seguridad' },
];

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  rescate: { label: 'Rescate', icon: '🆘', color: '#EF4444' },
  comunicacion: { label: 'Comunicación', icon: '📡', color: '#3B82F6' },
  salud: { label: 'Salud', icon: '🏥', color: '#22C55E' },
  logistica: { label: 'Logística', icon: '📦', color: '#F59E0B' },
  seguridad: { label: 'Seguridad', icon: '🦺', color: '#8B5CF6' },
};

const PRIORITY_COLORS: Record<string, string> = {
  alta: '#EF4444',
  media: '#F59E0B',
  baja: '#22C55E',
};

const RescueToolsRecommendations: React.FC = () => {
  useI18n();
  const categories = Object.keys(CATEGORY_LABELS);

  return (
    <div className="rescue-tools">
      <div className="rescue-tools-title">🔧 Herramientas Recomendadas</div>
      {categories.map((cat) => {
        const config = CATEGORY_LABELS[cat];
        const tools = RECOMMENDED_TOOLS.filter((t) => t.category === cat);
        return (
          <div key={cat} className="rescue-tools-category">
            <div className="rescue-tools-cat-header" style={{ borderLeftColor: config.color }}>
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </div>
            <div className="rescue-tools-list">
              {tools.map((tool) => (
                <div key={tool.id} className="rescue-tool-item">
                  <div className="rescue-tool-icon">{tool.icon}</div>
                  <div className="rescue-tool-info">
                    <div className="rescue-tool-name">
                      {tool.name}
                      <span
                        className="rescue-tool-priority"
                        style={{ color: PRIORITY_COLORS[tool.priority] }}
                      >
                        {tool.priority}
                      </span>
                    </div>
                    <div className="rescue-tool-desc">{tool.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RescueToolsRecommendations;
