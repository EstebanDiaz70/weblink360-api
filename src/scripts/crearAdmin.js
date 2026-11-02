// Crea el usuario administrador inicial:  npm run seed:admin
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

(async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@weblink360.co';
  const password = process.env.ADMIN_PASSWORD || 'Admin12345';
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT IGNORE INTO usuario (nombre, email, password_hash, id_rol) VALUES (?,?,?,1)',
    ['Administrador', email, hash]
  );
  console.log(`Administrador listo -> ${email} / ${password}`);
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
