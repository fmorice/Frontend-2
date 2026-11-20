export function LoadingMessage({ children = 'Cargando información...' }) {
  return <p className="loading-state" role="status">{children}</p>;
}

export function ApiNotice({ error, service, onRetry }) {
  if (!error) return null;

  const title = error.type === 'connection'
    ? `No hay conexión con ${service}`
    : error.type === 'http'
      ? `Respuesta HTTP no exitosa en ${service}`
      : `No se pudo leer la respuesta de ${service}`;

  return (
    <div className="api-notice" role="alert">
      <div>
        <strong>{title}</strong>
        <p>{error.message} Mostramos datos de respaldo mientras tanto.</p>
      </div>
      <button className="text-button" type="button" onClick={onRetry}>Reintentar</button>
    </div>
  );
}