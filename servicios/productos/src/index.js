import amqp from "amqplib";

const connection =
 await amqp.connect(
   process.env.RABBIT_URL
 );

const channel =
 await connection.createChannel();

await channel.assertExchange(
 "eventos",
 "topic"
);

const q =
 await channel.assertQueue(
   "productos.usuario"
 );

channel.bindQueue(
 q.queue,
 "eventos",
 "usuario.creado"
);

channel.consume(
 q.queue,
 async(msg)=>{

   const data =
    JSON.parse(
     msg.content.toString()
    );

   console.log(
    "Usuario recibido:",
    data.email
   );

 });