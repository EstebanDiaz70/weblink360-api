# WebLink360 API

API REST del proyecto formativo **WebLink360** 
SENA · Tecnología en Análisis y Desarrollo de Software · Evidencia GA7-220501096-AA5-EV03.

**Tecnologías:** Node.js, Express, MySQL (mysql2), JWT, bcryptjs, Git.

## Estructura
```
src/
  config/db.js            Conexión MySQL (pool)
  middleware/             auth.js (JWT y roles), errorHandler.js
  utils/                  crud.js (CRUD reutilizable), httpError.js
  routes/                 auth, usuarios, catalogo, pedidos, facturas, pagos, marketing
  app.js / server.js      Configuración y arranque
schema.sql                Script de la base de datos (11 tablas + datos iniciales)
docs/API.md               Documentación de cada servicio
ENDPOINTS.md              Lista de endpoints
```

## Puesta en marcha
1. Instalar Node.js 18+ y MySQL 8.
2. Crear la BD: `mysql -u root -p < schema.sql`
3. `cp .env.example .env` y editar usuario/clave de MySQL y `JWT_SECRET`.
4. `npm install`
5. `npm run seed:admin` (crea admin@weblink360.co / Admin12345)
6. `npm start` → http://localhost:3000/api/health

## Estándar de codificación
camelCase para variables y funciones, nombres de tablas/columnas en snake_case, rutas en minúscula y plural, comentarios en español en cada servicio.

## Seguridad
Contraseñas con bcrypt, autenticación JWT, control de acceso por rol, consultas parametrizadas (anti SQL Injection) y lista blanca de columnas editables.
