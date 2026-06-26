import React, { useState } from 'react';
import { login } from '../utils/auth';
import { useI18n } from '../utils/i18n';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      onLogin();
    } else {
      setError(result.error || t('login.title'));
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-logo">🔐</div>
        <h2 className="login-title">{t('login.title')}</h2>
        <p className="login-subtitle">
          {t('login.subtitle')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('login.username')}</label>
            <input
              className="form-input"
              type="text"
              placeholder={t('login.usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('login.password')}</label>
            <input
              className="form-input"
              type="password"
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="login-error">⚠️ {error}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
