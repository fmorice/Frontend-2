# Rumbo | Agencia de viajes

Proyecto correspondiente a la Semana 5 de la asignatura **Desarrollo Frontend II**.

Rumbo es una aplicación web de una agencia de viajes que permite explorar destinos turísticos de Latinoamérica, conocer sus países y actividades, y consultar ofertas de vuelos y hoteles asociadas a cada destino.

## Tecnologías utilizadas

- **React:** desarrollo de la interfaz de usuario.
- **JavaScript:** lógica y funcionalidades de la aplicación.
- **Create React App:** configuración y ejecución del proyecto.
- **React Router:** navegación entre las distintas páginas mediante `HashRouter`.
- **JSON Server:** simulación de una API REST para consultar los destinos.
- **GraphQL:** consultas de vuelos y hoteles asociados a cada destino.
- **CSS:** estilos y diseño responsivo.
- **React Testing Library:** pruebas automatizadas de los componentes y funcionalidades.

## Requisitos previos

Para ejecutar el proyecto localmente se necesita:

- Node.js 18 o posterior.
- npm.
- Git (opcional, para clonar el repositorio).

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/fmorice/Frontend-2.git
```

2. Ingresar a la carpeta del proyecto:

```bash
cd Frontend-2/viajes-florencia-morice-PFY2202
```

3. Instalar las dependencias:

```bash
npm install
```

## Ejecución local

Para ejecutar la aplicación correctamente se deben iniciar tres procesos en terminales independientes, todos desde la carpeta `viajes-florencia-morice-PFY2202`.

### 1. Iniciar la API REST

```bash
npm run server:rest
```

El servidor JSON Server se ejecuta en:

`http://localhost:3001`

Los destinos se consultan mediante:

`http://localhost:3001/destinos`

Los datos de los destinos se encuentran almacenados en el archivo `db.json`.

### 2. Iniciar el servidor GraphQL

```bash
npm run server:graphql
```

El servidor GraphQL se ejecuta en:

`http://localhost:4000/graphql`

Para realizar una consulta de prueba desde la terminal:

```bash
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  --data '{"query":"{ travelOffers(destinationId: \"1\") { flights { destino aerolinea precio fecha disponibilidad } hotels { nombre destino precioPorNoche categoria disponibilidad } } }"}'
```

El servidor permite consultar vuelos y hoteles asociados a un destino mediante su identificador.

El puerto se puede modificar utilizando la variable `GRAPHQL_PORT`. La variable `ALLOWED_ORIGIN` permite configurar el origen autorizado para las solicitudes CORS.

### 3. Iniciar la aplicación React

```bash
npm start
```

La aplicación estará disponible en:

`http://localhost:3000/Frontend-2`

## Variables de entorno

Las direcciones de las APIs pueden configurarse mediante un archivo `.env` en la carpeta principal del proyecto.

Ejemplo:

```env
REACT_APP_REST_API_URL=http://localhost:3001/destinos
REACT_APP_GRAPHQL_API_URL=http://localhost:4000/graphql
```

El archivo `.env.example` contiene una referencia de estas variables.

Las variables `REACT_APP_*` se incorporan durante la compilación de React. Por este motivo, cualquier cambio en ellas requiere generar nuevamente el bundle de producción.

## Funcionalidades principales

- Visualización de destinos turísticos destacados.
- Catálogo de destinos consultado mediante una API REST.
- Información de cada destino, incluyendo país, descripción y actividades.
- Consulta de vuelos asociados a cada destino mediante GraphQL.
- Consulta de hoteles, precios, categorías y disponibilidad.
- Navegación entre páginas utilizando React Router.
- Diseño adaptable a distintos tamaños de pantalla.
- Indicadores de carga y mensajes de error.
- Opción para reintentar las consultas cuando ocurre un problema de conexión.
- Datos locales de respaldo cuando los servicios mock no están disponibles.

## Rutas de navegación

La aplicación utiliza `HashRouter` para mantener la compatibilidad con GitHub Pages.

| Ruta | Descripción |
|---|---|
| `#/` | Página de inicio |
| `#/destinos` | Catálogo de destinos turísticos |
| `#/destinos/:id` | Detalle de un destino, actividades, vuelos y hoteles |
| Otras rutas | Página de error 404 |

## Pruebas y compilación

Para ejecutar las pruebas automatizadas:

```bash
npm test -- --watchAll=false
```

La suite incluye pruebas de interfaz y una prueba de integración que inicia el servidor GraphQL en un puerto temporal y realiza consultas de vuelos y hoteles mediante `travelApi.js`.

Para generar la versión de producción:

```bash
npm run build
```

El comando genera la carpeta `build/`, que contiene los archivos estáticos necesarios para publicar la aplicación.

## Publicación en GitHub Pages

La aplicación se encuentra publicada en GitHub Pages:

**URL:** https://fmorice.github.io/Frontend-2/

**Repositorio:** https://github.com/fmorice/Frontend-2

Para publicar una nueva versión del frontend:

1. Ejecutar las pruebas automatizadas.
2. Generar la compilación de producción.
3. Publicar el contenido de la carpeta `build/`.

Comandos:

```bash
npm test -- --watchAll=false
npm run build
npx gh-pages -d build
```

La publicación se realiza en la rama `gh-pages` del repositorio.

## Consideraciones sobre las APIs en producción

GitHub Pages permite alojar archivos estáticos, pero no ejecutar servidores Node.js.

Por este motivo, JSON Server y el servidor GraphQL funcionan localmente durante el desarrollo y requieren un servicio de hosting externo para estar disponibles desde Internet.

Para que las consultas REST y GraphQL funcionen desde la versión publicada, se deben configurar las direcciones públicas de ambas APIs mediante las variables:

- `REACT_APP_REST_API_URL`
- `REACT_APP_GRAPHQL_API_URL`

Los servicios externos deben permitir las solicitudes desde el dominio:

`https://fmorice.github.io`

Para ello, también se debe configurar correctamente CORS.

## Estructura del proyecto

```text
viajes-florencia-morice-PFY2202/
│
├── db.json
├── server/
│   └── graphql-server.js
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── SiteHeader.js
│   │   ├── SiteFooter.js
│   │   ├── DestinationCard.js
│   │   └── Feedback.js
│   │
│   ├── data/
│   │   └── destinations.js
│   │
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── DestinationsPage.js
│   │   ├── DestinationDetailPage.js
│   │   └── NotFoundPage.js
│   │
│   ├── services/
│   │   └── travelApi.js
│   │
│   ├── App.js
│   ├── App.css
│   └── App.test.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md




Proyecto académico desarrollado para la asignatura Desarrollo Frontend II, Semana 5.
