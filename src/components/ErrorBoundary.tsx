import React from 'react';
import { useI18n } from '../utils/i18n';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends React.Component<Props & { t: (key: string) => string }, State> {
  constructor(props: Props & { t: (key: string) => string }) {
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
      const { t } = this.props;
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'sans-serif',
          padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{t('error.title')}</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, maxWidth: 500 }}>
            {t('error.desc')}
          </p>
          <div style={{
            background: '#1e293b', borderRadius: 8, padding: 16, marginBottom: 24,
            maxWidth: 500, overflow: 'auto', fontSize: 12, textAlign: 'left',
            color: '#f87171', border: '1px solid #334155',
          }}>
            {this.state.error?.message || t('error.unknown')}
          </div>
          <button onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8,
              padding: '12px 24px', fontSize: 14, cursor: 'pointer', fontWeight: 600,
            }}>
            {t('error.reload')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundary(props: Props) {
  const { t } = useI18n();
  return <ErrorBoundaryInner {...props} t={t as (key: string) => string} />;
}
