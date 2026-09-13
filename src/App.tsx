import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { SvgSetPage } from './pages/SvgSetPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: 'var(--header-h)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/svg-set/:id" element={<SvgSetPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
