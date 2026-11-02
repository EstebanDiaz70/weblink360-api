// Gestión de usuarios (solo Administrador). El alta se hace por /auth/register.
const crearCrud = require('../utils/crud');

module.exports = crearCrud({
  tabla: 'usuario', pk: 'id_usuario',
  // Nunca se expone password_hash
  columnas: 'id_usuario, nombre, email, id_rol, id_empresa, estado, created_at',
  campos: ['nombre', 'id_rol', 'id_empresa', 'estado'],
  lectura: ['Administrador'], escritura: ['Administrador'],
  metodos: ['listar', 'obtener', 'actualizar', 'eliminar']
});
