import { useLanguage } from '../hooks/useLanguage';

export function LangToggle() {
  const { lang, toggleLang, t } = useLanguage();
  // Show the language currently in use (not the one you would switch to)
  const currentLabel = lang === 'zh-TW' ? '中文繁體' : 'English';

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={toggleLang}
      aria-label={t('switchLang')}
      title={t('switchLang')}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span className="lang-label">{currentLabel}</span>
      <style>{`
        .lang-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.8125rem;
          font-weight: 500;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
        }
        .lang-toggle:hover {
          color: var(--text);
          background: var(--bg-hover);
        }
        .lang-label {
          white-space: nowrap;
        }
      `}</style>
    </button>
  );
}
