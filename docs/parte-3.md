# Parte 3 — Decisión y coordinación (50%)

Todo lo de esta parte se responde en `ENTREGA.md`.

---

## 3A. Nota de decisión técnica (20%) — máximo 1 página

**Situación.** Hay un job nocturno que valida 50.000 documentos contra reglas de negocio y un modelo de IA. Hoy tarda 6 horas y la ventana disponible es de 5. Ya falló dos veces este mes.

El equipo propone tres caminos:

1. Paralelizar el job en varios workers.
2. Cachear las validaciones de documentos que no cambiaron desde el último corte.
3. Cambiar a un modelo más pequeño y barato, asumiendo algo de pérdida de precisión.

Tienes **3 sprints y 2 ingenieros**. No puedes hacer los tres.

**Escribe:**

- Qué haces y en qué orden.
- Qué descartaste y por qué.
- Cómo sabes a los 15 días si funcionó. Métrica concreta, con número.
- Cuál es el riesgo principal de tu decisión y cuál es tu plan B.

---

## 3B. Review de un PR (20%)

En `pr/README-pr.md` está un PR abierto por un desarrollador junior del equipo, con su código y la descripción que él mismo escribió.

**Escribe el comentario de review tal cual lo dejarías en Bitbucket.** No una lista de hallazgos dirigida a nosotros: el texto real que esa persona va a leer mañana.

Sé explícito en qué bloquea el merge y qué es sugerencia opcional.

---

## 3C. Priorización (10%)

Llega esto a tu bandeja el mismo lunes:

1. Bug en producción: algunos pagos se duplican, sin dato aún de cuántos.
2. Un cliente grande pide un reporte nuevo para el viernes.
3. La deuda técnica del módulo de la Parte 1 ya frenó dos features.
4. Un ingeniero del equipo lleva tres sprints sin cerrar sus tareas a tiempo.
5. Auditoría pide evidencia de trazabilidad de despliegues para dentro de dos semanas.
6. Está pendiente hace meses decidir si se migra de SQL Server a PostgreSQL.

En **máximo 10 líneas**: qué haces tú el lunes, qué delegas, qué aplazas y qué dices que no. Sin explicaciones largas.


