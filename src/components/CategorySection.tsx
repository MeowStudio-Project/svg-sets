import { SvgSetCard } from './SvgSetCard';
import type { SvgSet } from '../lib/types';

type Props = {
  name: string;
  sets: SvgSet[];
};

export function CategorySection({ name, sets }: Props) {
  if (sets.length === 0) return null;

  return (
    <section className="category-section" aria-labelledby={`cat-${name}`}>
      <h2 id={`cat-${name}`} className="category-title">
        {name}
      </h2>
      <div className="category-grid">
        {sets.map((set) => (
          <SvgSetCard key={set.id} set={set} />
        ))}
      </div>
      <style>{`
        .category-section {
          margin-bottom: 40px;
        }
        .category-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 16px;
          color: var(--text);
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
      `}</style>
    </section>
  );
}
