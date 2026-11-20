# Rumbo | Agencia de viajes

Proyecto de la Semana 5 de Desarrollo Frontend II. Rumbo permite explorar destinos de Latinoamérica y consultar actividades, vuelos y hoteles asociados a cada lugar.

## Tecnologías

- React y JavaScript con Create React App (`react-scripts`)
- React Router con `HashRouter` para rutas compatibles con GitHub Pages
- JSON Server para la API REST de destinos
- GraphQL y `graphql-http` para el servidor independiente de vuelos y hoteles
- CSS responsivo y React Testing Library

## Requisitos

- Node.js 18 o posterior y npm

## Instalación

Desde la carpeta del proyecto:

```bash
npm install
```

## Ejecución local

Abre tres terminales en la carpeta del proyecto.

1. Inicia la API REST:

```bash
npm run server:rest
```

JSON Server queda en `http://localhost:3001`. El catálogo se consulta en `http://localhost:3001/destinos` y los datos están en `db.json`.

2. Inicia el servidor GraphQL:

```bash
npm run server:graphql
```

GraphQL queda en `http://localhost:4000/graphql`. Para una consulta de prueba:

```bash
curl -X POST http://localhost:4000/graphql \
	-H 'Content-Type: application/json' \
	--data '{"query":"{ travelOffers(destinationId: \"1\") { flights { destino aerolinea precio fecha disponibilidad } hotels { nombre destino precioPorNoche categoria disponibilidad } } }"}'
```

El puerto GraphQL se puede cambiar con `GRAPHQL_PORT`. `ALLOWED_ORIGIN` permite restringir CORS en despliegues; por defecto el mock acepta solicitudes desde cualquier origen.

3. Inicia Create React App:

```bash
npm start
```

Abre `http://localhost:3000/Frontend-2`.

Las URL usadas por el frontend se pueden sobrescribir en un archivo `.env` local o en el entorno de compilación:

```env
REACT_APP_REST_API_URL=http://localhost:3001/destinos
REACT_APP_GRAPHQL_API_URL=http://localhost:4000/graphql
```

Consulta `.env.example` como referencia. Las variables `REACT_APP_*` se incorporan al bundle durante la compilación, así que no deben contener secretos.

## Rutas

- `#/` Inicio
- `#/destinos` Catálogo consultado desde REST
- `#/destinos/:id` Detalle, actividades, vuelos y hoteles
- Cualquier otra ruta muestra la página 404

Las vistas indican carga, separan fallos de conexión de respuestas HTTP/servicio y ofrecen reintento. Si un mock no está disponible, se presentan datos locales de respaldo.

## Pruebas y compilación

Ejecuta las pruebas automatizadas:

```bash
npm test -- --watchAll=false
```

La suite incluye pruebas de interfaz y una prueba de integración que inicia `server/graphql-server.js` en un puerto temporal y consulta vuelos y hoteles a través de `travelApi.js`.

Genera el bundle de producción:

```bash
npm run build
```

## GitHub Pages y APIs en producción

El proyecto está configurado para `https://fmorice.github.io/Frontend-2` y usa `HashRouter`, por lo que las rutas internas no requieren reglas de reescritura. En GitHub, habilita Pages para publicar el contenido generado en `build/` (por ejemplo, con una acción de Pages que compile CRA).

GitHub Pages solo sirve archivos estáticos: no puede ejecutar JSON Server ni GraphQL. Publica esos dos procesos en un hosting Node/API independiente y accesible por HTTPS. Configura `REACT_APP_REST_API_URL` con la URL completa del recurso `/destinos` y `REACT_APP_GRAPHQL_API_URL` con la URL completa `/graphql` en el paso de build de Pages; vuelve a compilar después de cambiarlas. Configura CORS en ambos servicios para permitir el origen `https://fmorice.github.io`.

## Estructura

```text
db.json                         Datos REST de destinos
server/graphql-server.js        Servidor GraphQL mock
src/
	components/                   Navegación, tarjetas y estados compartidos
	data/destinations.js          Datos locales de respaldo e imágenes
	pages/                        Inicio, catálogo, detalle y 404
	services/travelApi.js         Clientes REST/GraphQL y fallback
	App.js                        Rutas de la aplicación
	App.test.js                   Pruebas de navegación y APIs
```
