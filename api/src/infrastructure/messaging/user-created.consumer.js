import amqp from 'amqplib';
import { HistorialModel } from '../database/mongodb/models/historial.model.js';

export async function startUserCreatedConsumer(url = process.env.RABBITMQ_URL || process.env.RABBIT_URL || 'amqp://app:app-dev-password@127.0.0.1:5672') {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  await channel.assertExchange('eventos', 'topic', { durable: true });
  const queue = await channel.assertQueue('productos.usuario', { durable: true });
  await channel.bindQueue(queue.queue, 'eventos', 'usuario.creado');
  await channel.consume(queue.queue, async (message) => {
    if (!message) return;
    try {
      const user = JSON.parse(message.content.toString());
      await HistorialModel.create({ usuarioId: user.id, accion: 'usuario.creado', recurso: 'usuarios', detalles: { email: user.email, nombre: user.nombre } });
      channel.ack(message);
      console.info(`Evento usuario.creado procesado para ${user.email}.`);
    } catch (error) {
      console.error('No se pudo procesar usuario.creado:', error.message);
      channel.nack(message, false, false);
    }
  });
  return async () => { await channel.close().catch(() => {}); await connection.close().catch(() => {}); };
}
