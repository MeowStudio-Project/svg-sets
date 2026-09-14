import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategorySection } from '../components/CategorySection';
import { Spinner } from '../components/Spinner';
import { searchSets } from '../lib/manifest';

export function HomePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Allow first paint of spinner, then show content
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const categories = useMemo(() => searchSets(query), [query]);
  const hasResults = categories.some((c) => c.sets.length > 0);

  if (!ready) {
    return (
      <div className="home-loading">
        <Spinner size={48} />
        <style>{`
          .home-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - var(--header-h));
            color: #747680;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-inner">
        {!hasResults ? (
          <p className="empty-state">No SVG Sets found</p>
        ) : (
          categories.map((cat) => (
            <CategorySection key={cat.name} name={cat.name} sets={cat.sets} />
          ))
        )}
      </div>
      <style>{`
        .home-page {
          padding: 24px 16px 48px;
        }
        .home-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .empty-state {
          text-align: center;
          color: var(--text-secondary);
          padding: 64px 16px;
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
