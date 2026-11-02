// Servicio de registro e inicio de sesión (evolución de la AA5-EV01).
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');
const { httpError, asyncH } = require('../utils/httpError');

const router = express.Router();
const ROL_CLIENTE = 3;

// POST /api/auth/register -> crea un usuario con rol Cliente
router.post('/register', asyncH(async (req, res) => {
  const { nombre, email, password, id_empresa } = req.body;
  if (!nombre || !email || !password) throw httpError(400, 'nombre, email y password son obligatorios');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Email con formato inválido');
  if (password.length < 8) throw httpError(400, 'La contraseña debe tener mínimo 8 caracteres');

  const hash = await bcrypt.hash(password, 10); // nunca se guarda la contraseña en texto plano
  const [r] = await pool.query(
    'INSERT INTO usuario (nombre, email, password_hash, id_rol, id_empresa) VALUES (?,?,?,?,?)',
    [nombre, email.toLowerCase(), hash, ROL_CLIENTE, id_empresa || null]
  );
  res.status(201).json({ mensaje: 'Usuario registrado correctamente', id: r.insertId });
}));

// POST /api/auth/login -> valida credenciales y devuelve un token JWT
router.post('/login', asyncH(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'email y password son obligatorios');

  const [filas] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.password_hash, u.estado, r.nombre AS rol
       FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE u.email = ?`,
    [email.toLowerCase()]
  );
  const u = filas[0];
  // Mismo mensaje para usuario inexistente o clave errada (no revela cuál falló)
  if (!u || !u.estado || !(await bcrypt.compare(password, u.password_hash))) {
    throw httpError(401, 'Error en la autenticación');
  }
  const token = jwt.sign({ id: u.id_usuario, email: u.email, rol: u.rol },
    process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '2h' });
  res.json({ mensaje: 'Autenticación satisfactoria', token, usuario: { id: u.id_usuario, nombre: u.nombre, rol: u.rol } });
}));

// GET /api/auth/perfil -> datos del usuario autenticado
router.get('/perfil', verificarToken, asyncH(async (req, res) => {
  const [filas] = await pool.query(
    `SELECT u.id_usuario, u.nombre, u.email, u.id_empresa, r.nombre AS rol
       FROM usuario u JOIN rol r ON r.id_rol = u.id_rol WHERE u.id_usuario = ?`,
    [req.usuario.id]
  );
  if (!filas.length) throw httpError(404, 'Usuario no encontrado');
  res.json(filas[0]);
}));

module.exports = router;
