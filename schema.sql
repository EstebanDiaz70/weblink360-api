-- =====================================================================
-- WebLink360 - Script de base de datos (MySQL 8)
-- ajusta los nombres de columnas en src/routes/*.js si difieren.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS weblink360 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE weblink360;

CREATE TABLE IF NOT EXISTS rol (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS empresa (
  id_empresa INT AUTO_INCREMENT PRIMARY KEY,
  nit VARCHAR(20) NOT NULL UNIQUE,
  razon_social VARCHAR(120) NOT NULL,
  email VARCHAR(120),
  telefono VARCHAR(20),
  ciudad VARCHAR(60)
);

CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  id_empresa INT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE IF NOT EXISTS categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS producto (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_categoria INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL CHECK (precio >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  estado TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

CREATE TABLE IF NOT EXISTS pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente','pagado','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS detalle_pedido (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE IF NOT EXISTS factura (
  id_factura INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL UNIQUE,
  numero VARCHAR(20) NOT NULL UNIQUE,
  fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(12,2) NOT NULL,
  iva DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  cufe VARCHAR(120) NULL,
  estado ENUM('emitida','anulada') NOT NULL DEFAULT 'emitida',
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);

CREATE TABLE IF NOT EXISTS pago (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  metodo ENUM('tarjeta','pse','efectivo','transferencia') NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('aprobado','rechazado','pendiente') NOT NULL DEFAULT 'aprobado',
  FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido)
);

CREATE TABLE IF NOT EXISTS campana_marketing (
  id_campana INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  canal VARCHAR(60),
  fecha_inicio DATE,
  fecha_fin DATE,
  presupuesto DECIMAL(12,2) DEFAULT 0,
  estado ENUM('borrador','activa','finalizada') NOT NULL DEFAULT 'borrador'
);

CREATE TABLE IF NOT EXISTS campana_empresa (
  id_campana INT NOT NULL,
  id_empresa INT NOT NULL,
  PRIMARY KEY (id_campana, id_empresa),
  FOREIGN KEY (id_campana) REFERENCES campana_marketing(id_campana) ON DELETE CASCADE,
  FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa) ON DELETE CASCADE
);

-- Datos iniciales
INSERT IGNORE INTO rol (id_rol, nombre) VALUES (1,'Administrador'),(2,'Asesor'),(3,'Cliente');
INSERT IGNORE INTO categoria (id_categoria, nombre, descripcion) VALUES
  (1,'Diseño web','Sitios web corporativos y landing pages'),
  (2,'Facturación electrónica','Servicios de facturación con cumplimiento DIAN'),
  (3,'E-commerce','Tiendas virtuales'),
  (4,'Marketing digital','Campañas y gestión de redes');
