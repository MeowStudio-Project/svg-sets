import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategorySection } from '../components/CategorySection';
import { SearchIconCard } from '../components/SearchIconCard';
import { Spinner } from '../components/Spinner';
import { SvgSetCard } from '../components/SvgSetCard';
import {
  getAllSets,
  groupByCategory,
  searchIcons,
  searchSetsByName,
} from '../lib/manifest';
import type { IconSearchHit } from '../lib/types';

const PREVIEW_LIMIT = 6;

export function HomePage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [ready, setReady] = useState(false);
  const [iconExpanded, setIconExpanded] = useState(false);
  const [setExpanded, setSetExpanded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Reset expand when query changes
  useEffect(() => {
    setIconExpanded(false);
    setSetExpanded(false);
  }, [query]);

  const isSearch = query.trim().length > 0;

  const iconHits = useMemo(
    () => (isSearch ? searchIcons(query) : []),
    [query, isSearch]
  );
  const setHits = useMemo(
    () => (isSearch ? searchSetsByName(query) : []),
    [query, isSearch]
  );

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

  // Default browse (no search)
  if (!isSearch) {
    return <BrowseAll />;
  }

  const iconPreview = iconExpanded ? iconHits : iconHits.slice(0, PREVIEW_LIMIT);
  const setPreview = setExpanded ? setHits : setHits.slice(0, PREVIEW_LIMIT);
  const iconHasMore = iconHits.length > PREVIEW_LIMIT;
  const setHasMore = setHits.length > PREVIEW_LIMIT;

  const iconGrouped = iconExpanded
    ? groupHitsByCategory(iconHits)
    : null;
  const setGrouped = setExpanded
    ? groupByCategory(setHits)
    : null;

  const noResults = iconHits.length === 0 && setHits.length === 0;

  return (
    <div className="home-page">
      <div className="home-inner">
        {noResults ? (
          <p className="empty-state">No SVG Sets found</p>
        ) : (
          <>
            {/* Icon name matches */}
            {iconHits.length > 0 && (
              <section className="search-section">
                <h2 className="search-title">相關圖示結果</h2>
                {iconExpanded && iconGrouped ? (
                  iconGrouped.map((g) => (
                    <div key={g.name} className="search-cat">
                      <h3 className="search-cat-title">{g.name}</h3>
                      <div className="category-grid">
                        {g.hits.map((hit) => (
                          <SearchIconCard key={hit.set.id} hit={hit} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="category-grid">
                    {iconPreview.map((hit) => (
                      <SearchIconCard key={hit.set.id} hit={hit} />
                    ))}
                  </div>
                )}
                {iconHasMore && !iconExpanded && (
                  <button
                    type="button"
                    className="more-btn"
                    onClick={() => setIconExpanded(true)}
                    aria-label="Show more"
                  >
                    …
                  </button>
                )}
              </section>
            )}

            {/* Set name matches */}
            {setHits.length > 0 && (
              <section className="search-section">
                <h2 className="search-title">相關結果</h2>
                {setExpanded && setGrouped ? (
                  setGrouped.map((g) => (
                    <div key={g.name} className="search-cat">
                      <h3 className="search-cat-title">{g.name}</h3>
                      <div className="category-grid">
                        {g.sets.map((s) => (
                          <SvgSetCard key={s.id} set={s} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="category-grid">
                    {setPreview.map((s) => (
                      <SvgSetCard key={s.id} set={s} />
                    ))}
                  </div>
                )}
                {setHasMore && !setExpanded && (
                  <button
                    type="button"
                    className="more-btn"
                    onClick={() => setSetExpanded(true)}
                    aria-label="Show more"
                  >
                    …
                  </button>
                )}
              </section>
            )}
          </>
        )}
      </div>
      <style>{pageStyles}</style>
    </div>
  );
}

function BrowseAll() {
  const categories = groupByCategory(getAllSets());
  return (
    <div className="home-page">
      <div className="home-inner">
        {categories.map((cat) => (
          <CategorySection key={cat.name} name={cat.name} sets={cat.sets} />
        ))}
      </div>
      <style>{pageStyles}</style>
    </div>
  );
}

function groupHitsByCategory(hits: IconSearchHit[]) {
  const map = new Map<string, IconSearchHit[]>();
  for (const h of hits) {
    const list = map.get(h.set.category) ?? [];
    list.push(h);
    map.set(h.set.category, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, list]) => ({ name, hits: list }));
}

const pageStyles = `
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
  .search-section {
    margin-bottom: 40px;
  }
  .search-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 20px;
    color: var(--text);
  }
  .search-cat {
    margin-bottom: 28px;
  }
  .search-cat-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--text-secondary);
  }
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }
  @media (min-width: 768px) {
    .category-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }
  }
  .more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 20px;
    padding: 12px;
    border-radius: var(--radius);
    border: 1px dashed var(--border-strong);
    background: var(--bg-secondary);
    color: var(--text-secondary);
    font-size: 1.5rem;
    letter-spacing: 0.15em;
    transition: background 0.15s, color 0.15s;
  }
  .more-btn:hover {
    background: var(--bg-hover);
    color: var(--text);
  }
`;
