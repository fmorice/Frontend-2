/** @jest-environment node */

const { spawn } = require('node:child_process');
const { request } = require('node:http');
const { createServer } = require('node:net');
const path = require('node:path');

jest.setTimeout(15000);

let graphqlProcess;
let graphqlEndpoint;
let getDestinationOffers;
let serverOutput = '';
const previousGraphqlUrl = process.env.REACT_APP_GRAPHQL_API_URL;

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

function postGraphql(body) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify(body);
    const graphqlRequest = request(graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => resolve({ statusCode: response.statusCode, body: responseBody }));
    });
    graphqlRequest.setTimeout(1500, () => graphqlRequest.destroy(new Error('Tiempo de conexión GraphQL agotado.')));
    graphqlRequest.on('error', reject);
    graphqlRequest.end(requestBody);
  });
}

function fetchOverHttp(url, options) {
  return new Promise((resolve, reject) => {
    const graphqlRequest = request(url, options, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => resolve({
        ok: response.statusCode >= 200 && response.statusCode < 300,
        status: response.statusCode,
        json: async () => JSON.parse(responseBody),
      }));
    });
    graphqlRequest.on('error', reject);
    graphqlRequest.end(options.body);
  });
}

async function waitForGraphqlServer() {
  const deadline = Date.now() + 8000;
  const query = '{ travelOffers(destinoId: "2") { flights { destinoId } hotels { destinoId } } }';
  let lastError;

  while (Date.now() < deadline) {
    if (graphqlProcess.exitCode !== null) {
      throw new Error(`El proceso GraphQL terminó antes de aceptar solicitudes. ${serverOutput}`);
    }

    try {
      const response = await postGraphql({ query });
      if (response.statusCode === 200) return;
      lastError = new Error(`HTTP ${response.statusCode}: ${response.body}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error(`El servidor GraphQL no estuvo disponible: ${lastError?.message || serverOutput}`);
}

beforeAll(async () => {
  const port = await findAvailablePort();
  graphqlEndpoint = `http://127.0.0.1:${port}/graphql`;
  graphqlProcess = spawn(
    process.execPath,
    [path.resolve(__dirname, '../../server/graphql-server.js')],
    {
      env: { ...process.env, GRAPHQL_PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  graphqlProcess.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
  graphqlProcess.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

  try {
    await waitForGraphqlServer();
  } catch (error) {
    graphqlProcess.kill();
    await new Promise((resolve) => graphqlProcess.once('exit', resolve));
    throw error;
  }
  process.env.REACT_APP_GRAPHQL_API_URL = graphqlEndpoint;
  jest.resetModules();
  ({ getDestinationOffers } = require('./travelApi'));
});

afterAll(async () => {
  if (previousGraphqlUrl === undefined) {
    delete process.env.REACT_APP_GRAPHQL_API_URL;
  } else {
    process.env.REACT_APP_GRAPHQL_API_URL = previousGraphqlUrl;
  }

  if (graphqlProcess && graphqlProcess.exitCode === null) {
    const exited = new Promise((resolve) => graphqlProcess.once('exit', resolve));
    graphqlProcess.kill();
    await exited;
  }
});

test('returns isolated flights and hotels for each of the six destinations', async () => {
  const originalFetch = global.fetch;
  const fetchSpy = jest.fn(fetchOverHttp);
  global.fetch = fetchSpy;
  const destinationNames = [
    'Valle Sagrado',
    'Cartagena de Indias',
    'San Pedro de Atacama',
    'Bariloche',
    'Monteverde',
    'Oaxaca',
  ];
  const flightIds = new Set();
  const hotelIds = new Set();

  try {
    for (const [index, destinationName] of destinationNames.entries()) {
      const destinoId = String(index + 1);
      const result = await getDestinationOffers(destinoId);

      expect(fetchSpy).toHaveBeenLastCalledWith(graphqlEndpoint, expect.objectContaining({ method: 'POST' }));
      expect(JSON.parse(fetchSpy.mock.calls.at(-1)[1].body).variables).toEqual({ destinoId });
      expect(result.error).toBeNull();
      expect(result.source).toBe('api');
      expect(result.data.flights).toHaveLength(2);
      expect(result.data.hotels).toHaveLength(2);

      result.data.flights.forEach((flight) => {
        expect(flight.destinoId).toBe(destinoId);
        expect(flight.destino).toBe(destinationName);
        expect(flight.aerolinea).toEqual(expect.any(String));
        expect(flight.precio).toEqual(expect.any(Number));
        expect(flight.fecha).toEqual(expect.any(String));
        expect(flight.disponibilidad).toEqual(expect.any(Boolean));
        expect(flightIds.has(flight.id)).toBe(false);
        flightIds.add(flight.id);
      });

      result.data.hotels.forEach((hotel) => {
        expect(hotel.destinoId).toBe(destinoId);
        expect(hotel.destino).toBe(destinationName);
        expect(hotel.nombre).toEqual(expect.any(String));
        expect(hotel.precioPorNoche).toEqual(expect.any(Number));
        expect(hotel.categoria).toEqual(expect.any(Number));
        expect(hotel.disponibilidad).toEqual(expect.any(Boolean));
        expect(hotelIds.has(hotel.id)).toBe(false);
        hotelIds.add(hotel.id);
      });
    }
  } finally {
    global.fetch = originalFetch;
  }

  expect(flightIds.size).toBe(12);
  expect(hotelIds.size).toBe(12);
});
