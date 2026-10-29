import amqp from "amqplib";

const connection =
 await amqp.connect(
  process.env.RABBIT_URL
 );

const channel =
 await connection.createChannel();

await channel.assertExchange(
 "eventos",
 "topic",
 { durable:true }
);

channel.publish(
 "eventos",
 "usuario.creado",
 Buffer.from(
   JSON.stringify({
      id:nuevoUsuario.id,
      email:nuevoUsuario.email
   })
 )
);