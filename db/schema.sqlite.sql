-- Esquema base (SQLite). Es la opcion por defecto: cero instalacion.
-- Puedes modificarlo si tu solucion lo requiere. Si lo haces, dilo en ENTREGA.md.

DROP TABLE IF EXISTS cuentas_beneficiario;
DROP TABLE IF EXISTS beneficiarios;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS polizas;

CREATE TABLE polizas (
  id            TEXT PRIMARY KEY,
  numero        TEXT NOT NULL,
  titular       TEXT NOT NULL,
  saldo_centavos INTEGER NOT NULL,
  estado        TEXT NOT NULL DEFAULT 'ACTIVA',
  creado_en     TEXT NOT NULL
);

CREATE TABLE pagos (
  id                 TEXT PRIMARY KEY,
  poliza_id          TEXT NOT NULL REFERENCES polizas(id),
  referencia_externa TEXT NOT NULL UNIQUE, -- Editado (Aqui garantizamos la idenpotencia por el motor y no por codigo)
  valor_centavos     INTEGER NOT NULL CHECK (valor_centavos > 0), -- Editado (Si llega un valor en 0 o negativo es error)
  canal              TEXT NOT NULL,
  periodo            TEXT NOT NULL,
  creado_en          TEXT NOT NULL
);

CREATE INDEX idx_pagos_poliza ON pagos(poliza_id); --Agregado (Indice para busqueda de piliza)

-- NOTA: el modelo de datos esta incompleto a proposito.
-- Parte de la prueba es decidir que restricciones faltan aqui.

CREATE TABLE beneficiarios (
  id         TEXT PRIMARY KEY,
  poliza_id  TEXT NOT NULL REFERENCES polizas(id),
  nombre     TEXT NOT NULL,
  documento  TEXT NOT NULL,
  porcentaje INTEGER NOT NULL CHECK (porcentaje BETWEEN 0 AND 100), -- Editado (Reglamenta el % entre 0 y 100)
  activo     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE cuentas_beneficiario (
  id                TEXT PRIMARY KEY, 
  beneficiario_id   TEXT NOT NULL UNIQUE REFERENCES beneficiarios(id), -- Editado (Una cuenta por beneficiario evita abono erroneo)
  acumulado_centavos INTEGER NOT NULL DEFAULT 0 CHECK (acumulado_centavos >= 0) -- Editado (Evita acumulado negativo)
);
