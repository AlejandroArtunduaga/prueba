INSERT INTO polizas (id, numero, titular, saldo_centavos, estado, creado_en) VALUES
  ('pol-001', 'POL-2026-0001', 'Ana Restrepo',   50000000, 'ACTIVA',   '2026-01-15T10:00:00-05:00'),
  ('pol-002', 'POL-2026-0002', 'Carlos Mejia',   12500000, 'ACTIVA',   '2026-02-01T09:30:00-05:00'),
  ('pol-003', 'POL-2026-0003', 'Lucia Ortega',          0, 'CANCELADA','2026-03-20T14:00:00-05:00');

INSERT INTO beneficiarios (id, poliza_id, nombre, documento, porcentaje, activo) VALUES
  ('ben-001', 'pol-001', 'Pedro Restrepo', '1020304050', 60, 1),
  ('ben-002', 'pol-001', 'Sara Restrepo',  '1020304051', 40, 1),
  ('ben-003', 'pol-002', 'Marta Mejia',    '1020304052', 100, 1),
  ('ben-004', 'pol-002', 'Jose Mejia',     '1020304053', 0,  0);

INSERT INTO cuentas_beneficiario (id, beneficiario_id, acumulado_centavos) VALUES
  ('cta-001', 'ben-001', 0),
  ('cta-002', 'ben-002', 0),
  ('cta-003', 'ben-003', 0),
  ('cta-004', 'ben-004', 0);
