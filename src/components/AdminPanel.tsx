import React, { useState, useEffect } from 'react';
import { getAllUsers, addUser, removeUser, updateUserRole, resetUserPassword, type UserRole } from '../utils/auth';
import { useI18n } from '../utils/i18n';

interface AdminPanelProps {
  onClose: () => void;
  onRefreshMap: () => void;
  refreshLoading: boolean;
  onAutoGroup?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onRefreshMap, refreshLoading, onAutoGroup }) => {
  const { t } = useI18n();
  const [users, setUsers] = useState<ReturnType<typeof getAllUsers>>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'editor' as UserRole, displayName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  function refresh() {
    setUsers(getAllUsers());
    setError('');
    setSuccess('');
  }

  function handleAdd() {
    if (!newUser.username || !newUser.password) {
      setError('Usuario y contraseña requeridos');
      return;
    }
    const r = addUser(newUser.username, newUser.password, newUser.role, newUser.displayName);
    if (r.success) {
      setSuccess(`Usuario "${newUser.username}" creado`);
      setNewUser({ username: '', password: '', role: 'editor', displayName: '' });
      refresh();
    } else {
      setError(r.error || 'Error al crear');
    }
  }

  function handleRemove(username: string) {
    if (!confirm(`¿Eliminar usuario "${username}"?`)) return;
    const r = removeUser(username);
    if (r.success) {
      setSuccess(`Usuario "${username}" eliminado`);
      refresh();
    } else {
      setError(r.error || 'Error al eliminar');
    }
  }

  function handleRoleChange(username: string, role: UserRole) {
    const r = updateUserRole(username, role);
    if (r.success) {
      setSuccess(`Rol de "${username}" actualizado`);
      refresh();
    } else {
      setError(r.error || 'Error al actualizar rol');
    }
  }

  function handleResetPass(username: string) {
    const newPass = prompt('Nueva contraseña:');
    if (!newPass || newPass.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    const r = resetUserPassword(username, newPass);
    if (r.success) {
      setSuccess(`Contraseña de "${username}" restablecida`);
    } else {
      setError(r.error || 'Error al restablecer');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h2>{t('admin.title')}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && <div className="login-error">⚠️ {error}</div>}
          {success && <div style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.15)', color: '#22C55E', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>✅ {success}</div>}

          <button
            onClick={onRefreshMap}
            disabled={refreshLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginBottom: 16,
              padding: '10px 14px', background: '#1e3a5f', border: '1px solid #2563eb',
              borderRadius: 8, color: '#60A5FA', fontSize: 13, fontWeight: 600,
              cursor: refreshLoading ? 'wait' : 'pointer', opacity: refreshLoading ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>
              {refreshLoading ? '⏳' : '🔄'}
            </span>
            {refreshLoading ? t('admin.syncing') : t('admin.sync')}
          </button>

          {onAutoGroup && (
            <button
              onClick={onAutoGroup}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginBottom: 16,
                padding: '10px 14px', background: 'rgba(124,58,237,0.15)', border: '1px solid #7C3AED',
                borderRadius: 8, color: '#A78BFA', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>📋</span>
              Agrupar zonas automáticamente
            </button>
          )}

          <h3 style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>{t('admin.users')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {users.map(u => (
              <div key={u.username} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                background: '#1e293b', borderRadius: 8, fontSize: 13,
              }}>
                <span style={{ flex: 1, color: '#e2e8f0' }}>{u.displayName || u.username}</span>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 4,
                  background: u.role === 'admin' ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)',
                  color: u.role === 'admin' ? '#EF4444' : '#60A5FA',
                }}>
                  {u.role === 'admin' ? t('admin.admin') : u.role === 'editor' ? t('admin.editor') : t('admin.viewer')}
                </span>
                {u.username !== 'admin' && (
                  <>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.username, e.target.value as UserRole)}
                      style={{
                        padding: '4px 6px', background: '#0f172a', border: '1px solid #334155',
                        borderRadius: 4, color: '#e2e8f0', fontSize: 11,
                      }}
                    >
                      <option value="editor">{t('admin.editor')}</option>
                      <option value="admin">{t('admin.admin')}</option>
                      <option value="viewer">{t('admin.viewer')}</option>
                    </select>
                    <button
                      onClick={() => handleResetPass(u.username)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 2, color: '#f59e0b' }}
                      title={t('admin.changePass')}
                    >🔑</button>
                    <button
                      onClick={() => handleRemove(u.username)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 2, color: '#EF4444' }}
                      title={t('sidebar.delete')}
                    >🗑️</button>
                  </>
                )}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>{t('admin.newUser')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="form-input"
              placeholder={t('admin.usernamePlaceholder')}
              value={newUser.username}
              onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
            />
            <input
              className="form-input"
              type="password"
              placeholder={t('admin.passwordPlaceholder')}
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
            />
            <input
              className="form-input"
              placeholder={t('admin.displayNamePlaceholder')}
              value={newUser.displayName}
              onChange={(e) => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
            />
            <select
              className="form-input"
              value={newUser.role}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
              style={{ cursor: 'pointer' }}
            >
              <option value="editor">{t('admin.roleEditor')}</option>
              <option value="admin">{t('admin.roleAdmin')}</option>
              <option value="viewer">{t('admin.roleViewer')}</option>
            </select>
            <button className="btn btn-primary" onClick={handleAdd} style={{ alignSelf: 'flex-start' }}>
              {t('admin.createUser')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
