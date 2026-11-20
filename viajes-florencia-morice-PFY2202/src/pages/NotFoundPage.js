import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section className="not-found content-width">
      <p className="eyebrow">404 · FUERA DE RUTA</p>
      <h1>Esta página no está en el itinerario.</h1>
      <p>La dirección puede haber cambiado o no existir.</p>
      <Link className="button button-dark" to="/">Volver al inicio <span aria-hidden="true">↗</span></Link>
    </section>
  );
}