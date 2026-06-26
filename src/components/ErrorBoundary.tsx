import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'sans-serif',
          padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Error en la aplicación</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, maxWidth: 500 }}>
            Ocurrió un error inesperado. Revisa la consola del navegador (F12) para más detalles.
          </p>
          <div style={{
            background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 24,
            maxWidth: 500, overflow: 'auto', fontSize: 12, textAlign: 'left',
            color: '#f87171', border: '1px solid #334155',
          }}>
            {this.state.error?.message || 'Error desconocido'}
          </div>
          <button onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8,
              padding: '12px 24px', fontSize: 14, cursor: 'pointer', fontWeight: 600,
            }}>
            🔄 Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
