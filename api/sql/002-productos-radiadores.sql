/* Migración repetible para la versión inicial de Productos. */
USE mi_proyecto;
GO
IF COL_LENGTH(N'dbo.Productos', N'Codigo') IS NULL
BEGIN
    ALTER TABLE dbo.Productos ADD Codigo NVARCHAR(40) NULL;
    UPDATE dbo.Productos SET Codigo = CONCAT(N'RAD-', Id) WHERE Codigo IS NULL;
    ALTER TABLE dbo.Productos ALTER COLUMN Codigo NVARCHAR(40) NOT NULL;
    ALTER TABLE dbo.Productos ADD CONSTRAINT DF_Productos_Codigo DEFAULT (N'') FOR Codigo;
END;
GO
IF COL_LENGTH(N'dbo.Productos', N'Marca') IS NULL ALTER TABLE dbo.Productos ADD Marca NVARCHAR(100) NOT NULL CONSTRAINT DF_Productos_Marca DEFAULT (N'Sin marca');
GO
IF COL_LENGTH(N'dbo.Productos', N'Modelo') IS NULL ALTER TABLE dbo.Productos ADD Modelo NVARCHAR(120) NOT NULL CONSTRAINT DF_Productos_Modelo DEFAULT (N'Sin especificar');
GO
IF COL_LENGTH(N'dbo.Productos', N'Vehiculo') IS NULL ALTER TABLE dbo.Productos ADD Vehiculo NVARCHAR(120) NOT NULL CONSTRAINT DF_Productos_Vehiculo DEFAULT (N'Sin especificar');
GO
IF COL_LENGTH(N'dbo.Productos', N'AnioDesde') IS NULL ALTER TABLE dbo.Productos ADD AnioDesde SMALLINT NOT NULL CONSTRAINT DF_Productos_AnioDesde DEFAULT (2000);
GO
IF COL_LENGTH(N'dbo.Productos', N'AnioHasta') IS NULL ALTER TABLE dbo.Productos ADD AnioHasta SMALLINT NOT NULL CONSTRAINT DF_Productos_AnioHasta DEFAULT (2000);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UQ_Productos_Codigo' AND object_id = OBJECT_ID(N'dbo.Productos'))
    ALTER TABLE dbo.Productos ADD CONSTRAINT UQ_Productos_Codigo UNIQUE (Codigo);
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_Productos_RangoAnios')
    ALTER TABLE dbo.Productos ADD CONSTRAINT CK_Productos_RangoAnios CHECK (AnioDesde <= AnioHasta);
GO
