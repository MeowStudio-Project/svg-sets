import { Link, useParams } from 'react-router-dom';
import { getSetById } from '../lib/manifest';
import { SvgGrid } from '../components/SvgGrid';
import { DownloadButton } from '../components/DownloadButton';

export function SvgSetPage() {
  const { id } = useParams<{ id: string }>();
  const set = id ? getSetById(id) : undefined;

  if (!set) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h1 className="error-code">404</h1>
          <Link to="/" className="error-back">
            返回svg
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
            margin: 0 0 16px;
            font-size: 4rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            color: var(--text);
            line-height: 1;
          }
          .error-back {
            display: inline-block;
            font-size: 0.9375rem;
            color: var(--text-secondary);
            text-decoration: underline;
          }
          .error-back:hover {
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>ZIP</span>
            </a>
          </div>
        )}
        <SvgGrid files={set.files} />
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
    gap: 6px;
    height: 36px;
    padding: 0 14px;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    font-weight: 500;
    background: var(--accent);
    color: var(--bg);
    transition: opacity 0.15s;
  }
  .btn:hover {
    opacity: 0.9;
  }
  .not-found {
    text-align: center;
    color: var(--text-secondary);
    padding: 48px 16px 16px;
  }
`;
