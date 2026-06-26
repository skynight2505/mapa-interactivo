import React, { useState } from 'react';
import { login } from '../utils/auth';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      onLogin();
    } else {
      setError(result.error || 'Error de autenticación');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="login-logo">🔐</div>
        <h2 className="login-title">Acceso de Administración</h2>
        <p className="login-subtitle">
          Inicia sesión para editar el mapa de terremoto
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuario</label>
            <input
              className="form-input"
              type="text"
              placeholder="Tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              className="form-input"
              type="password"
              placeholder="Tu contraseña"
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
            {loading ? '⏳ Entrando...' : '🚪 Iniciar Sesión'}
          </button>
        </form>

        <div className="login-demo">
          <div className="login-demo-title">Credenciales de demostración:</div>
          <div className="login-demo-item">
            <strong>Admin:</strong> admin / admin123
          </div>
          <div className="login-demo-item">
            <strong>Editor:</strong> editor / admin123
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
