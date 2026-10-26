import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const ProductoModel = sequelize.define(
  'Producto',
  {
    id: { field: 'Id', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    codigo: { field: 'Codigo', type: DataTypes.STRING(40), allowNull: false, unique: true, validate: { notEmpty: true, len: [1, 40] } },
    nombre: { field: 'Nombre', type: DataTypes.STRING(160), allowNull: false, validate: { notEmpty: true, len: [1, 160] } },
    descripcion: { field: 'Descripcion', type: DataTypes.STRING(1000), allowNull: true },
    marca: { field: 'Marca', type: DataTypes.STRING(100), allowNull: false },
    modelo: { field: 'Modelo', type: DataTypes.STRING(120), allowNull: false },
    vehiculo: { field: 'Vehiculo', type: DataTypes.STRING(120), allowNull: false },
    anioDesde: { field: 'AnioDesde', type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1900 } },
    anioHasta: { field: 'AnioHasta', type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1900 } },
    precio: { field: 'Precio', type: DataTypes.DECIMAL(12, 2), allowNull: false, validate: { min: 0 } },
    stock: { field: 'Stock', type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    creadoEn: { field: 'CreadoEn', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    actualizadoEn: { field: 'ActualizadoEn', type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  },
  { tableName: 'Productos', schema: 'dbo', timestamps: false, freezeTableName: true }
);
