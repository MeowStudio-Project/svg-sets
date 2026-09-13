import { Link } from 'react-router-dom';

export function NotFoundPage() {
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
