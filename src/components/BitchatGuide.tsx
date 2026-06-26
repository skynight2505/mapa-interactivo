import React from 'react';

const BitchatGuide: React.FC = () => {
  return (
    <div className="bitchat-guide">
      <div className="bitchat-header">
        <div className="bitchat-icon">📲</div>
        <div className="bitchat-title">Bitchat Mesh</div>
        <div className="bitchat-subtitle">
          Mensajería P2P sin internet ni señal celular
        </div>
      </div>

      <div className="bitchat-section">
        <div className="bitchat-section-title">📋 ¿Qué es Bitchat?</div>
        <p className="bitchat-text">
          Bitchat es una aplicación de código abierto que crea una <strong>red mesh por Bluetooth</strong>.
          Cada teléfono se convierte en un nodo que retransmite mensajes a otros dispositivos cercanos.
          <strong>No necesita internet, WiFi ni señal celular</strong> para funcionar.
        </p>
      </div>

      <div className="bitchat-section">
        <div className="bitchat-section-title">✅ ¿Por qué usarlo en emergencias?</div>
        <ul className="bitchat-list">
          <li><strong>Sin infraestructura:</strong> Funciona cuando las torres de celular están caídas</li>
          <li><strong>Encriptado:</strong> Comunicaciones seguras y privadas</li>
          <li><strong>Coordinación local:</strong> Ideal para equipos de rescate en una zona</li>
          <li><strong>Gratuito:</strong> Código abierto, sin costos de servicio</li>
          <li><strong>Bajo consumo:</strong> Optimizado para batería</li>
        </ul>
      </div>

      <div className="bitchat-section">
        <div className="bitchat-section-title">📲 Cómo Instalar</div>
        <div className="bitchat-steps">
          <div className="bitchat-step">
            <div className="bitchat-step-num">1</div>
            <div className="bitchat-step-content">
              <strong>iPhone:</strong> Busca "bitchat mesh" en App Store<br />
              <strong>Android:</strong> Descarga desde Google Play o Uptodown
            </div>
          </div>
          <div className="bitchat-step">
            <div className="bitchat-step-num">2</div>
            <div className="bitchat-step-content">
              <strong>Activar Bluetooth</strong> y servicios de ubicación en tu teléfono
            </div>
          </div>
          <div className="bitchat-step">
            <div className="bitchat-step-num">3</div>
            <div className="bitchat-step-content">
              <strong>Abrir la app</strong> y crear tu perfil con nombre y grupo
            </div>
          </div>
          <div className="bitchat-step">
            <div className="bitchat-step-num">4</div>
            <div className="bitchat-step-content">
              <strong>Unirse a un canal</strong> o crear uno nuevo para tu equipo de rescate
            </div>
          </div>
        </div>
      </div>

      <div className="bitchat-section">
        <div className="bitchat-section-title">⚠️ Limitaciones Importantes</div>
        <ul className="bitchat-list bitchat-warnings">
          <li><strong>Alcance limitado:</strong> Bluetooth tiene un rango de ~10-30 metros por nodo</li>
          <li><strong>Densidad de dispositivos:</strong> Funciona mejor cuando hay varios usuarios cerca</li>
          <li><strong>No es un reemplazo:</strong> Complemento a radios VHF y servicios oficiales</li>
          <li><strong>Batería:</strong> Mantener Bluetooth activado consume batería</li>
        </ul>
      </div>

      <div className="bitchat-section">
        <div className="bitchat-section-title">💡 Consejos para Rescatistas</div>
        <ul className="bitchat-list">
          <li>Crear un <strong>canal por equipo</strong> (Alpha, Bravo, Charlie)</li>
          <li>Enviar <strong>actualizaciones cada 30 min</strong> de tu posición</li>
          <li>Usar <strong>códigos cortos</strong>: "OK" = todo bien, "SOS" = emergencia</li>
          <li>Mantener al menos <strong>2 personas con la app</strong> por equipo</li>
          <li>Cargar baterías externas para sesiones largas</li>
        </ul>
      </div>

      <div className="bitchat-links">
        <a href="https://apps.apple.com/app/bitchat-mesh/id6748219622" target="_blank" rel="noreferrer" className="bitchat-link">
          🍎 App Store (iPhone)
        </a>
        <a href="https://bitchat.en.uptodown.com/android" target="_blank" rel="noreferrer" className="bitchat-link">
          🤖 Google Play / Android
        </a>
      </div>
    </div>
  );
};

export default BitchatGuide;
