import express from 'express';
import { crearDb } from './db';
import { PagosService } from './pagos.service';

const PORT = Number(process.env.PORT ?? 3000);
const DB_PATH = process.env.DB_PATH ?? './data/prueba.db';

const db = crearDb(DB_PATH);
const pagos = new PagosService(db);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/pagos', (req, res) => {
  try {
    const resultado = pagos.registrarPago(req.body);

    if (!resultado.ok) {
      // La peticion esta bien formada, pero una regla de negocio la rechaza.
      return res.status(422).json(resultado);
    }

    // El reintento no crea nada nuevo: devuelve el pago original con 200,
    // no 409. Un error haria que la pasarela lo interprete como fallo y
    // siguiera reintentando.
    return res.status(resultado.duplicado ? 200 : 201).json(resultado);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Escuchando en http://localhost:${PORT}`);
});
