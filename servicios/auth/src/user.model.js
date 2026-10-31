import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

export const Usuario = sequelize.define('Usuario', {
  id: { field: 'Id', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { field: 'Nombre', type: DataTypes.STRING(120), allowNull: false },
  email: { field: 'Email', type: DataTypes.STRING(254), allowNull: false, unique: true },
  passwordHash: { field: 'PasswordHash', type: DataTypes.STRING(255), allowNull: false },
  creadoEn: { field: 'CreadoEn', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  actualizadoEn: { field: 'ActualizadoEn', type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'Usuarios', schema: 'dbo', timestamps: false, freezeTableName: true });
