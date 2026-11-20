import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import DestinationCard from '../components/DestinationCard';
import { ApiNotice, LoadingMessage } from '../components/Feedback';
import { getDestinations } from '../services/travelApi';

export default function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDestinations().then((result) => {
      if (active) {
        setDestinations(result.data);
        setError(result.error);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [retryCount]);

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-image" role="img" aria-label="Cordillera andina al amanecer" />
        <div className="hero-content">
          <p className="eyebrow hero-eyebrow"><span /> VIAJAR A TU RITMO</p>
          <h1 id="hero-title">Hay lugares<br />que te encuentran.</h1>
          <p className="hero-copy">Escapadas con historias propias. Elige el paisaje y nosotros abrimos el camino.</p>
          <Link className="button button-light" to="/destinos">Explorar destinos <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="hero-caption"><span>01 / 06</span><span>Valle Sagrado · Perú</span></div>
        <div className="hero-side-note">42° 38′ S &nbsp; 73° 50′ O</div>
      </section>

      <section className="home-intro content-width">
        <p className="eyebrow">EL MUNDO, MÁS CERCA</p>
        <div className="intro-grid">
          <h2>Una buena ruta<br />cambia el viaje.</h2>
          <div>
            <p>Rumbo reúne rincones inolvidables de Latinoamérica, con actividades, vuelos y estadías para que cada día tenga algo que contar.</p>
            <Link className="underlined-link" to="/destinos">Conoce todos los destinos <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="content-width">
          <div className="section-heading">
            <div><p className="eyebrow">ESCOGIDOS PARA TI</p><h2>Rutas que inspiran</h2></div>
            <Link className="underlined-link" to="/destinos">Ver los 6 destinos <span aria-hidden="true">→</span></Link>
          </div>
          <ApiNotice
            error={error}
            service="la API REST de destinos"
            onRetry={() => setRetryCount((count) => count + 1)}
          />
          {loading ? <LoadingMessage>Cargando destinos destacados...</LoadingMessage> : (
            <div className="destination-grid featured-grid">
              {destinations.slice(0, 3).map((destination, index) => (
                <DestinationCard key={destination.id} destination={destination} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}