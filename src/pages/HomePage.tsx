import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategorySection } from '../components/CategorySection';
import { searchSets } from '../lib/manifest';

export function HomePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const categories = useMemo(() => searchSets(query), [query]);

  const hasResults = categories.some((c) => c.sets.length > 0);

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
