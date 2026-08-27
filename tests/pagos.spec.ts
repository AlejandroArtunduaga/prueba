import { crearDb, Db } from '../src/db';
import { PagosService } from '../src/pagos.service';

describe('PagosService', () => {
  let db: Db;
  let service: PagosService;

  beforeEach(() => {
    db = crearDb();
    service = new PagosService(db);
  });

  afterEach(() => db.close());

  // ---------------------------------------------------------------
  // Estas dos pruebas vienen dadas. Deben pasar cuando termines.
  // ---------------------------------------------------------------

  it('aplica un pago y descuenta del saldo de la poliza', () => {
    const r = service.registrarPago({
      polizaId: 'pol-001',
      referenciaExterna: 'REF-AAA-001',
      valorCentavos: 1_000_000,
      canal: 'PSE',
    });

    expect(r.ok).toBe(true);

    const poliza: any = db
      .prepare('SELECT saldo_centavos FROM polizas WHERE id = ?')
      .get('pol-001');

    expect(poliza.saldo_centavos).toBe(49_000_000);
  });

  it('el mismo pago enviado dos veces afecta el saldo una sola vez', () => {
    const dto = {
      polizaId: 'pol-001',
      referenciaExterna: 'REF-BBB-002',
      valorCentavos: 2_500_000,
      canal: 'PSE',
    };

    service.registrarPago(dto);
    service.registrarPago(dto);

    const poliza: any = db
      .prepare('SELECT saldo_centavos FROM polizas WHERE id = ?')
      .get('pol-001');

    const cuantos: any = db
      .prepare('SELECT COUNT(*) AS n FROM pagos WHERE referencia_externa = ?')
      .get('REF-BBB-002');

    expect(poliza.saldo_centavos).toBe(47_500_000);
    expect(cuantos.n).toBe(1);
  });

  it('persiste el periodo en fecha de negocio de Bogota, no la del servidor', () => {
    process.env.TZ = 'UTC';
    jest.useFakeTimers().setSystemTime(new Date('2026-08-16T02:00:00Z'));

    const r = service.registrarPago({
      polizaId: 'pol-001',
      referenciaExterna: 'REF-CCC-003',
      valorCentavos: 500_000,
      canal: 'PSE',
    });

    expect(r.ok).toBe(true);

    const pago: any = db
      .prepare('SELECT periodo FROM pagos WHERE referencia_externa = ?')
      .get('REF-CCC-003');

    expect(pago.periodo).toBe('2026-08-Q1');

    jest.useRealTimers();
  });

  // ---------------------------------------------------------------
  // TODO: agrega al menos una prueba mas, tuya.
  //
  // Sugerencias de casos que nos interesan (escoge o propon otros):
  //   - periodo de corte correcto para un pago cerca de medianoche
  //   - pago sobre una poliza inexistente o cancelada
  //   - pago que dejaria el saldo en negativo
  //   - distribucion a beneficiarios que suma exactamente el valor del pago
  // ---------------------------------------------------------------
});
