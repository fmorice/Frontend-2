import { Link } from 'react-router';
import fallbackDestinations from '../data/destinations';

export default function DestinationCard({ destination, index = 0 }) {
  const visual = fallbackDestinations.find((item) => String(item.id) === String(destination.id));

  return (
    <article className="destination-card" style={{ animationDelay: `${index * 70}ms` }}>
      <Link className="destination-image-link" to={`/destinos/${destination.id}`} aria-label={`Descubrir ${destination.nombre}`}>
        <img
          className="destination-image"
          src={destination.image || visual?.image || fallbackDestinations[0].image}
          alt={`${destination.nombre}, ${destination.pais}`}
          loading="lazy"
        />
        <span className="image-arrow" aria-hidden="true">↗</span>
      </Link>
      <div className="destination-card-content">
        <p className="destination-country">{destination.pais}</p>
        <h2><Link to={`/destinos/${destination.id}`}>{destination.nombre}</Link></h2>
        <p className="destination-description">{destination.descripcion}</p>
        <div className="activity-list" aria-label="Actividades populares">
          {(destination.actividadesPopulares || []).slice(0, 2).map((activity) => (
            <span className="activity-label" key={activity}>{activity}</span>
          ))}
        </div>
      </div>
    </article>
  );
}