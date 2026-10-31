import amqp from 'amqplib';

export async function createPublisher(url) {
  const connection = await amqp.connect(url);
  const channel = await connection.createChannel();
  await channel.assertExchange('eventos', 'topic', { durable: true });
  return async (user) => channel.publish('eventos', 'usuario.creado', Buffer.from(JSON.stringify(user)), { persistent: true, contentType: 'application/json' });
}
