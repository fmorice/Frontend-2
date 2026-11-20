import { Link, NavLink } from 'react-router';

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="wordmark" to="/" aria-label="Rumbo, inicio">
          <span className="wordmark-icon" aria-hidden="true">r.</span>
          <span>rumbo</span>
        </Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/destinos">Destinos</NavLink>
        </nav>
        <Link className="header-cta" to="/destinos">Planear viaje <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  );
}