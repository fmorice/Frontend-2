import fallbackDestinations from '../data/destinations';

const restUrl = process.env.REACT_APP_REST_API_URL || 'http://localhost:3001/destinos';
const graphqlUrl = process.env.REACT_APP_GRAPHQL_API_URL || 'http://localhost:4000/graphql';

export class ApiError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
  }
}

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new ApiError('connection', 'No se pudo conectar con el servidor.');
  }

  if (!response.ok) {
    throw new ApiError('http', `El servidor respondió con el estado HTTP ${response.status}.`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('response', 'El servidor envió una respuesta que no se pudo leer.');
  }
}

export async function getDestinations() {
  try {
    return { data: await request(restUrl), source: 'api', error: null };
  } catch (error) {
    return { data: fallbackDestinations, source: 'fallback', error };
  }
}

const offerQuery = `
  query DestinationOffers($destinoId: ID!) {
    travelOffers(destinoId: $destinoId) {
      flights { id destinoId destino aerolinea precio fecha disponibilidad }
      hotels { id destinoId nombre destino precioPorNoche categoria disponibilidad }
    }
  }
`;

function fallbackOffers(destinationId) {
  const destinationIndex = Number(destinationId) - 1;
  const destination = fallbackDestinations.find((item) => String(item.id) === String(destinationId));
  const name = destination ? destination.nombre : 'Destino';
  const flightNames = ['Cóndor Andino', 'Caribe Express', 'Desierto Connect', 'Patagonia Sur', 'Pura Vida Air', 'Oaxaca Directo'];
  const hotelNames = ['Refugio de los Andes', 'Casa del Mar Caribe', 'Lodge del Salar', 'Hostería del Lago', 'Nido del Bosque', 'Casa de los Naranjos'];
  return {
    flights: [
      { id: `fallback-flight-${destinationId}-1`, destinoId: String(destinationId), destino: name, aerolinea: flightNames[destinationIndex] || 'Rutas del Sur', precio: 220 + destinationIndex * 27, fecha: `2026-12-${String(10 + destinationIndex).padStart(2, '0')}`, disponibilidad: destinationIndex !== 3 },
      { id: `fallback-flight-${destinationId}-2`, destinoId: String(destinationId), destino: name, aerolinea: `Conexión ${name}`, precio: 265 + destinationIndex * 31, fecha: `2026-12-${String(17 + destinationIndex).padStart(2, '0')}`, disponibilidad: true },
    ],
    hotels: [
      { id: `fallback-hotel-${destinationId}-1`, destinoId: String(destinationId), nombre: hotelNames[destinationIndex] || 'Hotel del Viajero', destino: name, precioPorNoche: 65 + destinationIndex * 12, categoria: 3 + (destinationIndex % 3), disponibilidad: destinationIndex !== 4 },
      { id: `fallback-hotel-${destinationId}-2`, destinoId: String(destinationId), nombre: `Estadía ${name}`, destino: name, precioPorNoche: 48 + destinationIndex * 9, categoria: 3, disponibilidad: true },
    ],
  };
}

export async function getDestinationOffers(destinationId) {
  try {
    const result = await request(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: offerQuery, variables: { destinoId: String(destinationId) } }),
    });
    if (result.errors || !result.data?.travelOffers) {
      throw new ApiError('response', 'GraphQL no pudo entregar vuelos y hoteles.');
    }
    return { data: result.data.travelOffers, source: 'api', error: null };
  } catch (error) {
    return { data: fallbackOffers(destinationId), source: 'fallback', error };
  }
}