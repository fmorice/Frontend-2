# Tienda de libros

Aplicación de la Semana 4 para explorar las categorías de una librería. Su objetivo es consultar las categorías desde una API REST simulada y permitir navegar entre el catálogo y la vista de cada categoría.

## Tecnologías

- React y JavaScript
- HTML y CSS
- React Router
- JSON Server

## Funcionalidades

- Consulta las categorías mediante `fetch` desde JSON Server.
- Muestra seis categorías en el catálogo.
- Permite abrir una categoría en la ruta dinámica `/categorias/:id` y volver al catálogo.
- Muestra estados de carga y error, con un botón **Reintentar** si falla la consulta.
- Muestra una página 404 para rutas que no existen.

## Instalación

Desde la carpeta del proyecto, instala las dependencias:

```bash
npm install
```

## Cómo ejecutar

Abre dos terminales en la carpeta del proyecto.

En la primera terminal, inicia el servidor REST:

```bash
npm run server
```

JSON Server queda disponible en `http://localhost:3001`; las categorías se consultan desde `http://localhost:3001/categorias`.

En la segunda terminal, inicia la aplicación React:

```bash
npm start
```

Abre `http://localhost:3000` en el navegador.

## Pruebas

Ejecuta las pruebas con:

```bash
npm test
```

## Compilación de producción

Genera la versión de producción en la carpeta `build` con:

```bash
npm run build
```
