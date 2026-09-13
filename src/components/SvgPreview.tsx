import { useEffect, useRef } from 'react';
import { SvgIcon } from './SvgIcon';
import { CopyButton } from './CopyButton';
import { DownloadButton } from './DownloadButton';
import { buildSvgDocument, getIconBody } from '../lib/svg';
import { useTheme } from '../hooks/useTheme';
import type { SvgFile } from '../lib/types';

type Props = {
  file: SvgFile;
  onClose: () => void;
};

export function SvgPreview({ file, onClose }: Props) {
  const { theme } = useTheme();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const body = getIconBody(file, theme);
  const svgDoc = buildSvgDocument(body);

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
          <h2 className="preview-title">{file.name}</h2>
          <button type="button" className="preview-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="preview-icon">
          <SvgIcon file={file} size={160} />
        </div>
        <div className="preview-code">
          <pre>
            <code>{svgDoc}</code>
          </pre>
        </div>
        <div className="preview-actions">
          <CopyButton text={svgDoc} />
          <DownloadButton filename={`${file.key}.svg`} content={svgDoc} />
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
        .preview-content {
          padding: 20px;
        }
        .preview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .preview-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }
        .preview-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
        }
        .preview-close:hover {
          background: var(--bg-hover);
          color: var(--text);
        }
        .preview-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background: var(--bg-secondary);
          border-radius: var(--radius);
          margin-bottom: 16px;
        }
        .preview-code {
          margin-bottom: 16px;
          max-height: 160px;
          overflow: auto;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
        }
        .preview-code pre {
          margin: 0;
          padding: 12px;
          font-family: var(--mono);
          font-size: 0.75rem;
          line-height: 1.45;
          white-space: pre-wrap;
          word-break: break-all;
        }
        .preview-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .btn {
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
        .btn:hover {
          opacity: 0.9;
        }
        .btn svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </dialog>
  );
}
