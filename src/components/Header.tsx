import React from 'react';
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
  isEditMode,
  onToggleMode,
  markerCount,
  user,
  onLoginClick,
  onLogout,
  onExportJSON,
  onExportCSV,
  onImportClick,
  onRescuedClick,
  isRescueMode,
  onToggleRescue,
}) => {
  const { t } = useI18n();

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">🗺️</div>
        <div className="header-info">
          <h1 className="header-title">
            {t('app.title')}
          </h1>
          <span className="header-subtitle">{markerCount} {t('app.subtitle')}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Export/Import dropdown */}
        <div className="header-dropdown">
          <button className="header-action-btn" title="Export / Import">
            {t('btn.data')}
          </button>
          <div className="header-dropdown-menu">
            <button onClick={onExportJSON}>{t('btn.exportJson')}</button>
            <button onClick={onExportCSV}>{t('btn.exportCsv')}</button>
            <button onClick={onImportClick}>{t('btn.importJson')}</button>
            <button onClick={onRescuedClick}>{t('btn.rescuedPersons')}</button>
          </div>
        </div>

        {/* Notification Bell */}
        <NotificationPanel />

        {/* Rescue Mode Toggle */}
        <button
          className={`mode-toggle ${isRescueMode ? 'rescue' : 'rescue-idle'}`}
          onClick={onToggleRescue}
          title={t('btn.rescueMode')}
        >
          {isRescueMode ? t('btn.rescueMode') : '🆘 Rescatista'}
        </button>

        {/* Auth controls */}
        {user ? (
          <div className="header-user">
            <span className="header-user-badge">
              {user.role === 'admin' ? '👑' : user.role === 'editor' ? '✏️' : '👁️'}{' '}
              {user.displayName}
            </span>
            <button className="header-action-btn" onClick={onLogout}>
              {t('btn.logout')}
            </button>
          </div>
        ) : (
          <button className="header-action-btn" onClick={onLoginClick}>
            {t('btn.login')}
          </button>
        )}

        <button
          className={`mode-toggle ${isEditMode ? 'edit' : 'view'}`}
          onClick={onToggleMode}
        >
          {isEditMode ? t('btn.editMode') : t('btn.readOnly')}
        </button>
      </div>
    </header>
  );
};

export default Header;
