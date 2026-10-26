import { Connection } from 'tedious';

console.log('🚀 Iniciando prueba Tedious...');

const connection = new Connection({
  server: 'localhost',
  authentication: {
    type: 'default',
    options: {
      userName: 'sa',
      password: 'TuContraseñaSegura123!'
    }
  },
  options: {
    database: 'mi_proyecto',
    port: 1433,
    encrypt: false,
    trustServerCertificate: true
  }
});

connection.on('connect', (err) => {
  if (err) {
    console.error('❌ Error Tedious:', err);
  } else {
    console.log('✅ Tedious conectado correctamente');
  }

  connection.close();
});

connection.on('error', (err) => {
  console.error('❌ Evento error:', err);
});

console.log('⏳ Esperando conexión...');