# PR #412 — Endpoint de resumen de póliza

**Autor:** desarrollador junior, 8 meses en el equipo
**Rama:** `feature/resumen-poliza`

## Descripción del autor

> Agrego el endpoint que pidió el área comercial para mostrar el resumen de una póliza en el portal. Trae los datos de la póliza, el total pagado y los beneficiarios. Ya lo probé en local con la póliza de pruebas y funciona bien. Lo necesitan para la demo del jueves.

## Código

```typescript
@Controller('polizas')
export class PolizasController {
  constructor(private readonly ds: DataSource) {}

  @Get(':id/resumen')
  async resumen(@Param('id') id: string, @Query('incluirInactivos') inc: string) {
    const poliza = await this.ds.query(
      `SELECT * FROM polizas WHERE id = '${id}'`,
    );

    const pagos = await this.ds.query(
      `SELECT * FROM pagos WHERE poliza_id = '${id}'`,
    );

    let total = 0;
    for (const p of pagos) {
      total = total + p.valor;
    }

    const beneficiarios = await this.ds.query(
      `SELECT * FROM beneficiarios WHERE poliza_id = '${id}'`,
    );

    const detalle = [];
    for (const b of beneficiarios) {
      if (inc === 'true' || b.activo === 1) {
        const cuenta = await this.ds.query(
          `SELECT acumulado FROM cuentas_beneficiario WHERE beneficiario_id = '${b.id}'`,
        );
        detalle.push({
          nombre: b.nombre,
          documento: b.documento,
          porcentaje: b.porcentaje,
          acumulado: cuenta[0].acumulado,
        });
      }
    }

    return {
      poliza: poliza[0],
      totalPagado: total,
      beneficiarios: detalle,
      generadoEn: new Date().toISOString(),
    };
  }
}
```

## Estado

- Sin pruebas.
- Sin cambios en documentación.
- El pipeline pasa (no hay cobertura mínima configurada en este repo).
