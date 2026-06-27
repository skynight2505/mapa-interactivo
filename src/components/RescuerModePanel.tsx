import React from 'react';
import type { ZoneServices, MapMarker, RescuedPerson } from '../types';
import ZoneServicesStatus from './ZoneServicesStatus';
import RescueToolsRecommendations from './RescueToolsRecommendations';
import GroupChatPanel from './GroupChatPanel';
import BitchatGuide from './BitchatGuide';
import VolunteerTracker from './VolunteerTracker';
import ZoneSuppliesManager from './ZoneSuppliesManager';
import ZoneRescuedRegistry from './ZoneRescuedRegistry';
import ZoneLinksManager from './ZoneLinksManager';
import ZonePriorityManager from './ZonePriorityManager';
import { useI18n } from '../utils/i18n';

interface RescuerModePanelProps {
  marker: MapMarker;
  rescuedPersons: RescuedPerson[];
  onClose: () => void;
  onUpdateMarker: (id: string, updates: Partial<MapMarker>) => void;
  onAddRescued: (person: RescuedPerson) => void;
}

type RescuerTab = 'voluntarios' | 'servicios' | 'herramientas' | 'insumos' | 'rescatados' | 'grupos' | 'prioridad' | 'chat' | 'bitchat';

const TABS: { key: RescuerTab; icon: string }[] = [
  { key: 'voluntarios', icon: '👥' },
  { key: 'servicios', icon: '🔌' },
  { key: 'herramientas', icon: '🔧' },
  { key: 'insumos', icon: '📦' },
  { key: 'rescatados', icon: '🚑' },
  { key: 'grupos', icon: '🔗' },
  { key: 'prioridad', icon: '🏷️' },
  { key: 'chat', icon: '💬' },
  { key: 'bitchat', icon: '📲' },
];

const TAB_KEYS: Record<RescuerTab, string> = {
  voluntarios: 'rescue.tabVolunteers',
  servicios: 'rescue.tabServices',
  herramientas: 'rescue.tabTools',
  insumos: 'rescue.tabSupplies',
  rescatados: 'rescue.tabRescued',
  grupos: 'rescue.tabLinks',
  prioridad: 'rescue.tabPriority',
  chat: 'rescue.tabChat',
  bitchat: 'rescue.tabBitchat',
};

const DEFAULT_SERVICES: ZoneServices = {
  agua: 'parcial',
  luz: 'no_disponible',
  gasolina: 'parcial',
  internet: 'no_disponible',
  telefono: 'parcial',
  gas: 'parcial',
};

const RescuerModePanel: React.FC<RescuerModePanelProps> = ({ marker, rescuedPersons, onClose, onUpdateMarker, onAddRescued }) => {
  const [activeTab, setActiveTab] = React.useState<RescuerTab>('voluntarios');
  const [services, setServices] = React.useState<ZoneServices>(DEFAULT_SERVICES);
  const { t } = useI18n();

  return (
    <div className="rescuer-panel">
      <div className="rescuer-header">
        <div className="rescuer-header-left">
          <div className="rescuer-badge">{t('rescue.mode')}</div>
          <div className="rescuer-zone-name">{marker.title}</div>
        </div>
        <button className="detail-close" onClick={onClose}>✕</button>
      </div>

      <div className="rescuer-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`rescuer-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {t(TAB_KEYS[tab.key] as any)}
          </button>
        ))}
      </div>

      <div className="rescuer-body">
        {activeTab === 'voluntarios' && (
          <VolunteerTracker zoneName={marker.title} />
        )}
        {activeTab === 'servicios' && (
          <ZoneServicesStatus services={services} onUpdate={setServices} isEditMode={true} />
        )}
        {activeTab === 'herramientas' && <RescueToolsRecommendations />}
        {activeTab === 'insumos' && (
          <ZoneSuppliesManager
            supplies={marker.supplies}
            onUpdate={(supplies) => onUpdateMarker(marker.id, { supplies })}
          />
        )}
        {activeTab === 'rescatados' && (
          <ZoneRescuedRegistry
            zoneId={marker.id}
            zoneName={marker.title}
            rescuedPersons={rescuedPersons}
            onAddPerson={onAddRescued}
          />
        )}
        {activeTab === 'grupos' && (
          <ZoneLinksManager zoneId={marker.id} zoneName={marker.title} />
        )}
        {activeTab === 'prioridad' && (
          <ZonePriorityManager
            marker={marker}
            onUpdate={(updates) => onUpdateMarker(marker.id, updates)}
          />
        )}
        {activeTab === 'chat' && (
          <GroupChatPanel groupName={marker.title} groupId={marker.id} />
        )}
        {activeTab === 'bitchat' && <BitchatGuide />}
      </div>
    </div>
  );
};

export default RescuerModePanel;
