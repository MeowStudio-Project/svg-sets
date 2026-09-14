import { SvgIcon } from './SvgIcon';
import { Spinner } from './Spinner';
import type { SvgFile } from '../lib/types';

type Props = {
  files: SvgFile[];
};

export function SampleGrid({ files }: Props) {
  const samples = files.slice(0, 6);

  if (samples.length === 0) {
    return (
      <div className="sample-grid sample-grid--loading">
        <Spinner size={28} />
        <style>{sampleStyles}</style>
      </div>
    );
  }

  return (
    <div className="sample-grid">
      {samples.map((file) => (
        <div key={file.key} className="sample-cell">
          <SvgIcon file={file} size="100%" />
        </div>
      ))}
      <style>{sampleStyles}</style>
    </div>
  );
}

const sampleStyles = `
  .sample-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 8px;
    aspect-ratio: 3 / 2;
    width: 100%;
  }
  .sample-grid--loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #747680;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
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
`;
