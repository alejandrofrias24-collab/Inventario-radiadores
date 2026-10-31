import '../../../config/env.js';
import { Sequelize } from 'sequelize';

const required = ['SQL_SERVER', 'SQL_DATABASE', 'SQL_USER', 'SQL_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno SQL: ${missing.join(', ')}`);
}


export const sequelize = new Sequelize(
  process.env.SQL_DATABASE,
  process.env.SQL_USER,
  process.env.SQL_PASSWORD,
  {
    host: process.env.SQL_SERVER,
    port: Number(process.env.SQL_PORT ?? 1433),
    dialect: 'mssql',
    logging: false,
    dialectOptions: {
      options: {
        encrypt: process.env.SQL_ENCRYPT === 'true',
        trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE !== 'false',
        enableArithAbort: true
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export async function ensureProductDatabase() {
  const bootstrap = new Sequelize('master', process.env.SQL_USER, process.env.SQL_PASSWORD, {
    host: process.env.SQL_SERVER,
    port: Number(process.env.SQL_PORT ?? 1433),
    dialect: 'mssql',
    logging: false,
    dialectOptions: { options: { encrypt: process.env.SQL_ENCRYPT === 'true', trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE !== 'false', enableArithAbort: true } }
  });
  try {
    await bootstrap.query("IF DB_ID(N'mi_proyecto_productos') IS NULL CREATE DATABASE [mi_proyecto_productos]");
  } finally {
    await bootstrap.close();
  }
}

export async function connectSqlServer() {
  await ensureProductDatabase();
  await sequelize.authenticate();
  console.info('Conexión a SQL Server establecida.');
}
