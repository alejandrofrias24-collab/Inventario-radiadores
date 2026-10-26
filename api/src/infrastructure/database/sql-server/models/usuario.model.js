import { DataTypes } from 'sequelize';
import { sequelize } from '../connection.js';

export const UsuarioModel = sequelize.define(
  'Usuario',
  {
    id: {
      field: 'Id',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      field: 'Nombre',
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 120] }
    },
    email: {
      field: 'Email',
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, len: [3, 254] }
    },
    passwordHash: {
      field: 'PasswordHash',
      type: DataTypes.STRING(255),
      allowNull: false
    },
    creadoEn: {
      field: 'CreadoEn',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    actualizadoEn: {
      field: 'ActualizadoEn',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'Usuarios',
    schema: 'dbo',
    timestamps: false,
    freezeTableName: true
  }
);
