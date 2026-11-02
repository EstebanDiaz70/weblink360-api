// Fábrica de rutas CRUD reutilizable. Las columnas se toman de una lista
// blanca (campos) y los valores siempre se envían parametrizados (evita SQL Injection).
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRoles } = require('../middleware/auth');
const { httpError, asyncH } = require('./httpError');

/**
 * @param {object} cfg
 * @param {string} cfg.tabla      Nombre de la tabla
 * @param {string} cfg.pk         Llave primaria
 * @param {string[]} cfg.campos   Columnas editables (lista blanca)
 * @param {string[]} cfg.requeridos Campos obligatorios al crear
 * @param {string} cfg.columnas   Columnas a devolver en SELECT (por defecto *)
 * @param {'publico'|'autenticado'|string[]} cfg.lectura  Quién puede leer
 * @param {string[]} cfg.escritura Roles que pueden crear/editar/eliminar
 * @param {string[]} cfg.metodos  Operaciones habilitadas
 */
function crearCrud(cfg) {
  const {
    tabla, pk, campos, requeridos = [], columnas = '*',
    lectura = 'autenticado', escritura = ['Administrador'],
    metodos = ['listar', 'obtener', 'crear', 'actualizar', 'eliminar']
  } = cfg;

  const router = express.Router();
  const mwLectura = lectura === 'publico' ? []
    : Array.isArray(lectura) ? [verificarToken, soloRoles(...lectura)] : [verificarToken];
  const mwEscritura = [verificarToken, soloRoles(...escritura)];

  // Toma del body solo los campos permitidos
  const filtrar = (body) => Object.fromEntries(
    Object.entries(body || {}).filter(([k, v]) => campos.includes(k) && v !== undefined)
  );

  // GET /  -> listar (con paginación ?pagina=1&limite=20)
  if (metodos.includes('listar')) {
    router.get('/', ...mwLectura, asyncH(async (req, res) => {
      const limite = Math.min(Number(req.query.limite) || 20, 100);
      const pagina = Math.max(Number(req.query.pagina) || 1, 1);
      const [filas] = await pool.query(
        `SELECT ${columnas} FROM ${tabla} ORDER BY ${pk} LIMIT ? OFFSET ?`,
        [limite, (pagina - 1) * limite]
      );
      const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ${tabla}`);
      res.json({ pagina, limite, total, datos: filas });
    }));
  }

  // GET /:id -> obtener uno
  if (metodos.includes('obtener')) {
    router.get('/:id', ...mwLectura, asyncH(async (req, res) => {
      const [filas] = await pool.query(`SELECT ${columnas} FROM ${tabla} WHERE ${pk} = ?`, [req.params.id]);
      if (!filas.length) throw httpError(404, 'Registro no encontrado');
      res.json(filas[0]);
    }));
  }

  // POST / -> crear
  if (metodos.includes('crear')) {
    router.post('/', ...mwEscritura, asyncH(async (req, res) => {
      const datos = filtrar(req.body);
      const faltantes = requeridos.filter((c) => datos[c] === undefined || datos[c] === '');
      if (faltantes.length) throw httpError(400, `Campos obligatorios: ${faltantes.join(', ')}`);
      const [r] = await pool.query(`INSERT INTO ${tabla} SET ?`, [datos]);
      res.status(201).json({ mensaje: 'Registro creado', id: r.insertId });
    }));
  }

  // PUT /:id -> actualizar
  if (metodos.includes('actualizar')) {
    router.put('/:id', ...mwEscritura, asyncH(async (req, res) => {
      const datos = filtrar(req.body);
      if (!Object.keys(datos).length) throw httpError(400, 'No se enviaron campos válidos para actualizar');
      const [r] = await pool.query(`UPDATE ${tabla} SET ? WHERE ${pk} = ?`, [datos, req.params.id]);
      if (!r.affectedRows) throw httpError(404, 'Registro no encontrado');
      res.json({ mensaje: 'Registro actualizado' });
    }));
  }

  // DELETE /:id -> eliminar
  if (metodos.includes('eliminar')) {
    router.delete('/:id', ...mwEscritura, asyncH(async (req, res) => {
      const [r] = await pool.query(`DELETE FROM ${tabla} WHERE ${pk} = ?`, [req.params.id]);
      if (!r.affectedRows) throw httpError(404, 'Registro no encontrado');
      res.json({ mensaje: 'Registro eliminado' });
    }));
  }

  return router;
}

module.exports = crearCrud;
