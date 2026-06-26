import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';

interface GroupChatPanelProps {
  groupName: string;
  groupId: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'm1', groupId: 'rescate', sender: 'Sistema', message: 'Canal de comunicación iniciado. Bienvenidos al grupo de rescate.', timestamp: new Date(Date.now() - 3600000).toISOString(), isSystem: true },
  { id: 'm2', groupId: 'rescate', sender: 'Carlos (Bomberos)', message: 'Equipo Alpha reportando: zona segura confirmada en sector norte.', timestamp: new Date(Date.now() - 2400000).toISOString() },
  { id: 'm3', groupId: 'rescate', sender: 'María (Cruz Roja)', message: 'Necesitamos más botiquines en el punto de acopio central.', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 'm4', groupId: 'rescate', sender: 'Sistema', message: '⚠️ Alerta: Se reporta fuga de gas en zona sur. Evacuar.', timestamp: new Date(Date.now() - 1200000).toISOString(), isSystem: true },
  { id: 'm5', groupId: 'rescate', sender: 'Pedro (Defensa Civil)', message: 'Entendido. Redirigiendo equipo de rescate al sector sur.', timestamp: new Date(Date.now() - 600000).toISOString() },
];

const GroupChatPanel: React.FC<GroupChatPanelProps> = ({ groupName, groupId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRegister = () => {
    if (userName.trim()) {
      setIsRegistered(true);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim() || !userName.trim()) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      groupId,
      sender: userName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, msg]);
    setNewMessage('');

    // Simulate system response
    if (newMessage.toLowerCase().includes('ayuda') || newMessage.toLowerCase().includes('emergencia')) {
      setTimeout(() => {
        const systemMsg: ChatMessage = {
          id: crypto.randomUUID(),
          groupId,
          sender: 'Sistema',
          message: `⚠️ Solicitud de ayuda registrada de ${userName}. Un equipo será despachado.`,
          timestamp: new Date().toISOString(),
          isSystem: true,
        };
        setMessages((prev) => [...prev, systemMsg]);
      }, 2000);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isRegistered) {
    return (
      <div className="chat-register">
        <div className="chat-register-icon">💬</div>
        <div className="chat-register-title">Unirse al Chat: {groupName}</div>
        <div className="chat-register-sub">
          Ingresa tu nombre para unirte al canal de comunicación del grupo
        </div>
        <input
          className="form-input"
          placeholder="Tu nombre y rol (ej: Carlos - Bomberos)"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
          autoFocus
        />
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleRegister}>
          📡 Unirse al Chat
        </button>
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-header-name">💬 {groupName}</span>
          <span className="chat-header-status">🟢 En línea</span>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.isSystem ? 'system' : ''} ${msg.sender === userName ? 'own' : ''}`}
          >
            {msg.isSystem ? (
              <div className="chat-message-system">{msg.message}</div>
            ) : (
              <>
                <div className="chat-message-sender">{msg.sender}</div>
                <div className="chat-message-text">{msg.message}</div>
                <div className="chat-message-time">{formatTime(msg.timestamp)}</div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          className="form-input"
          placeholder="Escribe tu mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={handleSend}>
          📤 Enviar
        </button>
      </div>
    </div>
  );
};

export default GroupChatPanel;
