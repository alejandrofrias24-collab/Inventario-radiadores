import { Sequelize } from 'sequelize';

const database = process.env.AUTH_SQL_DATABASE || 'mi_proyecto_auth';
const username = process.env.SQL_USER || 'sa';
const password = process.env.SQL_PASSWORD;
const host = process.env.SQL_SERVER || 'localhost';
const port = Number(process.env.SQL_PORT || 1433);
const dialectOptions = { options: { encrypt: process.env.SQL_ENCRYPT === 'true', trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE !== 'false', enableArithAbort: true, connectTimeout: 30000, requestTimeout: 120000, cancelTimeout: 15000 } };

if (!password) throw new Error('Falta SQL_PASSWORD para el servicio de autenticación.');

export const sequelize = new Sequelize(database, username, password, { host, port, dialect: 'mssql', logging: false, dialectOptions });

export async function ensureAuthDatabase() {
  const bootstrap = new Sequelize('master', username, password, { host, port, dialect: 'mssql', logging: false, dialectOptions });
  try {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      try {
        await bootstrap.query("IF DB_ID(N'mi_proyecto_auth') IS NULL CREATE DATABASE [mi_proyecto_auth]");
        return;
      } catch (error) {
        const code = error.original?.code ?? error.parent?.code ?? error.code;
        const transient = ['ETIMEOUT', 'ESOCKET', 'ECONNRESET', 'ECONNREFUSED', 'ECONNCLOSED'].includes(code);
        if (!transient || attempt === 5) throw error;
        console.warn(`SQL Server aún inicializa la base de autenticación (intento ${attempt}/5). Reintentando en 5s.`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  } finally {
    await bootstrap.close();
  }
}
