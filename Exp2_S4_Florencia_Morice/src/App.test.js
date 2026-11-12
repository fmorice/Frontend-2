import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  window.history.pushState({}, '', '/');
});

test('loads and displays categories with one request', async () => {
  let resolveResponse;
  global.fetch = jest.fn(
    () => new Promise((resolve) => {
      resolveResponse = resolve;
    })
  );

  render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  expect(screen.getByRole('status')).toHaveTextContent('Cargando categorías...');
  expect(global.fetch).toHaveBeenCalledTimes(1);

  await act(async () => {
    resolveResponse({
      ok: true,
      json: async () => [
        { id: 1, nombre: 'Ficción' },
        { id: 2, nombre: 'Ciencia ficción' },
      ],
    });
  });

  expect(await screen.findByText('Ficción')).toBeInTheDocument();
  expect(screen.getByText('Ciencia ficción')).toBeInTheDocument();
});

test('shows a clear message when the request fails', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('API unavailable'));

  render(<App />);

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'No se pudieron cargar las categorías'
  );
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
});

test('retries the request and displays categories after success', async () => {
  let resolveRetry;
  global.fetch = jest.fn()
    .mockRejectedValueOnce(new Error('API unavailable'))
    .mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveRetry = resolve;
      })
    );

  render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  expect(await screen.findByRole('alert')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

  expect(screen.getByRole('status')).toHaveTextContent('Cargando categorías...');
  expect(global.fetch).toHaveBeenCalledTimes(2);

  await act(async () => {
    resolveRetry({
      ok: true,
      json: async () => [{ id: 1, nombre: 'Ficción' }],
    });
  });

  expect(await screen.findByText('Ficción')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
});

test('shows retry after a non-successful HTTP response', async () => {
  let resolveRetry;
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: false })
    .mockImplementationOnce(
      () => new Promise((resolve) => {
        resolveRetry = resolve;
      })
    );

  render(<App />);

  expect(await screen.findByRole('alert')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(screen.getByRole('status')).toHaveTextContent('Cargando categorías...');

  await act(async () => {
    resolveRetry({ ok: false });
  });

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'No se pudieron cargar las categorías'
  );
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test('navigates to a category and returns to the catalog without another request', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { id: 1, nombre: 'Ficción' },
      { id: 2, nombre: 'Ciencia ficción' },
    ],
  });

  render(<App />);

  fireEvent.click(await screen.findByRole('link', { name: /Ficción/ }));
  expect(
    await screen.findByRole('heading', { name: 'Ficción', level: 1 })
  ).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole('link', { name: 'Volver al catálogo' }));
  expect(
    await screen.findByRole('heading', { name: 'Explora la librería' })
  ).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('shows a message and return link for an unknown category ID', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ id: 1, nombre: 'Ficción' }],
  });
  window.history.pushState({}, '', '/categorias/999');

  render(<App />);

  expect(
    await screen.findByRole('heading', { name: 'Categoría no encontrada' })
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeInTheDocument();
});

test('shows a not found page for an unknown route', () => {
  global.fetch = jest.fn();
  window.history.pushState({}, '', '/ruta-inexistente');

  render(<App />);

  expect(
    screen.getByRole('heading', { name: 'Página no encontrada' })
  ).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});
