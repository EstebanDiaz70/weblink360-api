// Middlewares de autenticación (JWT) y autorización por rol.
const jwt = require('jsonwebtoken');
const { httpError } = require('../utils/httpError');

// Verifica el token "Authorization: Bearer <token>" y deja el usuario en req.usuario
function verificarToken(req, res, next) {
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(httpError(401, 'Token no proporcionado'));
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET); // { id, email, rol }
    next();
  } catch (e) {
    next(httpError(401, 'Token inválido o expirado'));
  }
}

// Permite el acceso solo a los roles indicados. Ej: soloRoles('Administrador')
const soloRoles = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return next(httpError(403, 'No tienes permisos para esta acción'));
  }
  next();
};

module.exports = { verificarToken, soloRoles };
