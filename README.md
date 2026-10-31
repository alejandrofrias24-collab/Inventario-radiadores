# Gestión de inventario de radiadores

El proyecto corre como microservicios independientes:

- `servicios/auth`: registro, login y emisión de JWT; guarda sus usuarios en la base `mi_proyecto_auth` y publica `usuario.creado` en RabbitMQ.
- `api`: servicio de negocio de radiadores; consulta la colección `radiadores` de la base indicada en `MONGODB_URI`.
- `gateway`: única entrada HTTP del frontend; enruta `/api/auth/*` y `/api/productos/*` al servicio correspondiente.
- `frontend`: aplicación React servida por Nginx; las llamadas `/api` pasan por el Gateway.

Las bases de datos se aíslan por servicio: autenticación usa su base SQL Server `mi_proyecto_auth` y productos usa su propia base MongoDB. Ninguno consulta la base del otro.

## Levantar todo

Desde la raíz, copia `.env.example` a `.env`, configura `MONGODB_URI` con la conexión Atlas usada por Compass y cambia las contraseñas de desarrollo. Después ejecuta:

```sh
docker compose up --build
```

Abre el frontend en `http://localhost:8080`; el Gateway queda disponible en `http://localhost:3100`. MongoDB y RabbitMQ también publican sus puertos en `127.0.0.1` para permitir desarrollo local desde Node. SQL Server se publica en `127.0.0.1:11433` para conectarse desde SSMS sin ocupar el puerto local `1433`.

El primer arranque crea la base y tabla de autenticación. Para mostrar los datos de Atlas, copia el URI de conexión que usa Compass a `MONGODB_URI` en el `.env` de la raíz del proyecto. El URI debe incluir la base mostrada en Compass; la API consulta la colección `radiadores` y adapta `vehiculo_compatible`, `ano_desde`, `ano_hasta` y `precio_dop` al formato de la web. Mantén ese URI privado y no lo subas al repositorio.

### Desarrollo del frontend con Vite

Si quieres usar el servidor de desarrollo de Vite (puerto `5173`), primero deja arriba las dependencias y servicios backend desde la raíz:

```sh
docker compose up -d --build sqlserver mongodb rabbitmq auth productos gateway
npm --prefix frontend run dev
```

Vite reenvía `/api` al Gateway en `127.0.0.1:3100`. Puedes cambiar ese destino con `VITE_GATEWAY_URL`.




