import { useEffect, useState } from 'react';
import DestinationCard from '../components/DestinationCard';
import { ApiNotice, LoadingMessage } from '../components/Feedback';
import { getDestinations } from '../services/travelApi';

export default function DestinationsPage() {
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
    <section className="catalog-page content-width" aria-labelledby="catalog-title">
      <div className="page-heading">
        <p className="eyebrow">TU PRÓXIMA HISTORIA</p>
        <h1 id="catalog-title">Destinos para<br className="mobile-break" /> salir de la rutina.</h1>
        <p className="page-lede">Seis maneras distintas de mirar Latinoamérica. ¿Cuál te llama?</p>
      </div>
      <ApiNotice error={error} service="la API REST de destinos" onRetry={() => setRetryCount((count) => count + 1)} />
      {loading ? <LoadingMessage>Cargando destinos...</LoadingMessage> : (
        <div className="destination-grid catalog-grid">
          {destinations.map((destination, index) => (
            <DestinationCard key={destination.id} destination={destination} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}