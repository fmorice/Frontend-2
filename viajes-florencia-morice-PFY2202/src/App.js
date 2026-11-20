import { HashRouter, Route, Routes } from 'react-router';
import './App.css';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import HomePage from './pages/HomePage';
import DestinationsPage from './pages/DestinationsPage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function AppLayout() {
  return (
    <>
      <SiteHeader />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/destinos" element={<DestinationsPage />} />
          <Route path="/destinos/:id" element={<DestinationDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}
