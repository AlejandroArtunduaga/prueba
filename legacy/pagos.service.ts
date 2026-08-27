import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

// Módulo heredado. En producción desde 2023.
// Procesa pagos de pólizas y distribuye a beneficiarios.

@Injectable()
export class PagosService {
  constructor(private readonly ds: DataSource) {}

  async registrarPago(dto: {
    polizaId: string;
    referenciaExterna: string;
    valor: number;
    canal: string;
  }) {
    const existente = await this.ds.query(
      `SELECT id FROM pagos WHERE referencia_externa = '${dto.referenciaExterna}'`,
    );

    if (existente.length > 0) {
      return { ok: true, duplicado: true };
    }

    const poliza = await this.ds.query(
      `SELECT id, saldo, estado FROM polizas WHERE id = '${dto.polizaId}'`,
    );

    if (poliza.length === 0) {
      return { ok: false, mensaje: 'Poliza no encontrada' };
    }

    let saldo: number = parseFloat(poliza[0].saldo);
    saldo = saldo - dto.valor;

    await this.ds.query(
      `UPDATE polizas SET saldo = ${saldo} WHERE id = '${dto.polizaId}'`,
    );

    const periodo = this.calcularPeriodoCorte();

    await this.ds.query(
      `INSERT INTO pagos (poliza_id, referencia_externa, valor, canal, periodo, creado_en)
       VALUES ('${dto.polizaId}', '${dto.referenciaExterna}', ${dto.valor}, '${dto.canal}', '${periodo}', GETDATE())`,
    );

    try {
      await this.distribuirABeneficiarios(dto.polizaId, dto.valor);
    } catch (e) {
      // los beneficiarios se pueden reprocesar despues
    }

    return { ok: true, saldoNuevo: saldo };
  }

  private calcularPeriodoCorte(): string {
    const ahora = new Date();
    const dia = ahora.getDate();

    // el corte del periodo es el dia 15
    if (dia <= 15) {
      return `${ahora.getFullYear()}-${ahora.getMonth() + 1}-Q1`;
    }
    return `${ahora.getFullYear()}-${ahora.getMonth() + 1}-Q2`;
  }

  private async distribuirABeneficiarios(polizaId: string, valor: number) {
    const beneficiarios = await this.ds.query(
      `SELECT id, porcentaje FROM beneficiarios WHERE poliza_id = '${polizaId}'`,
    );

    for (const b of beneficiarios) {
      const cuenta = await this.ds.query(
        `SELECT id, acumulado FROM cuentas_beneficiario WHERE beneficiario_id = '${b.id}'`,
      );

      const monto = valor * (b.porcentaje / 100);
      const nuevo = parseFloat(cuenta[0].acumulado) + monto;

      await this.ds.query(
        `UPDATE cuentas_beneficiario SET acumulado = ${nuevo} WHERE id = '${cuenta[0].id}'`,
      );
    }
  }

  async listarPagosDelPeriodo(polizaId: string, desde: string, hasta: string) {
    return this.ds.query(
      `SELECT * FROM pagos
       WHERE poliza_id = '${polizaId}'
         AND creado_en >= '${desde}' AND creado_en <= '${hasta}'`,
    );
  }
}
