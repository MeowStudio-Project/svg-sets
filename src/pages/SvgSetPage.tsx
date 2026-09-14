import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSetById, loadSetFiles } from '../lib/manifest';
import { SvgGrid } from '../components/SvgGrid';
import type { SvgFile } from '../lib/types';

export function SvgSetPage() {
  const { id } = useParams<{ id: string }>();
  const set = id ? getSetById(id) : undefined;
  const [files, setFiles] = useState<SvgFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!set) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    loadSetFiles(set)
      .then((f) => {
        if (!cancelled) {
          setFiles(f);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [set]);

  if (!set) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h1 className="error-code">404</h1>
          <Link to="/" className="error-back" aria-label="Back to home">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
        </div>
        <style>{`
          .error-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - var(--header-h));
            padding: 24px 16px;
          }
          .error-content {
            text-align: center;
          }
          .error-code {
            margin: 0 0 20px;
            font-size: 4rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: var(--text);
            line-height: 1;
          }
          .error-back {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: var(--radius-sm);
            color: var(--text-secondary);
            transition: background 0.15s, color 0.15s;
          }
          .error-back:hover {
            background: var(--bg-hover);
            color: var(--text);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="set-page">
      <div className="set-inner">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1 className="set-title">{set.name}</h1>
        <div className="set-meta">
          {set.authorUrl ? (
            <a
              href={set.authorUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="meta-author"
            >
              {set.authorName ?? 'Unknown author'}
            </a>
          ) : (
            <span className="meta-author">{set.authorName ?? 'Unknown author'}</span>
          )}
          {set.authorUrl && (
            <a
              href={set.authorUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="meta-url"
            >
              {set.authorUrl}
            </a>
          )}
          {set.licenseName && (
            set.licenseUrl ? (
              <a
                href={set.licenseUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="meta-license"
              >
                {set.licenseName} License
              </a>
            ) : (
              <span className="meta-license">{set.licenseName} License</span>
            )
          )}
        </div>
        {set.archive && (
          <div className="set-actions">
            <a
              href={set.archive.url}
              download={set.archive.name}
              className="btn"
              aria-label="Download ZIP"
              title="Download ZIP"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>ZIP</span>
            </a>
          </div>
        )}
        {loading && <p className="loading">Loading icons…</p>}
        {error && <p className="load-error">{error}</p>}
        {!loading && !error && <SvgGrid files={files} />}
      </div>
      <style>{pageStyles}</style>
    </div>
  );
}

const pageStyles = `
  .set-page {
    padding: 24px 16px 48px;
  }
  .set-inner {
    max-width: 1200px;
    margin: 0 auto;
  }
  .back-link {
    display: inline-block;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }
  .back-link:hover {
    color: var(--text);
  }
  .set-title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .set-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 20px;
  }
  .meta-author {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  a.meta-author:hover {
    color: var(--text);
    text-decoration: underline;
  }
  .meta-url {
    font-size: 0.8125rem;
    color: var(--text-muted);
    word-break: break-all;
  }
  .meta-url:hover {
    color: var(--text-secondary);
    text-decoration: underline;
  }
  .meta-license {
    font-size: 0.8125rem;
    color: var(--text-muted);
  }
  a.meta-license:hover {
    color: var(--text-secondary);
    text-decoration: underline;
  }
  .set-actions {
    margin-bottom: 24px;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 40px;
    padding: 0 16px;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    background: var(--bg-secondary);
    color: var(--text);
    border: 1px solid var(--border);
    transition: background 0.15s, border-color 0.15s;
  }
  .btn:hover {
    background: var(--bg-hover);
    border-color: var(--border-strong);
  }
  .btn svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
  .loading,
  .load-error {
    text-align: center;
    color: var(--text-secondary);
    padding: 48px 16px;
  }
  .load-error {
    color: #e11d48;
  }
  .not-found {
    text-align: center;
    color: var(--text-secondary);
    padding: 48px 16px 16px;
  }
`;
