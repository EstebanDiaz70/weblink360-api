// Servicios de ventas: crear pedidos (con detalle y control de stock) y consultarlos.
const express = require('express');
const pool = require('../config/db');
const { verificarToken, soloRoles } = require('../middleware/auth');
const { httpError, asyncH } = require('../utils/httpError');

const router = express.Router();
const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

// POST /api/pedidos  body: { items: [{ id_producto, cantidad }] }
// Usa una transacción: o se guarda todo el pedido o no se guarda nada.
router.post('/', verificarToken, asyncH(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) throw httpError(400, 'Debes enviar al menos un item');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const detalles = [];

    for (const it of items) {
      const cantidad = Number(it.cantidad);
      if (!Number.isInteger(cantidad) || cantidad <= 0) throw httpError(400, 'La cantidad debe ser un entero mayor a 0');

      // FOR UPDATE bloquea la fila para evitar vender más stock del disponible
      const [p] = await conn.query(
        'SELECT id_producto, nombre, precio, stock FROM producto WHERE id_producto = ? AND estado = 1 FOR UPDATE',
        [it.id_producto]
      );
      if (!p.length) throw httpError(404, `Producto ${it.id_producto} no existe o está inactivo`);
      if (p[0].stock < cantidad) throw httpError(409, `Stock insuficiente para "${p[0].nombre}" (disponible: ${p[0].stock})`);

      const subtotal = p[0].precio * cantidad;
      total += subtotal;
      detalles.push({ id_producto: p[0].id_producto, cantidad, precio_unitario: p[0].precio, subtotal });
    }

    const [ped] = await conn.query('INSERT INTO pedido (id_usuario, estado, total) VALUES (?,?,?)',
      [req.usuario.id, 'pendiente', total]);

    for (const d of detalles) {
      await conn.query(
        'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES (?,?,?,?,?)',
        [ped.insertId, d.id_producto, d.cantidad, d.precio_unitario, d.subtotal]
      );
      await conn.query('UPDATE producto SET stock = stock - ? WHERE id_producto = ?', [d.cantidad, d.id_producto]);
    }

    await conn.commit();
    res.status(201).json({ mensaje: 'Pedido creado', id: ped.insertId, total });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release(); // siempre devolver la conexión al pool
  }
}));

// GET /api/pedidos -> Cliente ve solo los suyos; Administrador/Asesor ven todos
router.get('/', verificarToken, asyncH(async (req, res) => {
  const esCliente = req.usuario.rol === 'Cliente';
  const [filas] = await pool.query(
    `SELECT * FROM pedido ${esCliente ? 'WHERE id_usuario = ?' : ''} ORDER BY id_pedido DESC`,
    esCliente ? [req.usuario.id] : []
  );
  res.json(filas);
}));

// GET /api/pedidos/:id -> pedido con su detalle
router.get('/:id', verificarToken, asyncH(async (req, res) => {
  const [ped] = await pool.query('SELECT * FROM pedido WHERE id_pedido = ?', [req.params.id]);
  if (!ped.length) throw httpError(404, 'Pedido no encontrado');
  if (req.usuario.rol === 'Cliente' && ped[0].id_usuario !== req.usuario.id) {
    throw httpError(403, 'No puedes ver pedidos de otros usuarios');
  }
  const [det] = await pool.query(
    `SELECT d.id_detalle, d.id_producto, p.nombre AS producto, d.cantidad, d.precio_unitario, d.subtotal
       FROM detalle_pedido d JOIN producto p ON p.id_producto = d.id_producto WHERE d.id_pedido = ?`,
    [req.params.id]
  );
  res.json({ ...ped[0], detalle: det });
}));

// PUT /api/pedidos/:id/estado  body: { estado }
router.put('/:id/estado', verificarToken, soloRoles('Administrador', 'Asesor'), asyncH(async (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) throw httpError(400, `Estado inválido. Opciones: ${ESTADOS.join(', ')}`);
  const [r] = await pool.query('UPDATE pedido SET estado = ? WHERE id_pedido = ?', [estado, req.params.id]);
  if (!r.affectedRows) throw httpError(404, 'Pedido no encontrado');
  res.json({ mensaje: 'Estado del pedido actualizado' });
}));

module.exports = router;
