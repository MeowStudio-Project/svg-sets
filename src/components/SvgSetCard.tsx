import { Link } from 'react-router-dom';
import { SampleGrid } from './SampleGrid';
import type { SvgSet } from '../lib/types';

type Props = {
  set: SvgSet;
};

export function SvgSetCard({ set }: Props) {
  return (
    <Link to={`/svg-set/${set.id}`} className="svg-set-card" aria-label={`Open ${set.name}`}>
      <SampleGrid files={set.sampleFiles} />
      <div className="card-name">{set.name}</div>
      <style>{`
        .svg-set-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
          color: inherit;
        }
        .svg-set-card:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-lg);
        }
        .svg-set-card:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        .card-name {
          font-size: 0.9375rem;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </Link>
  );
}
