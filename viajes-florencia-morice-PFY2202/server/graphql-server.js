const { createServer } = require('node:http');
const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/node');

const destinations = [
  { destinoId: '1', nombre: 'Valle Sagrado' },
  { destinoId: '2', nombre: 'Cartagena de Indias' },
  { destinoId: '3', nombre: 'San Pedro de Atacama' },
  { destinoId: '4', nombre: 'Bariloche' },
  { destinoId: '5', nombre: 'Monteverde' },
  { destinoId: '6', nombre: 'Oaxaca' },
];

const flightData = [
  ['1', 'Cóndor Andino', 289, '2026-12-12', true],
  ['1', 'AeroCusco', 324, '2026-12-19', true],
  ['2', 'Caribe Express', 198, '2026-12-14', true],
  ['2', 'Isla Air', 236, '2026-12-21', false],
  ['3', 'Desierto Connect', 315, '2026-12-10', true],
  ['3', 'Atacama Airlines', 371, '2026-12-17', true],
  ['4', 'Patagonia Sur', 267, '2026-12-11', false],
  ['4', 'Lago Air', 302, '2026-12-20', true],
  ['5', 'Pura Vida Air', 344, '2026-12-13', true],
  ['5', 'Nube Verde', 389, '2026-12-22', true],
  ['6', 'Oaxaca Directo', 221, '2026-12-15', true],
  ['6', 'Monte Albán Air', 258, '2026-12-23', false],
];

const flights = flightData.map(([destinoId, aerolinea, precio, fecha, disponibilidad], index) => ({
  id: `flight-${index + 1}`,
  destinoId,
  destino: destinations.find((destination) => destination.destinoId === destinoId).nombre,
  aerolinea,
  precio,
  fecha,
  disponibilidad,
}));

const hotelData = [
  ['1', 'Refugio de los Andes', 112, 4, true],
  ['1', 'Posada Pisac', 68, 3, true],
  ['2', 'Casa del Mar Caribe', 148, 5, true],
  ['2', 'Patio Amurallado', 89, 4, false],
  ['3', 'Lodge del Salar', 126, 4, true],
  ['3', 'Cabañas del Desierto', 74, 3, true],
  ['4', 'Hostería del Lago', 103, 4, false],
  ['4', 'Chalet Patagonia', 157, 5, true],
  ['5', 'Nido del Bosque', 119, 4, true],
  ['5', 'EcoLodge Monteverde', 82, 3, false],
  ['6', 'Casa de los Naranjos', 96, 4, true],
  ['6', 'Posada Oaxaca Centro', 63, 3, true],
];

const hotels = hotelData.map(([destinoId, nombre, precioPorNoche, categoria, disponibilidad], index) => ({
  id: `hotel-${index + 1}`,
  destinoId,
  destino: destinations.find((destination) => destination.destinoId === destinoId).nombre,
  nombre,
  precioPorNoche,
  categoria,
  disponibilidad,
}));

const schema = buildSchema(`
  type Flight {
    id: ID!
    destinoId: ID!
    destino: String!
    aerolinea: String!
    precio: Float!
    fecha: String!
    disponibilidad: Boolean!
  }
  type Hotel {
    id: ID!
    destinoId: ID!
    nombre: String!
    destino: String!
    precioPorNoche: Float!
    categoria: Int!
    disponibilidad: Boolean!
  }
  type TravelOffers {
    flights: [Flight!]!
    hotels: [Hotel!]!
  }
  type Query {
    travelOffers(destinoId: ID!): TravelOffers!
  }
`);

const handler = createHandler({
  schema,
  rootValue: {
    travelOffers: ({ destinoId }) => {
      const selectedDestinationId = String(destinoId);
      return {
        flights: flights.filter((flight) => flight.destinoId === selectedDestinationId),
        hotels: hotels.filter((hotel) => hotel.destinoId === selectedDestinationId),
      };
    },
  },
});

const port = process.env.PORT || process.env.GRAPHQL_PORT || 4000;
const server = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }
  if (request.url === '/graphql' || request.url.startsWith('/graphql?')) {
    handler(request, response);
    return;
  }
  response.writeHead(404).end('Usa el endpoint /graphql');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`GraphQL disponible en http://localhost:${port}/graphql`);
});