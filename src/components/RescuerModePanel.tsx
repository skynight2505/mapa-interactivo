import React, { useState } from 'react';
import type { ZoneServices, MapMarker } from '../types';
import ZoneServicesStatus from './ZoneServicesStatus';
import RescueToolsRecommendations from './RescueToolsRecommendations';
import GroupChatPanel from './GroupChatPanel';
import BitchatGuide from './BitchatGuide';
import VolunteerTracker from './VolunteerTracker';
import { useI18n } from '../utils/i18n';

interface RescuerModePanelProps {
  marker: MapMarker;
  onClose: () => void;
}

type RescuerTab = 'voluntarios' | 'servicios' | 'herramientas' | 'chat' | 'bitchat';

const TABS: { key: RescuerTab; icon: string }[] = [
  { key: 'voluntarios', icon: '👥' },
  { key: 'servicios', icon: '🔌' },
  { key: 'herramientas', icon: '🔧' },
  { key: 'chat', icon: '💬' },
  { key: 'bitchat', icon: '📲' },
];

const TAB_KEYS: Record<RescuerTab, string> = {
  voluntarios: 'rescue.tabVolunteers',
  servicios: 'rescue.tabServices',
  herramientas: 'rescue.tabTools',
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

const RescuerModePanel: React.FC<RescuerModePanelProps> = ({ marker, onClose }) => {
  const [activeTab, setActiveTab] = useState<RescuerTab>('voluntarios');
  const [services, setServices] = useState<ZoneServices>(DEFAULT_SERVICES);
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
        {activeTab === 'chat' && (
          <GroupChatPanel groupName={marker.title} groupId={marker.id} />
        )}
        {activeTab === 'bitchat' && <BitchatGuide />}
      </div>
    </div>
  );
};

export default RescuerModePanel;
