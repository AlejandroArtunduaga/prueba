import { crearDb, Db } from '../src/db';
import { PagosService } from '../src/pagos.service';

/**
 * Esta prueba viene dada y hoy FALLA.
 *
 * Corre con el proceso en UTC a proposito (ver el TZ de abajo):
 * si tu implementacion usa la hora del servidor, no va a pasar.
 */
describe('periodo de corte en America/Bogota', () => {
  let db: Db;
  let service: PagosService;

  beforeAll(() => {
    process.env.TZ = 'UTC';
  });

  beforeEach(() => {
    db = crearDb();
    service = new PagosService(db);
  });

  afterEach(() => db.close());

  it('un pago del 16 a las 02:00 UTC todavia es del dia 15 en Bogota', () => {
    // 2026-08-16T02:00:00Z  ==  2026-08-15T21:00:00-05:00
    const instante = new Date('2026-08-16T02:00:00Z');
    expect(service.calcularPeriodoCorte(instante)).toBe('2026-08-Q1');
  });

  it('un pago del 15 a las 22:00 UTC sigue siendo del 15 en Bogota', () => {
    // 2026-08-15T22:00:00Z  ==  2026-08-15T17:00:00-05:00
    const instante = new Date('2026-08-15T22:00:00Z');
    expect(service.calcularPeriodoCorte(instante)).toBe('2026-08-Q1');
  });

  it('el dia 16 en Bogota cae en Q2', () => {
    const instante = new Date('2026-08-16T15:00:00Z');
    expect(service.calcularPeriodoCorte(instante)).toBe('2026-08-Q2');
  });
});
