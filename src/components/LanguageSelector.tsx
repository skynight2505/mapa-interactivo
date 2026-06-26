import React, { useState, useRef, useEffect } from 'react';
import { useI18n, LANGUAGES, type Language } from '../utils/i18n';

const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES[lang];

  return (
    <div className="lang-selector" ref={wrapperRef}>
      <button
        className="lang-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Change Language / Cambiar Idioma"
      >
        <span className="lang-selector-icon">{current.icon}</span>
        <span className="lang-selector-code">{lang.toUpperCase()}</span>
        <span className={`lang-selector-chevron ${isOpen ? 'open' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="lang-selector-dropdown">
          {(Object.keys(LANGUAGES) as Language[]).map((key) => (
            <button
              key={key}
              className={`lang-selector-option ${key === lang ? 'active' : ''}`}
              onClick={() => {
                setLang(key);
                setIsOpen(false);
              }}
            >
              <span className="lang-option-icon">{LANGUAGES[key].icon}</span>
              <span className="lang-option-label">{LANGUAGES[key].label}</span>
              {key === lang && <span className="lang-option-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
