import React, { useState, useRef, useEffect } from 'react';
import { useI18n, LANGUAGES, type Language } from '../utils/i18n';

const LANG_LIST = Object.entries(LANGUAGES) as [Language, typeof LANGUAGES[Language]][];

const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [animDir, setAnimDir] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = () => {
    if (!isOpen) {
      setAnimDir('enter');
      setIsOpen(true);
    } else {
      setAnimDir('exit');
      setTimeout(() => setIsOpen(false), 150);
    }
  };

  const select = (key: Language) => {
    setAnimDir('exit');
    setTimeout(() => {
      setLang(key);
      setIsOpen(false);
    }, 100);
  };

  const current = LANGUAGES[lang];

  return (
    <div className="lang-selector" ref={wrapperRef}>
      <button className="lang-selector-btn" onClick={toggle} title={current.label}>
        <span className="lang-flag">{current.icon}</span>
        <span className="lang-name">{current.label}</span>
        <svg className={`lang-chevron ${isOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className={`lang-dropdown ${animDir}`}>
          {LANG_LIST.map(([key, data]) => (
            <button
              key={key}
              className={`lang-option ${key === lang ? 'active' : ''}`}
              onClick={() => select(key)}
            >
              <span className="lang-flag">{data.icon}</span>
              <div className="lang-option-text">
                <span className="lang-option-label">{data.label}</span>
                <span className="lang-option-code">{key.toUpperCase()}</span>
              </div>
              {key === lang && (
                <svg className="lang-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
