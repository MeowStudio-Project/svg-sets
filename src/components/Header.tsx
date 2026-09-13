import { Link, useSearchParams } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { SearchBar } from './SearchBar';
import './Header.css';

export function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const handleSearch = (value: string) => {
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo" aria-label="SVG Sets home">
          SVG Sets
        </Link>
        <div className="header-search">
          <SearchBar value={query} onChange={handleSearch} />
        </div>
        <div className="header-actions">
          <ThemeToggle />
        </div>
      </div>
      <div className="header-search-mobile">
        <SearchBar value={query} onChange={handleSearch} />
      </div>
    </header>
  );
}
