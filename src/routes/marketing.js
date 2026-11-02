// Servicios de marketing digital: campañas y su asignación a empresas.
const pool = require('../config/db');
const crearCrud = require('../utils/crud');
const { verificarToken, soloRoles } = require('../middleware/auth');
const { httpError, asyncH } = require('../utils/httpError');

const router = crearCrud({
  tabla: 'campana_marketing', pk: 'id_campana',
  campos: ['nombre', 'canal', 'fecha_inicio', 'fecha_fin', 'presupuesto', 'estado'],
  requeridos: ['nombre'],
  lectura: ['Administrador', 'Asesor'], escritura: ['Administrador', 'Asesor']
});

// GET /api/campanas/:id/empresas -> empresas asignadas a la campaña
router.get('/:id/empresas', verificarToken, soloRoles('Administrador', 'Asesor'), asyncH(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT e.* FROM empresa e JOIN campana_empresa ce ON ce.id_empresa = e.id_empresa
      WHERE ce.id_campana = ?`, [req.params.id]);
  res.json(filas);
}));

// POST /api/campanas/:id/empresas  body: { id_empresa }
router.post('/:id/empresas', verificarToken, soloRoles('Administrador', 'Asesor'), asyncH(async (req, res) => {
  if (!req.body.id_empresa) throw httpError(400, 'id_empresa es obligatorio');
  await pool.query('INSERT INTO campana_empresa (id_campana, id_empresa) VALUES (?,?)',
    [req.params.id, req.body.id_empresa]);
  res.status(201).json({ mensaje: 'Empresa asignada a la campaña' });
}));

module.exports = router;
