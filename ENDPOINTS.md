# ENDPOINTS — WebLink360 API (base: http://localhost:3000/api)

| # | Método | Endpoint | Acceso |
|---|---|---|---|
| 1 | GET | /health | Público |
| 2 | POST | /auth/register | Público |
| 3 | POST | /auth/login | Público |
| 4 | GET | /auth/perfil | Autenticado |
| 5 | GET | /usuarios | Administrador |
| 6 | GET | /usuarios/:id | Administrador |
| 7 | PUT | /usuarios/:id | Administrador |
| 8 | DELETE | /usuarios/:id | Administrador |
| 9 | GET | /categorias | Público |
| 10 | GET | /categorias/:id | Público |
| 11 | POST | /categorias | Administrador |
| 12 | PUT | /categorias/:id | Administrador |
| 13 | DELETE | /categorias/:id | Administrador |
| 14 | GET | /productos | Público |
| 15 | GET | /productos/:id | Público |
| 16 | POST | /productos | Administrador |
| 17 | PUT | /productos/:id | Administrador |
| 18 | DELETE | /productos/:id | Administrador |
| 19 | GET | /empresas | Admin / Asesor |
| 20 | GET | /empresas/:id | Admin / Asesor |
| 21 | POST | /empresas | Admin / Asesor |
| 22 | PUT | /empresas/:id | Admin / Asesor |
| 23 | DELETE | /empresas/:id | Admin / Asesor |
| 24 | POST | /pedidos | Autenticado |
| 25 | GET | /pedidos | Autenticado |
| 26 | GET | /pedidos/:id | Autenticado |
| 27 | PUT | /pedidos/:id/estado | Admin / Asesor |
| 28 | POST | /facturas | Admin / Asesor |
| 29 | GET | /facturas | Admin / Asesor |
| 30 | GET | /facturas/:id | Admin / Asesor |
| 31 | POST | /pagos | Autenticado |
| 32 | GET | /pagos | Admin / Asesor |
| 33 | GET | /pagos/:id | Admin / Asesor |
| 34 | GET | /campanas | Admin / Asesor |
| 35 | GET | /campanas/:id | Admin / Asesor |
| 36 | POST | /campanas | Admin / Asesor |
| 37 | PUT | /campanas/:id | Admin / Asesor |
| 38 | DELETE | /campanas/:id | Admin / Asesor |
| 39 | GET | /campanas/:id/empresas | Admin / Asesor |
| 40 | POST | /campanas/:id/empresas | Admin / Asesor |
