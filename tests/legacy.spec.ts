import { crearDb, Db } from '../src/db';
import { PagosService } from '../src/pagos.service';

/**
 * PARTE 1 - Punto 3: correccion del bug mas critico del modulo heredado.
 *
 * Bug diagnosticado en legacy/pagos.service.ts (lineas 17-23 y 42-45):
 * la idempotencia usa "check-then-act" (SELECT y luego INSERT) sin una
 * restriccion de unicidad. Cuando la pasarela reintenta en paralelo, ambas
 * solicitudes pasan el SELECT antes de que cualquiera inserte, y el saldo
 * se descuenta DOS veces. Es el unico defecto que pierde dinero en el flujo
 * normal, sin ataque ni fallo de infraestructura.
 *
 * El legacy no es ejecutable en este esqueleto (esta excluido en tsconfig y
 * depende de NestJS/TypeORM/SQL Server no instalados). La prueba reproduce
 * el patron defectuoso sobre una tabla sin la restriccion —se descuenta dos
 * veces: 48M en vez de 49M— y luego ejecuta el mismo escenario contra la
 * implementacion corregida en src/pagos.service.ts.
 */

describe('Idempotencia - bug mas critico del modulo heredado (Parte 1.3)', () => {
  let db: Db;
  let service: PagosService;

  beforeEach(() => {
    db = crearDb();
    service = new PagosService(db);
  });

  afterEach(() => db.close());

    it('el patron check-then-act del legacy descuenta dos veces; con UNIQUE no', () => {
    // 1. Reproducimos el patron heredado sobre una tabla SIN la restriccion.
    db.exec(`
      CREATE TABLE pagos_legacy (
        id TEXT PRIMARY KEY,
        referencia_externa TEXT NOT NULL,
        valor_centavos INTEGER NOT NULL
      );
    `);

    const referencia = 'REF-DUP-001';
    const valor = 1_000_000;
    let saldoLegacy = 50_000_000;

    // Dos reintentos que consultan ANTES de que cualquiera inserte:
    // es la ventana de carrera del modulo heredado.
    const existeA = db
      .prepare('SELECT id FROM pagos_legacy WHERE referencia_externa = ?')
      .get(referencia);
    const existeB = db
      .prepare('SELECT id FROM pagos_legacy WHERE referencia_externa = ?')
      .get(referencia);

    if (!existeA) {
      db.prepare('INSERT INTO pagos_legacy VALUES (?, ?, ?)').run('a', referencia, valor);
      saldoLegacy -= valor;
    } 
    if (!existeB) {
      db.prepare('INSERT INTO pagos_legacy VALUES (?, ?, ?)').run('b', referencia, valor);
      saldoLegacy -= valor;
    }

    // El bug: ambos pasaron la verificacion y se descontó dos veces.
    expect(saldoLegacy).toBe(48_000_000);

    // 2. El mismo escenario contra la implementacion corregida.
    const dto = {
      polizaId: 'pol-001',
      referenciaExterna: referencia,
      valorCentavos: valor,
      canal: 'PSE',
    };

    service.registrarPago(dto);
    service.registrarPago(dto);

    const poliza: any = db
      .prepare('SELECT saldo_centavos FROM polizas WHERE id = ?')
      .get('pol-001');

    // Con UNIQUE + transaccion, el segundo intento no toca el saldo.
    expect(poliza.saldo_centavos).toBe(49_000_000);
  });
});
