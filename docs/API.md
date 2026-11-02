# Documentación de servicios web — WebLink360 API

**Evidencia:** GA7-220501096-AA5-EV03 · **Base URL:** `http://localhost:3000/api`
**Formato:** JSON · **Autenticación:** JWT en la cabecera `Authorization: Bearer <token>`

## Convenciones
| Código | Significado |
|---|---|
| 200 / 201 | Operación exitosa / recurso creado |
| 400 | Datos faltantes o inválidos |
| 401 | Sin token, token inválido o credenciales incorrectas |
| 403 | El rol no tiene permiso |
| 404 | Recurso no encontrado |
| 409 | Conflicto (duplicado, stock insuficiente, registros relacionados) |
| 500 | Error interno |

Los errores siempre responden `{ "error": "mensaje" }`.
Los listados aceptan `?pagina=1&limite=20` (máx. 100) y responden `{ pagina, limite, total, datos: [...] }`.

**Roles:** `Administrador`, `Asesor`, `Cliente`.

---

## 1. Autenticación (`/auth`)

### POST /auth/register — Registrar usuario (público)
Entrada: `{ "nombre": "Ana Ruiz", "email": "ana@correo.com", "password": "Clave12345", "id_empresa": 1 }` (`id_empresa` opcional)
Salida 201: `{ "mensaje": "Usuario registrado correctamente", "id": 5 }`
Errores: 400 (campos/formato/contraseña < 8), 409 (email ya registrado).

### POST /auth/login — Iniciar sesión (público)
Entrada: `{ "email": "ana@correo.com", "password": "Clave12345" }`
Salida 200: `{ "mensaje": "Autenticación satisfactoria", "token": "eyJ...", "usuario": { "id": 5, "nombre": "Ana Ruiz", "rol": "Cliente" } }`
Error 401: `{ "error": "Error en la autenticación" }`

### GET /auth/perfil — Perfil del usuario autenticado
Salida 200: `{ "id_usuario": 5, "nombre": "Ana Ruiz", "email": "...", "id_empresa": null, "rol": "Cliente" }`

---

## 2. Usuarios (`/usuarios`) — solo Administrador
| Método | Ruta | Descripción |
|---|---|---|
| GET | /usuarios | Lista usuarios (sin contraseña) |
| GET | /usuarios/:id | Obtiene un usuario |
| PUT | /usuarios/:id | Actualiza `nombre`, `id_rol`, `id_empresa`, `estado` |
| DELETE | /usuarios/:id | Elimina un usuario |

## 3. Catálogo
### Categorías (`/categorias`) — lectura pública, escritura Administrador
Campos: `nombre` (obligatorio), `descripcion`.
Rutas: `GET /categorias`, `GET /categorias/:id`, `POST`, `PUT /:id`, `DELETE /:id`.

### Productos (`/productos`) — lectura pública, escritura Administrador
Campos: `id_categoria`*, `nombre`*, `descripcion`, `precio`*, `stock`, `estado` (1 activo / 0 inactivo).
Ejemplo POST: `{ "id_categoria": 1, "nombre": "Sitio web corporativo", "precio": 1500000, "stock": 50 }` → 201 `{ "mensaje": "Registro creado", "id": 1 }`

### Empresas (`/empresas`) — Administrador y Asesor
Campos: `nit`*, `razon_social`*, `email`, `telefono`, `ciudad`. CRUD completo (409 si el NIT existe).

## 4. Ventas
### POST /pedidos — Crear pedido (cualquier usuario autenticado)
Entrada: `{ "items": [ { "id_producto": 1, "cantidad": 2 }, { "id_producto": 3, "cantidad": 1 } ] }`
Salida 201: `{ "mensaje": "Pedido creado", "id": 10, "total": 3800000 }`
Proceso: transacción que valida stock, calcula el total, guarda `pedido` + `detalle_pedido` y descuenta stock.
Errores: 400 (items/cantidad), 404 (producto inexistente), 409 (stock insuficiente).

### GET /pedidos — Listar
Cliente: solo sus pedidos. Administrador/Asesor: todos.

### GET /pedidos/:id — Pedido con detalle
Salida: `{ id_pedido, id_usuario, fecha, estado, total, detalle: [ { id_detalle, id_producto, producto, cantidad, precio_unitario, subtotal } ] }`
403 si un Cliente consulta un pedido ajeno.

### PUT /pedidos/:id/estado — Administrador/Asesor
Entrada: `{ "estado": "enviado" }` · Valores: `pendiente, pagado, enviado, entregado, cancelado`.

## 5. Facturación (`/facturas`) — Administrador/Asesor
### POST /facturas — Generar factura
Entrada: `{ "id_pedido": 10 }`
Salida 201: `{ "mensaje": "Factura generada", "id": 1, "numero": "FE-000010", "subtotal": 3800000, "iva": 722000, "total": 4522000 }`
Reglas: IVA 19 %, una factura por pedido (409 si ya existe), no se factura un pedido cancelado.
Consulta: `GET /facturas`, `GET /facturas/:id`.
> El CUFE y el envío a la DIAN quedan como integración futura con un proveedor tecnológico.

## 6. Pagos (`/pagos`)
### POST /pagos — Registrar pago (autenticado; el Cliente solo paga sus pedidos)
Entrada: `{ "id_pedido": 10, "metodo": "pse", "monto": 4522000 }` · Métodos: `tarjeta, pse, efectivo, transferencia`.
Salida 201: `{ "mensaje": "Pago registrado", "id": 1, "total_pagado": 4522000, "total_pedido": 3800000 }`
Si lo pagado cubre el total, el pedido pasa a `pagado`.
Consulta (Administrador/Asesor): `GET /pagos`, `GET /pagos/:id`.

## 7. Marketing (`/campanas`) — Administrador y Asesor
Campos: `nombre`*, `canal`, `fecha_inicio`, `fecha_fin` (YYYY-MM-DD), `presupuesto`, `estado` (`borrador, activa, finalizada`). CRUD completo.
- `POST /campanas/:id/empresas` — `{ "id_empresa": 1 }` asigna una empresa a la campaña.
- `GET /campanas/:id/empresas` — lista las empresas asignadas.

## 8. Salud del servicio
`GET /health` → `{ "estado": "ok", "servicio": "WebLink360 API" }`
