import { Link } from 'react-router';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <Link className="wordmark footer-wordmark" to="/">
        <span className="wordmark-icon" aria-hidden="true">r.</span>
        <span>rumbo</span>
      </Link>
      <p>Viajes con tiempo para descubrir.</p>
      <span className="footer-note">América Latina, a tu manera.</span>
    </footer>
  );
}