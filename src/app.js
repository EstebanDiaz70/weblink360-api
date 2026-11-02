// Configuración de Express: middlewares globales y registro de rutas.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const { categorias, productos, empresas } = require('./routes/catalogo');

const app = express();
app.use(cors());
app.use(express.json());

// Verificación rápida de que la API está arriba
app.get('/api/health', (req, res) => res.json({ estado: 'ok', servicio: 'WebLink360 API' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/categorias', categorias);
app.use('/api/productos', productos);
app.use('/api/empresas', empresas);
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/facturas', require('./routes/facturas'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/campanas', require('./routes/marketing'));

// Ruta no encontrada
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;
