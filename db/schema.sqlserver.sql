-- Equivalente en SQL Server, por si prefieres levantar el contenedor
-- de docker-compose.yml en vez de usar SQLite.

IF OBJECT_ID('cuentas_beneficiario', 'U') IS NOT NULL DROP TABLE cuentas_beneficiario;
IF OBJECT_ID('beneficiarios', 'U') IS NOT NULL DROP TABLE beneficiarios;
IF OBJECT_ID('pagos', 'U') IS NOT NULL DROP TABLE pagos;
IF OBJECT_ID('polizas', 'U') IS NOT NULL DROP TABLE polizas;

CREATE TABLE polizas (
  id             UNIQUEIDENTIFIER PRIMARY KEY,
  numero         NVARCHAR(50) NOT NULL,
  titular        NVARCHAR(200) NOT NULL,
  saldo_centavos BIGINT NOT NULL,
  estado         NVARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  creado_en      DATETIME2 NOT NULL
);

CREATE TABLE pagos (
  id                 UNIQUEIDENTIFIER PRIMARY KEY,
  poliza_id          UNIQUEIDENTIFIER NOT NULL REFERENCES polizas(id),
  referencia_externa NVARCHAR(100) NOT NULL UNIQUE, -- Modificado (Se agrega UNIQUE)
  valor_centavos     BIGINT NOT NULL CHECK (valor_centavos > 0),   -- Modificado: Se agrega (CHECK (valor_centavos > 0))
  canal              NVARCHAR(50) NOT NULL,
  periodo            NVARCHAR(20) NOT NULL,
  creado_en          DATETIME2 NOT NULL
);

-- NOTA: el modelo de datos esta incompleto a proposito.

CREATE TABLE beneficiarios (
  id         UNIQUEIDENTIFIER PRIMARY KEY,
  poliza_id  UNIQUEIDENTIFIER NOT NULL REFERENCES polizas(id),
  nombre     NVARCHAR(200) NOT NULL,
  documento  NVARCHAR(50) NOT NULL,
  porcentaje INT NOT NULL,
  activo     BIT NOT NULL DEFAULT 1
);

CREATE TABLE cuentas_beneficiario (
  id                 UNIQUEIDENTIFIER PRIMARY KEY,
  beneficiario_id    UNIQUEIDENTIFIER NOT NULL REFERENCES beneficiarios(id),
  acumulado_centavos BIGINT NOT NULL DEFAULT 0
);
