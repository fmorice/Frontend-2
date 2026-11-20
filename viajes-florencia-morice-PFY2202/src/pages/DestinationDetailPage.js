import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiNotice, LoadingMessage } from '../components/Feedback';
import destinationsFallback from '../data/destinations';
import { getDestinationOffers, getDestinations } from '../services/travelApi';

function formatPrice(price) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

export default function DestinationDetailPage() {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restError, setRestError] = useState(null);
  const [offersError, setOffersError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loadedId, setLoadedId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadedId(null);
    setDestination(null);
    setFlights([]);
    setHotels([]);
    setRestError(null);
    setOffersError(null);
    Promise.all([getDestinations(), getDestinationOffers(id)]).then(([destinationResult, offerResult]) => {
      if (!active) return;
      setDestination(destinationResult.data.find((item) => String(item.id) === id) || null);
      setRestError(destinationResult.error);
      setFlights(offerResult.data.flights);
      setHotels(offerResult.data.hotels);
      setOffersError(offerResult.error);
      setLoadedId(id);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id, retryCount]);

  function retry() {
    setLoading(true);
    setLoadedId(null);
    setDestination(null);
    setFlights([]);
    setHotels([]);
    setRestError(null);
    setOffersError(null);
    setRetryCount((count) => count + 1);
  }

  if (loading || loadedId !== id) return <LoadingMessage>Cargando destino y opciones de viaje...</LoadingMessage>;

  if (!destination) {
    return (
      <section className="not-found content-width">
        <p className="eyebrow">RUTA NO ENCONTRADA</p>
        <h1>Este destino no aparece en el mapa.</h1>
        <Link className="underlined-link" to="/destinos">Volver a destinos <span aria-hidden="true">→</span></Link>
      </section>
    );
  }

  const visual = destinationsFallback.find((item) => String(item.id) === id);

  return (
    <article className="detail-page">
      <div className="detail-cover" style={{ backgroundImage: `url("${destination.image || visual?.image || destinationsFallback[0].image}")` }}>
        <div className="detail-cover-overlay" />
        <div className="detail-cover-content content-width">
          <Link className="back-link" to="/destinos"><span aria-hidden="true">←</span> Todos los destinos</Link>
          <p className="eyebrow">{destination.pais}</p>
          <h1>{destination.nombre}</h1>
          <p>{destination.descripcion}</p>
        </div>
      </div>

      <section className="detail-content content-width">
        <ApiNotice error={restError} service="la API REST de destinos" onRetry={retry} />
        <ApiNotice error={offersError} service="la API GraphQL de vuelos y hoteles" onRetry={retry} />
        <div className="activities-section">
          <p className="eyebrow">PARA HACER A TU MANERA</p>
          <h2>El viaje empieza aquí.</h2>
          <div className="activity-pills">
            {(destination.actividadesPopulares || []).map((activity, index) => (
              <span className="activity-pill" key={activity}><span>0{index + 1}</span>{activity}</span>
            ))}
          </div>
        </div>

        <div className="offers-grid">
          <section className="offer-section" aria-labelledby="flights-heading">
            <div className="offer-heading"><p className="eyebrow">LLEGA HASTA AQUÍ</p><h2 id="flights-heading">Vuelos</h2></div>
            {flights.map((flight) => (
              <article className="offer-row" key={flight.id}>
                <div><h3>{flight.aerolinea}</h3><p>{new Date(`${flight.fecha}T12:00:00`).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                <div className="offer-price"><strong>{formatPrice(flight.precio)}</strong><span className={flight.disponibilidad ? 'available' : 'unavailable'}>{flight.disponibilidad ? 'Disponible' : 'Sin disponibilidad'}</span></div>
              </article>
            ))}
          </section>
          <section className="offer-section" aria-labelledby="hotels-heading">
            <div className="offer-heading"><p className="eyebrow">QUÉDATE UN POCO MÁS</p><h2 id="hotels-heading">Hoteles</h2></div>
            {hotels.map((hotel) => (
              <article className="offer-row" key={hotel.id}>
                <div><h3>{hotel.nombre}</h3><p>{'★'.repeat(hotel.categoria)} · {hotel.categoria} estrellas</p></div>
                <div className="offer-price"><strong>{formatPrice(hotel.precioPorNoche)}</strong><span>por noche · {hotel.disponibilidad ? 'Disponible' : 'Sin disponibilidad'}</span></div>
              </article>
            ))}
          </section>
        </div>
        <p className="price-note">Precios de referencia en USD. Consulta disponibilidad antes de reservar.</p>
      </section>
    </article>
  );
}