import { Link } from 'react-router-dom';

export function NotFoundPage() {
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
