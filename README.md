# Prueba técnica — Coordinación de Desarrollo

Gracias por el tiempo. Esta prueba está diseñada para tomar **entre 4 y 5 horas**. No es una prueba de resistencia: si te está tomando más, entrega lo que tengas y explica en `ENTREGA.md` qué dejaste fuera y por qué. Eso también nos dice algo útil.

## Cómo se califica

| Parte | Peso |
|---|---|
| 1. Revisión del módulo heredado | 30% |
| 2. Implementación | 20% |
| 3. Decisión y coordinación | 50% |

La parte 3 pesa la mitad porque el rol es de coordinación. La parte 2 existe para confirmar que sigues pudiendo tocar código, no para medir cuánto código escribes.

## Sobre el uso de IA

Puedes usar Claude, Copilot, ChatGPT o lo que uses normalmente. **No es trampa.** Lo único que pedimos es que puedas defender cada decisión en la sesión posterior de pantalla compartida. Si hay algo que generaste y no revisaste a fondo, dilo en `ENTREGA.md` — eso suma, no resta.

---

## Puesta en marcha

```bash
npm install
npm test        # las pruebas fallan: eso es lo esperado al inicio
npm start       # levanta el servidor en http://localhost:3000
```

Requiere Node 20 o superior. La base de datos es SQLite y se crea sola, no hay que instalar nada más.

Si prefieres SQL Server o PostgreSQL, hay un `docker-compose.yml` y los esquemas equivalentes en `db/`. Y si prefieres resolver todo en otro stack (.NET, NestJS, lo que uses), adelante: descarta este esqueleto y deja claro en `ENTREGA.md` cómo se ejecuta lo tuyo.

## Qué hay en cada carpeta

```
legacy/     módulo en producción, para la Parte 1
src/        esqueleto para la Parte 2
tests/      pruebas dadas (hoy fallan) + espacio para las tuyas
pr/         el PR a revisar, para la Parte 3B
db/         esquemas y datos de prueba
docs/       los enunciados detallados de cada parte
ENTREGA.md  aquí van todas tus respuestas escritas
```

## Contexto del dominio

Un sistema de pólizas, pagos y beneficiarios. Un pago se aplica al saldo de una póliza, puede llegar duplicado desde la pasarela, y hay un corte que define a qué periodo pertenece. **Todas las fechas de negocio operan en `America/Bogota`.** Todos los montos van en centavos, en enteros.

---

## Parte 1 — Revisión de módulo heredado (30%)

El archivo `legacy/pagos.service.ts` está hoy en producción. Tiene problemas.

1. Lista los que encuentres. Para cada uno: qué es, qué provoca en producción, cómo lo corregirías.
2. **Priorízalos.** Cuáles desplegarías hoy mismo y cuáles van al backlog. Justifica el corte.
3. Escoge el más grave y corrígelo de verdad, con una prueba que falle antes y pase después.

No buscamos una lista exhaustiva de estilo. Buscamos criterio sobre qué duele y qué no.

## Parte 2 — Implementación (20%)

Implementa `POST /pagos`. El esqueleto está en `src/pagos.service.ts`.

**Requisitos duros:**

- **Idempotencia.** El mismo pago dos veces afecta el saldo una sola vez. Asume que la pasarela reintenta en paralelo, no en secuencia.
- **Zona horaria.** El periodo se calcula sobre la fecha de negocio en `America/Bogota`, sin depender de la zona del servidor.
- **Mínimo 3 pruebas automatizadas.** Dos vienen dadas; agrega al menos una tuya.

El esquema en `db/schema.sqlite.sql` está incompleto a propósito. Decidir qué le falta es parte del ejercicio.

No hagas CRUD completo, ni autenticación, ni frontend.

## Parte 3 — Decisión y coordinación (50%)

Va en `ENTREGA.md`, no en código. El enunciado detallado está en `docs/parte-3.md`.

- **3A.** Nota de decisión técnica sobre un job que no cabe en su ventana (20%)
- **3B.** Escribir el review de un PR de un desarrollador junior (20%)
- **3C.** Priorizar seis frentes que llegan el mismo lunes, en 10 líneas (10%)

---

## Entrega

Repositorio Git con acceso, o un ZIP. Debe incluir `ENTREGA.md` diligenciado.

Después agendamos **45 minutos de pantalla compartida** para revisar tu código en vivo y conversar tus decisiones. Esa sesión pesa tanto como la entrega.
