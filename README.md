# Gestión de inventario de radiadores


- **Dominio:** define la entidad `Producto`, sus reglas de validación y el contrato del repositorio, sin depender de Express ni de SQL Server.
- **Aplicación:** reúne los casos de uso para crear, listar, consultar, actualizar y eliminar productos.
- **Infraestructura:** implementa el repositorio con Sequelize/SQL Server y conecta los controladores y rutas HTTP con los casos de uso.
- Esta separación permite cambiar la base de datos o la forma de exponer la API sin reescribir las reglas del negocio.
- Los controladores traducen solicitudes y respuestas HTTP; el dominio conserva las reglas para que puedan aplicarse de forma consistente.
- Autenticación, historial y otros módulos auxiliares usan una estructura MVC más directa porque no requieren el mismo nivel de aislamiento.
- El frontend React consume la API y administra sus datos remotos con React Query, manteniendo la interfaz separada del acceso a la base de datos.
