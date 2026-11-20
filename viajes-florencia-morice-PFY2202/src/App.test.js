import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

const destinations = [
  { id: 1, nombre: 'Valle Sagrado', pais: 'Perú', descripcion: 'Montañas andinas.', actividadesPopulares: ['Trekking'] },
];
const offers = {
  flights: [{ id: 'f1', destino: 'Valle Sagrado', aerolinea: 'Andes Air', precio: 310, fecha: '2026-12-12', disponibilidad: true }],
  hotels: [{ id: 'h1', nombre: 'Casa Andina', destino: 'Valle Sagrado', precioPorNoche: 95, categoria: 4, disponibilidad: true }],
};

function mockApi({ destinationResponse, graphqlResponse } = {}) {
  global.fetch = jest.fn((url) => Promise.resolve({
    ok: true,
    json: async () => (url.includes('/graphql')
      ? graphqlResponse || { data: { travelOffers: offers } }
      : destinationResponse || destinations),
  }));
}

afterEach(() => {
  global.fetch = undefined;
  window.history.replaceState({}, '', '/');
});

test('loads featured destinations on the travel home and links to the catalog', async () => {
  mockApi();
  render(<App />);

  expect(screen.getByRole('heading', { name: /Hay lugares que te encuentran/ })).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Valle Sagrado' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/destinos', undefined);
  fireEvent.click(screen.getByRole('link', { name: /Explorar destinos/ }));
  expect(await screen.findByRole('heading', { name: /Destinos para salir de la rutina/ })).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Valle Sagrado' })).toBeInTheDocument();
});

test('loads destinations from the REST API', async () => {
  mockApi();
  window.location.hash = '#/destinos';
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Valle Sagrado' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/destinos', undefined);
});

test('shows home fallback destinations and retries the REST request', async () => {
  global.fetch = jest.fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ ok: true, json: async () => destinations });
  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent('datos de respaldo');
  expect(await screen.findByRole('heading', { name: 'Valle Sagrado' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: 'Valle Sagrado' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('shows a distinct connection error, fallback data, and retry action', async () => {
  global.fetch = jest.fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ ok: true, json: async () => destinations });
  window.location.hash = '#/destinos';
  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent('No hay conexión con la API REST');
  expect(screen.getByRole('alert')).toHaveTextContent('datos de respaldo');
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByRole('heading', { name: 'Valle Sagrado' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('distinguishes a non-successful HTTP response', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
  window.location.hash = '#/destinos';
  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Respuesta HTTP no exitosa');
  expect(screen.getByRole('alert')).toHaveTextContent('HTTP 503');
});

test('loads destination details, flights, and hotels from the independent GraphQL API', async () => {
  mockApi();
  window.location.hash = '#/destinos/1';
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Valle Sagrado' })).toBeInTheDocument();
  expect(await screen.findByRole('heading', { name: 'Vuelos' })).toBeInTheDocument();
  expect(screen.getByText('Andes Air')).toBeInTheDocument();
  expect(screen.getByText('Casa Andina')).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/graphql', expect.objectContaining({ method: 'POST' }));
});

test('clears previous offers and ignores late responses when changing destination', async () => {
  const secondDestination = {
    id: 2,
    nombre: 'Cartagena de Indias',
    pais: 'Colombia',
    descripcion: 'Una ciudad caribeña.',
    actividadesPopulares: ['Islas del Rosario'],
  };
  let resolveSecondOffers;
  global.fetch = jest.fn((url, options) => {
    if (!url.includes('/graphql')) {
      return Promise.resolve({ ok: true, json: async () => [...destinations, secondDestination] });
    }

    const { destinoId } = JSON.parse(options.body).variables;
    if (destinoId === '1') {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            travelOffers: {
              flights: [{ id: 'flight-1', destinoId, destino: 'Valle Sagrado', aerolinea: 'Vuelo Valle', precio: 280, fecha: '2026-12-12', disponibilidad: true }],
              hotels: [{ id: 'hotel-1', destinoId, destino: 'Valle Sagrado', nombre: 'Hotel Valle', precioPorNoche: 95, categoria: 4, disponibilidad: true }],
            },
          },
        }),
      });
    }

    return new Promise((resolve) => { resolveSecondOffers = resolve; });
  });
  window.location.hash = '#/destinos/1';
  render(<App />);

  expect(await screen.findByText('Vuelo Valle')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('link', { name: /Todos los destinos/ }));
  fireEvent.click(await screen.findByRole('link', { name: 'Descubrir Cartagena de Indias' }));

  expect(await screen.findByRole('status')).toHaveTextContent('Cargando destino y opciones de viaje');
  expect(screen.queryByText('Vuelo Valle')).not.toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/graphql', expect.objectContaining({
    method: 'POST',
    body: expect.stringContaining('"destinoId":"2"'),
  }));

  await act(async () => {
    resolveSecondOffers({
      ok: true,
      json: async () => ({
        data: {
          travelOffers: {
            flights: [{ id: 'flight-2', destinoId: '2', destino: 'Cartagena de Indias', aerolinea: 'Vuelo Caribe', precio: 205, fecha: '2026-12-14', disponibilidad: true }],
            hotels: [{ id: 'hotel-2', destinoId: '2', destino: 'Cartagena de Indias', nombre: 'Hotel Caribe', precioPorNoche: 130, categoria: 4, disponibilidad: true }],
          },
        },
      }),
    });
  });

  expect(await screen.findByText('Vuelo Caribe')).toBeInTheDocument();
  expect(screen.getByText('Hotel Caribe')).toBeInTheDocument();
  expect(screen.queryByText('Vuelo Valle')).not.toBeInTheDocument();
});

