/* Esquema inicial de SQL Server. La API guarda PasswordHash con bcrypt. */
IF DB_ID(N'mi_proyecto') IS NULL CREATE DATABASE mi_proyecto;
GO
USE mi_proyecto;
GO
IF OBJECT_ID(N'dbo.Usuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuarios
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Usuarios PRIMARY KEY,
        Nombre NVARCHAR(120) NOT NULL,
        Email NVARCHAR(254) NOT NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        CreadoEn DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_CreadoEn DEFAULT SYSUTCDATETIME(),
        ActualizadoEn DATETIME2(0) NOT NULL CONSTRAINT DF_Usuarios_ActualizadoEn DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Usuarios_Email UNIQUE (Email)
    );
END;
GO
IF OBJECT_ID(N'dbo.Productos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Productos
    (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Productos PRIMARY KEY,
        Codigo NVARCHAR(40) NOT NULL,
        Nombre NVARCHAR(160) NOT NULL,
        Descripcion NVARCHAR(1000) NULL,
        Marca NVARCHAR(100) NOT NULL,
        Modelo NVARCHAR(120) NOT NULL,
        Vehiculo NVARCHAR(120) NOT NULL,
        AnioDesde SMALLINT NOT NULL,
        AnioHasta SMALLINT NOT NULL,
        Precio DECIMAL(12,2) NOT NULL,
        Stock INT NOT NULL CONSTRAINT DF_Productos_Stock DEFAULT (0),
        CreadoEn DATETIME2(0) NOT NULL CONSTRAINT DF_Productos_CreadoEn DEFAULT SYSUTCDATETIME(),
        ActualizadoEn DATETIME2(0) NOT NULL CONSTRAINT DF_Productos_ActualizadoEn DEFAULT SYSUTCDATETIME(),
        CONSTRAINT UQ_Productos_Codigo UNIQUE (Codigo),
        CONSTRAINT CK_Productos_Precio_NoNegativo CHECK (Precio >= 0),
        CONSTRAINT CK_Productos_Stock_NoNegativo CHECK (Stock >= 0),
        CONSTRAINT CK_Productos_RangoAnios CHECK (AnioDesde <= AnioHasta)
    );
END;
GO
