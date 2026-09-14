import { SvgIcon } from './SvgIcon';
import type { SvgFile } from '../lib/types';

type Props = {
  files: SvgFile[];
};

export function SampleGrid({ files }: Props) {
  const samples = files.slice(0, 6);

  return (
    <div className="sample-grid">
      {samples.map((file) => (
        <div key={file.key} className="sample-cell">
          <SvgIcon file={file} size="100%" />
        </div>
      ))}
      <style>{`
        .sample-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 8px;
          aspect-ratio: 3 / 2;
          width: 100%;
        }
        .sample-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          overflow: hidden;
        }
        .sample-cell svg {
          width: 100%;
          height: 100%;
          max-width: 48px;
          max-height: 48px;
        }
      `}</style>
    </div>
  );
}
