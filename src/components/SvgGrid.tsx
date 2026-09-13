import { useState } from 'react';
import { SvgIcon } from './SvgIcon';
import { SvgPreview } from './SvgPreview';
import { CopyButton } from './CopyButton';
import { DownloadButton } from './DownloadButton';
import { buildSvgDocument } from '../lib/svg';
import { useTheme } from '../hooks/useTheme';
import type { SvgFile } from '../lib/types';

type Props = {
  files: SvgFile[];
};

export function SvgGrid({ files }: Props) {
  const { theme } = useTheme();
  const [preview, setPreview] = useState<SvgFile | null>(null);

  return (
    <>
      <div className="svg-grid">
        {files.map((file) => {
          const svgDoc = buildSvgDocument(file, theme);
          return (
            <div key={file.key} className="svg-grid-item">
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPreview(file)}
                aria-label={`Preview ${file.name}`}
              >
                <SvgIcon file={file} size={28} />
              </button>
              <div className="icon-name" title={file.name}>
                {file.name}
              </div>
              <div className="icon-actions">
                <CopyButton text={svgDoc} className="action-btn" />
                <DownloadButton
                  filename={`${file.key}.svg`}
                  content={svgDoc}
                 
                  className="action-btn"
                />
              </div>
            </div>
          );
        })}
      </div>
      {preview && <SvgPreview file={preview} onClose={() => setPreview(null)} />}
      <style>{`
        .svg-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }
        .svg-grid-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px 8px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          transition: border-color 0.15s;
        }
        .svg-grid-item:hover {
          border-color: var(--border-strong);
        }
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
        }
        .icon-btn:hover {
          background: var(--bg-hover);
        }
        .icon-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .icon-actions {
          display: flex;
          gap: 4px;
          opacity: 1;
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border-radius: 4px;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .action-btn:hover {
          background: var(--bg-hover);
          color: var(--text);
        }
        .action-btn svg {
          width: 14px;
          height: 14px;
        }
        @media (min-width: 768px) {
          .svg-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }
        }
      `}</style>
    </>
  );
}
