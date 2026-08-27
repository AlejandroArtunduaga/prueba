import { crearDb } from '../src/db';
import * as fs from 'fs';

const path = process.env.DB_PATH ?? './data/prueba.db';
if (fs.existsSync(path)) fs.unlinkSync(path);
crearDb(path).close();
console.log(`Base recreada en ${path}`);
