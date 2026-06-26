import React, { useState } from 'react';
import type { ZoneServices, MapMarker } from '../types';
import ZoneServicesStatus from './ZoneServicesStatus';
import RescueToolsRecommendations from './RescueToolsRecommendations';
import GroupChatPanel from './GroupChatPanel';
import BitchatGuide from './BitchatGuide';
import VolunteerTracker from './VolunteerTracker';

interface RescuerModePanelProps {
  marker: MapMarker;
  onClose: () => void;
}

type RescuerTab = 'voluntarios' | 'servicios' | 'herramientas' | 'chat' | 'bitchat';

const TABS: { key: RescuerTab; label: string; icon: string }[] = [
  { key: 'voluntarios', label: 'Voluntarios', icon: '👥' },
  { key: 'servicios', label: 'Servicios', icon: '🔌' },
  { key: 'herramientas', label: 'Herramientas', icon: '🔧' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'bitchat', label: 'Bitchat', icon: '📲' },
];

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

  return (
    <div className="rescuer-panel">
      <div className="rescuer-header">
        <div className="rescuer-header-left">
          <div className="rescuer-badge">🆘 MODO RESCATISTA</div>
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
            {tab.icon} {tab.label}
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
