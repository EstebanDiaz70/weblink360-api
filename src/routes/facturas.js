// Servicios de facturación: generar factura de un pedido y consultarlas.
// NOTA: el CUFE y el envío a la DIAN quedan como integración futura (proveedor tecnológico).
const pool = require('../config/db');
const crearCrud = require('../utils/crud');
const { verificarToken, soloRoles } = require('../middleware/auth');
const { httpError, asyncH } = require('../utils/httpError');

const IVA = 0.19; // IVA general en Colombia

const router = crearCrud({
  tabla: 'factura', pk: 'id_factura', campos: [],
  lectura: ['Administrador', 'Asesor'], escritura: ['Administrador'],
  metodos: ['listar', 'obtener']
});

// POST /api/facturas  body: { id_pedido }
router.post('/', verificarToken, soloRoles('Administrador', 'Asesor'), asyncH(async (req, res) => {
  const { id_pedido } = req.body;
  if (!id_pedido) throw httpError(400, 'id_pedido es obligatorio');

  const [ped] = await pool.query('SELECT id_pedido, total, estado FROM pedido WHERE id_pedido = ?', [id_pedido]);
  if (!ped.length) throw httpError(404, 'Pedido no encontrado');
  if (ped[0].estado === 'cancelado') throw httpError(409, 'No se puede facturar un pedido cancelado');

  const subtotal = ped[0].total;
  const iva = Math.round(subtotal * IVA * 100) / 100;
  const total = subtotal + iva;
  const numero = `FE-${String(id_pedido).padStart(6, '0')}`;

  // La columna id_pedido es UNIQUE: un pedido solo puede tener una factura (409 si ya existe)
  const [r] = await pool.query(
    'INSERT INTO factura (id_pedido, numero, subtotal, iva, total) VALUES (?,?,?,?,?)',
    [id_pedido, numero, subtotal, iva, total]
  );
  res.status(201).json({ mensaje: 'Factura generada', id: r.insertId, numero, subtotal, iva, total });
}));

module.exports = router;
