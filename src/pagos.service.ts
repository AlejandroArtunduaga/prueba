import { Db } from './db';
import { DateTime } from 'luxon';
import { randomUUID } from 'crypto';

export interface RegistrarPagoDto {
  polizaId: string;
  referenciaExterna: string;
  valorCentavos: number;
  canal: string;
}

export interface ResultadoPago {
  ok: boolean;
  pagoId?: string;
  duplicado?: boolean;
  saldoCentavos?: number;
  mensaje?: string;
}

/**
 * PARTE 2 DE LA PRUEBA.
 *
 * Implementa el registro de un pago cumpliendo:
 *
 *  1. IDEMPOTENCIA
 *     Si llega dos veces el mismo pago (mismo `referenciaExterna`), el saldo
 *     se afecta UNA sola vez y la segunda llamada responde de forma
 *     consistente con la primera. Piensa que la pasarela reintenta en
 *     paralelo, no en secuencia.
 *
 *  3. DINERO
 *     Todos los montos van en centavos, en enteros. No uses float.
 *
 * Puedes cambiar el esquema en db/schema.sqlite.sql si tu solucion lo
 * necesita. Si lo haces, dilo en ENTREGA.md.
 *
 * Tambien puedes descartar este archivo y resolverlo en otro stack
 * (.NET, NestJS con SQL Server, etc). Solo deja claro como se ejecuta.
 */

export class PagosService {
  constructor(private readonly db: Db) {}

  registrarPago(dto: RegistrarPagoDto): ResultadoPago {
    if (!Number.isInteger(dto.valorCentavos) || dto.valorCentavos <= 0) {
      return { ok: false, mensaje: 'El valor debe ser un entero positivo en centavos' };
    }

    try {
      return this.aplicarPago(dto);
    } catch (e: any) {
      // La restriccion UNIQUE(referencia_externa) es la que garantiza la
      // idempotencia. Si dos reintentos de la pasarela llegan a la vez, solo
      // un INSERT prospera; el otro cae aqui.
      if (e?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return this.respuestaDePagoYaRegistrado(dto.referenciaExterna);
      }
      throw e;
    }
  }

  /**
   * El INSERT va  para que la restriccion UNIQUE pueda
   * frenar al duplicado antes de tocar el saldo.
   */
  private aplicarPago(dto: RegistrarPagoDto): ResultadoPago {
    const tx = this.db.transaction((d: RegistrarPagoDto): ResultadoPago => {
      const poliza: any = this.db
        .prepare('SELECT id, saldo_centavos, estado FROM polizas WHERE id = ?')
        .get(d.polizaId);

      if (!poliza) {
        return { ok: false, mensaje: 'Poliza no encontrada' };
      }

      if (poliza.estado !== 'ACTIVA') {
        return { ok: false, mensaje: `Poliza en estado ${poliza.estado}: no admite pagos` };
      }

      const pagoId = randomUUID();
      const periodo = this.calcularPeriodoCorte(new Date());

      this.db
        .prepare(
          `INSERT INTO pagos (id, poliza_id, referencia_externa, valor_centavos, canal, periodo, creado_en)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(pagoId, d.polizaId, d.referenciaExterna, d.valorCentavos, d.canal, periodo, new Date().toISOString());

      // Aritmetica entera: ambos operandos son enteros en centavos.
      const saldoCentavos = poliza.saldo_centavos - d.valorCentavos;

      this.db
        .prepare('UPDATE polizas SET saldo_centavos = ? WHERE id = ?')
        .run(saldoCentavos, d.polizaId);

      return { ok: true, pagoId, saldoCentavos, duplicado: false };
    });

    return tx(dto);
  }

  private respuestaDePagoYaRegistrado(referenciaExterna: string): ResultadoPago {
    const pago: any = this.db
      .prepare('SELECT id, poliza_id FROM pagos WHERE referencia_externa = ?')
      .get(referenciaExterna);

    const poliza: any = this.db
      .prepare('SELECT saldo_centavos FROM polizas WHERE id = ?')
      .get(pago.poliza_id);

    return {
      ok: true,
      duplicado: true,
      pagoId: pago.id,
      saldoCentavos: poliza.saldo_centavos,
    };
  }
  

  calcularPeriodoCorte(instante: Date): string {
    // Convertimos el instante a la fecha de negocio en Bogota.
    // La zona horaria del servidor no interviene: la fijamos explicitamente.
    const enBogota = DateTime.fromJSDate(instante).setZone('America/Bogota');

    const corte = enBogota.day <= 15 ? 'Q1' : 'Q2';

    return `${enBogota.toFormat('yyyy-MM')}-${corte}`;
  }
}
