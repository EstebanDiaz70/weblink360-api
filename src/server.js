// Punto de entrada: arranca el servidor HTTP.
require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}
const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`WebLink360 API escuchando en http://localhost:${PORT}`));
