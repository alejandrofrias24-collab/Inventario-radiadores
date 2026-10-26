SELECT
  Codigo AS codigo,
  Nombre AS nombre,
  COALESCE(Descripcion, '') AS descripcion,
  Marca AS marca,
  Modelo AS modelo,
  Vehiculo AS vehiculo,
  AnioDesde AS anioDesde,
  AnioHasta AS anioHasta,
  CONVERT(varchar(50), Precio) AS precio,
  Stock AS stock
FROM mi_proyecto.dbo.Productos
ORDER BY Id;