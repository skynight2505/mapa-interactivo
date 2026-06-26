import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../utils/auth';
import NotificationPanel from './NotificationPanel';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '../utils/i18n';

interface HeaderProps {
  isEditMode: boolean;
  onToggleMode: () => void;
  markerCount: number;
  user: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onImportClick: () => void;
  onRescuedClick: () => void;
  isRescueMode: boolean;
  onToggleRescue: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isEditMode, onToggleMode, markerCount, user,
  onLoginClick, onLogout, onExportJSON, onExportCSV,
  onImportClick, onRescuedClick, isRescueMode, onToggleRescue,
}) => {
  const { t } = useI18n();
  const [dataOpen, setDataOpen] = useState(false);
  const dataRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dataRef.current && !dataRef.current.contains(e.target as Node)) {
        setDataOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <div className="header-info">
          <h1 className="header-title">{t('app.title')}</h1>
          <span className="header-subtitle">{markerCount} {t('app.subtitle')}</span>
        </div>
      </div>

      <div className="header-right">
        <LanguageSelector />

        <div className="header-dropdown" ref={dataRef}>
          <button className="header-action-btn" onClick={() => setDataOpen(!dataOpen)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            {t('btn.data')}
          </button>
          {dataOpen && (
            <div className="header-dropdown-menu show">
              <button onClick={() => { onExportJSON(); setDataOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {t('btn.exportJson')}
              </button>
              <button onClick={() => { onExportCSV(); setDataOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                {t('btn.exportCsv')}
              </button>
              <button onClick={() => { onImportClick(); setDataOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {t('btn.importJson')}
              </button>
              <button onClick={() => { onRescuedClick(); setDataOpen(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                {t('btn.rescuedPersons')}
              </button>
            </div>
          )}
        </div>

        <NotificationPanel />

        <button className={`mode-toggle ${isRescueMode ? 'rescue' : 'rescue-idle'}`} onClick={onToggleRescue} title={t('btn.rescueMode')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          {isRescueMode ? t('btn.rescueMode') : 'Rescatista'}
        </button>

        {user ? (
          <div className="header-user">
            <span className="header-user-badge">
              {user.role === 'admin' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
              {user.displayName}
            </span>
            <button className="header-action-btn" onClick={onLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {t('btn.logout')}
            </button>
          </div>
        ) : (
          <button className="header-action-btn" onClick={onLoginClick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            {t('btn.login')}
          </button>
        )}

        <button className={`mode-toggle ${isEditMode ? 'edit' : 'view'}`} onClick={onToggleMode}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isEditMode
              ? <><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></>
              : <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>
            }
          </svg>
          {isEditMode ? t('btn.editMode') : t('btn.readOnly')}
        </button>
      </div>
    </header>
  );
};

export default Header;
