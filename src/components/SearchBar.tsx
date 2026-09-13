import { useId } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  const id = useId();

  return (
    <div className="search-bar">
      <label htmlFor={id} className="sr-only">
        Search SVG Sets
      </label>
      <svg
        className="search-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        id={id}
        type="search"
        placeholder="…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          className="search-clear"
          aria-label="Clear search"
          onClick={() => onChange('')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      <style>{`
        .search-bar {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-bar input {
          width: 100%;
          height: 40px;
          padding: 0 36px 0 38px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg-secondary);
          font-size: 0.9375rem;
          transition: border-color 0.15s, background 0.15s;
        }
        .search-bar input::placeholder {
          color: var(--text-muted);
        }
        .search-bar input:focus {
          outline: none;
          border-color: var(--border-strong);
          background: var(--bg);
        }
        .search-clear {
          position: absolute;
          right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          color: var(--text-muted);
        }
        .search-clear:hover {
          color: var(--text);
          background: var(--bg-hover);
        }
      `}</style>
    </div>
  );
}