test('does not replace the active destination with an older late GraphQL response', async () => {
  const secondDestination = {
    id: 2,
    nombre: 'Cartagena de Indias',
    pais: 'Colombia',
    descripcion: 'Una ciudad caribeña.',
    actividadesPopulares: ['Islas del Rosario'],
  };
  const pendingOffers = {};
  global.fetch = jest.fn((url, options) => {
    if (!url.includes('/graphql')) {
      return Promise.resolve({ ok: true, json: async () => [...destinations, secondDestination] });
    }

    const { destinoId } = JSON.parse(options.body).variables;
    return new Promise((resolve) => { pendingOffers[destinoId] = resolve; });
  });
  window.location.hash = '#/destinos/1';
  render(<App />);

  await waitFor(() => expect(pendingOffers['1']).toBeDefined());
  window.location.hash = '#/destinos/2';
  await waitFor(() => expect(pendingOffers['2']).toBeDefined());

  await act(async () => {
    pendingOffers['2']({
      ok: true,
      json: async () => ({
        data: {
          travelOffers: {
            flights: [{ id: 'flight-2', destinoId: '2', destino: 'Cartagena de Indias', aerolinea: 'Vuelo Caribe', precio: 205, fecha: '2026-12-14', disponibilidad: true }],
            hotels: [{ id: 'hotel-2', destinoId: '2', destino: 'Cartagena de Indias', nombre: 'Hotel Caribe', precioPorNoche: 130, categoria: 4, disponibilidad: true }],
          },
        },
      }),
    });
  });
  expect(await screen.findByText('Vuelo Caribe')).toBeInTheDocument();

  await act(async () => {
    pendingOffers['1']({
      ok: true,
      json: async () => ({
        data: {
          travelOffers: {
            flights: [{ id: 'flight-1', destinoId: '1', destino: 'Valle Sagrado', aerolinea: 'Vuelo Valle', precio: 280, fecha: '2026-12-12', disponibilidad: true }],
            hotels: [{ id: 'hotel-1', destinoId: '1', destino: 'Valle Sagrado', nombre: 'Hotel Valle', precioPorNoche: 95, categoria: 4, disponibilidad: true }],
          },
        },
      }),
    });
  });

  expect(screen.getByText('Vuelo Caribe')).toBeInTheDocument();
  expect(screen.getByText('Hotel Caribe')).toBeInTheDocument();
  expect(screen.queryByText('Vuelo Valle')).not.toBeInTheDocument();
  expect(screen.queryByText('Hotel Valle')).not.toBeInTheDocument();
});

test('shows fallback flights and hotels when GraphQL is unavailable', async () => {
  global.fetch = jest.fn((url) => (url.includes('/graphql')
    ? Promise.reject(new Error('offline'))
    : Promise.resolve({ ok: true, json: async () => destinations })));
  window.location.hash = '#/destinos/1';
  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent('la API GraphQL de vuelos y hoteles');
  expect(screen.getByText('Cóndor Andino')).toBeInTheDocument();
  expect(screen.getByText('Refugio de los Andes')).toBeInTheDocument();
});

test('shows the 404 page for an unknown route', () => {
  window.location.hash = '#/no-existe';
  render(<App />);

  expect(screen.getByRole('heading', { name: /Esta página no está en el itinerario/ })).toBeInTheDocument();
  expect(global.fetch).toBeUndefined();
});
