import './App.css';
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  Routes,
  useOutletContext,
  useParams,
} from 'react-router';

let categoriesRequest;

function getCategories() {
  if (!categoriesRequest) {
    categoriesRequest = fetch('http://localhost:3001/categorias')
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudieron cargar las categorías.');
        }

        return response.json();
      })
      .finally(() => {
        categoriesRequest = null;
      });
  }

  return categoriesRequest;
}

function PageHeader() {
  return (
    <header className="masthead">
      <span className="brand-mark">L.</span>
      <span className="brand-name">Librería</span>
    </header>
  );
}

function CategoriesLayout() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;

    getCategories()
      .then((data) => {
        if (isActive) {
          setCategories(data);
        }
      })
      .catch(() => {
        if (isActive) {
          setError(true);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [retryCount]);

  function handleRetry() {
    setError(false);
    setLoading(true);
    setRetryCount((count) => count + 1);
  }

  return (
    <main className="page">
      <PageHeader />
      {loading && (
        <p className="loading-message" role="status">
          Cargando categorías...
        </p>
      )}
      {error && (
        <section className="message" role="alert">
          <h1>No se pudieron cargar las categorías</h1>
          <p>Comprueba que el servidor esté activo e inténtalo de nuevo.</p>
          <button type="button" onClick={handleRetry}>
            Reintentar
          </button>
        </section>
      )}
      {!loading && !error && <Outlet context={categories} />}
    </main>
  );
}

function CategoriesPage() {
  const categories = useOutletContext();

  return (
    <section className="catalog" aria-labelledby="page-title">
      <p className="eyebrow">NUESTRO CATÁLOGO</p>
      <h1 id="page-title">Explora la librería</h1>
      <p className="intro">Elige una categoría para empezar.</p>

      <ul className="category-list" aria-label="Categorías">
        {categories.map((category, index) => (
          <li key={category.id}>
            <Link
              className="category-item"
              to={`/categorias/${category.id}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
                <span className="category-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2>{category.nombre}</h2>
                <span className="category-arrow" aria-hidden="true">
                  &#8594;
                </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CategoryPage() {
  const categories = useOutletContext();
  const { id } = useParams();
  const category = categories.find((item) => String(item.id) === id);

  if (!category) {
    return (
      <section className="message" role="alert">
        <h1>Categoría no encontrada</h1>
        <p>No encontramos una categoría con ese ID.</p>
        <Link className="back-link" to="/">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="catalog" aria-labelledby="page-title">
      <p className="eyebrow">CATEGORÍA</p>
      <h1 id="page-title">{category.nombre}</h1>
      <Link className="back-link" to="/">
        Volver al catálogo
      </Link>
    </section>
  );
}

function NotFoundPage() {
  return (
    <main className="page">
      <PageHeader />
      <section className="message">
        <h1>Página no encontrada</h1>
        <p>La página que buscas no existe.</p>
        <Link className="back-link" to="/">
          Volver al catálogo
        </Link>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<CategoriesLayout />}>
          <Route path="/" element={<CategoriesPage />} />
          <Route path="/categorias/:id" element={<CategoryPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
