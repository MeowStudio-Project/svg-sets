import { downloadSvg } from '../lib/svg';

type Props = {
  filename: string;
  content: string;
  label?: string;
  className?: string;
};

export function DownloadButton({
  filename,
  content,
  label = 'Download SVG',
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => downloadSvg(filename, content)}
      className={className ?? 'btn'}
      aria-label={label}
      title={label}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>
  );
}
