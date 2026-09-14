import { useEffect, useRef, useState } from 'react';
import { SvgIcon } from './SvgIcon';
import { CopyButton } from './CopyButton';
import { DownloadButton } from './DownloadButton';
import { buildSvgDocument } from '../lib/svg';
import { useTheme } from '../hooks/useTheme';
import type { SvgFile, Theme } from '../lib/types';

type Props = {
  file: SvgFile;
  onClose: () => void;
};

export function SvgPreview({ file, onClose }: Props) {
  const { theme: siteTheme } = useTheme();
  // Local preview theme only — does not change the whole site
  const [previewTheme, setPreviewTheme] = useState<Theme>(siteTheme);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const svgDoc = buildSvgDocument(file, previewTheme);
  const themeLabel = previewTheme === 'light' ? 'Dark mode' : 'Light mode';

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const togglePreviewTheme = () => {
    setPreviewTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <dialog
      ref={dialogRef}
      className="svg-preview-dialog"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="preview-content">
        <div className="preview-header">
          <button
            type="button"
            className="preview-theme"
            onClick={togglePreviewTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {previewTheme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
          <h2 className="preview-title">{file.name}</h2>
          <button type="button" className="preview-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className={`preview-icon preview-icon--${previewTheme}`}>
          <SvgIcon file={file} size={160} forceTheme={previewTheme} />
        </div>
        <div className="preview-code">
          <pre>
            <code>{svgDoc}</code>
          </pre>
        </div>
        <div className="preview-actions">
          <CopyButton text={svgDoc} className="preview-btn" />
          <DownloadButton filename={`${file.key}.svg`} content={svgDoc} className="preview-btn" />
        </div>
      </div>
      <style>{`
        .svg-preview-dialog {
          border: none;
          border-radius: var(--radius);
          padding: 0;
          max-width: min(520px, 94vw);
          width: 100%;
          background: var(--bg-card);
          color: var(--text);
          box-shadow: var(--shadow-lg);
        }
        .svg-preview-dialog::backdrop {
          background: rgba(0, 0, 0, 0.45);
        }
        .svg-preview-dialog .preview-content {
          padding: 20px;
        }
        .svg-preview-dialog .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .svg-preview-dialog .preview-title {
          margin: 0;
          flex: 1;
          font-size: 1.125rem;
          font-weight: 600;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .svg-preview-dialog .preview-theme,
        .svg-preview-dialog .preview-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          transition: background 0.15s, color 0.15s;
        }
        .svg-preview-dialog .preview-theme:hover,
        .svg-preview-dialog .preview-close:hover {
          background: var(--bg-hover);
          color: var(--text);
        }
        .svg-preview-dialog .preview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          border-radius: var(--radius);
          margin-bottom: 16px;
          transition: background 0.2s;
        }
        .svg-preview-dialog .preview-icon--dark {
          background: #1a1e26;
          color: #f3f4f6;
        }
        .svg-preview-dialog .preview-icon--light {
          background: #f1f3f5;
          color: #111827;
        }
        .svg-preview-dialog .preview-code {
          margin-bottom: 16px;
          max-height: 160px;
          overflow: auto;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .svg-preview-dialog .preview-code pre {
          margin: 0;
          padding: 12px;
          font-family: var(--mono);
          font-size: 0.75rem;
          line-height: 1.45;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .svg-preview-dialog .preview-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .svg-preview-dialog .preview-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          border-radius: var(--radius-sm);
          background: var(--accent);
          color: var(--bg);
          transition: opacity 0.15s;
        }
        .svg-preview-dialog .preview-btn:hover {
          opacity: 0.9;
        }
        .svg-preview-dialog .preview-btn svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </dialog>
  );
}
