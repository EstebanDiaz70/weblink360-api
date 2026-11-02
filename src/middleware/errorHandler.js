// Manejo centralizado de errores: siempre responde JSON { error: "..." }
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Errores conocidos de MySQL
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Registro duplicado' });
  if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'No se puede eliminar: tiene registros relacionados' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Referencia inválida: el registro relacionado no existe' });

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : err.message });
}

module.exports = errorHandler;
