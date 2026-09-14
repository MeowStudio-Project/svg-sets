import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SampleGrid } from './SampleGrid';
import { Spinner } from './Spinner';
import { loadSetFiles } from '../lib/manifest';
import type { IconSearchHit, SvgFile } from '../lib/types';

type Props = {
  hit: IconSearchHit;
};

export function SearchIconCard({ hit }: Props) {
  const { set, matchedKeys } = hit;
  const [files, setFiles] = useState<SvgFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadSetFiles(set)
      .then((all) => {
        if (cancelled) return;
        const keySet = new Set(matchedKeys.map((k) => k.toLowerCase()));
        const matched = all.filter((f) => keySet.has(f.key.toLowerCase()));
        // keep matchedKeys order
        const order = new Map(matchedKeys.map((k, i) => [k.toLowerCase(), i]));
        matched.sort(
          (a, b) =>
            (order.get(a.key.toLowerCase()) ?? 0) - (order.get(b.key.toLowerCase()) ?? 0)
        );
        setFiles(matched.slice(0, 6));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setFiles([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [set, matchedKeys]);

  return (
    <Link to={`/svg-set/${set.id}`} className="svg-set-card" aria-label={`Open ${set.name}`}>
      {loading ? (
        <div className="card-loading">
          <Spinner size={28} />
        </div>
      ) : (
        <SampleGrid files={files} />
      )}
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
          transition: border-color 0.15s, box-shadow 0.15s;
          color: inherit;
        }
        .svg-set-card:hover {
          border-color: var(--border-strong);
          box-shadow: var(--shadow-lg);
        }
        .card-name {
          font-size: 0.9375rem;
          font-weight: 600;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 3 / 2;
          width: 100%;
          color: #747680;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </Link>
  );
}
