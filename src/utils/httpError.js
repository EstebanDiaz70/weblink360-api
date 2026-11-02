// Crea un error con código HTTP para que el manejador global responda bien.
function httpError(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

// Envuelve funciones async para enviar los errores al manejador global.
const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { httpError, asyncH };
