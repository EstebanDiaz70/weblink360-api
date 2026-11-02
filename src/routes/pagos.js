// Servicios de pagos: registrar un pago y marcar el pedido como pagado si se cubre el total.
const pool = require('../config/db');
const crearCrud = require('../utils/crud');
const { verificarToken } = require('../middleware/auth');
const { httpError, asyncH } = require('../utils/httpError');

const METODOS = ['tarjeta', 'pse', 'efectivo', 'transferencia'];

const router = crearCrud({
  tabla: 'pago', pk: 'id_pago', campos: [],
  lectura: ['Administrador', 'Asesor'], escritura: ['Administrador'],
  metodos: ['listar', 'obtener']
});

// POST /api/pagos  body: { id_pedido, metodo, monto }
router.post('/', verificarToken, asyncH(async (req, res) => {
  const { id_pedido, metodo, monto } = req.body;
  if (!id_pedido || !metodo || monto === undefined) throw httpError(400, 'id_pedido, metodo y monto son obligatorios');
  if (!METODOS.includes(metodo)) throw httpError(400, `Método inválido. Opciones: ${METODOS.join(', ')}`);
  if (!(Number(monto) > 0)) throw httpError(400, 'El monto debe ser mayor a 0');

  const [ped] = await pool.query('SELECT id_usuario, total, estado FROM pedido WHERE id_pedido = ?', [id_pedido]);
  if (!ped.length) throw httpError(404, 'Pedido no encontrado');
  if (req.usuario.rol === 'Cliente' && ped[0].id_usuario !== req.usuario.id) {
    throw httpError(403, 'No puedes pagar pedidos de otros usuarios');
  }
  if (ped[0].estado === 'cancelado') throw httpError(409, 'El pedido está cancelado');

  const [r] = await pool.query('INSERT INTO pago (id_pedido, metodo, monto) VALUES (?,?,?)', [id_pedido, metodo, monto]);

  // Si lo pagado cubre el total, el pedido pasa a "pagado"
  const [[{ pagado }]] = await pool.query(
    "SELECT COALESCE(SUM(monto),0) AS pagado FROM pago WHERE id_pedido = ? AND estado = 'aprobado'", [id_pedido]);
  if (pagado >= ped[0].total && ped[0].estado === 'pendiente') {
    await pool.query("UPDATE pedido SET estado = 'pagado' WHERE id_pedido = ?", [id_pedido]);
  }
  res.status(201).json({ mensaje: 'Pago registrado', id: r.insertId, total_pagado: pagado, total_pedido: ped[0].total });
}));

module.exports = router;
