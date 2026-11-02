// Servicios del módulo Catálogo: categorías, productos y empresas (CRUD).
const express = require('express');
const crearCrud = require('../utils/crud');

const categorias = crearCrud({
  tabla: 'categoria', pk: 'id_categoria',
  campos: ['nombre', 'descripcion'], requeridos: ['nombre'],
  lectura: 'publico', escritura: ['Administrador']
});

const productos = crearCrud({
  tabla: 'producto', pk: 'id_producto',
  campos: ['id_categoria', 'nombre', 'descripcion', 'precio', 'stock', 'estado'],
  requeridos: ['id_categoria', 'nombre', 'precio'],
  lectura: 'publico', escritura: ['Administrador']
});

const empresas = crearCrud({
  tabla: 'empresa', pk: 'id_empresa',
  campos: ['nit', 'razon_social', 'email', 'telefono', 'ciudad'],
  requeridos: ['nit', 'razon_social'],
  lectura: ['Administrador', 'Asesor'], escritura: ['Administrador', 'Asesor']
});

module.exports = { categorias, productos, empresas };
