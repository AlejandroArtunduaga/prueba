import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMA = path.join(__dirname, '..', 'db', 'schema.sqlite.sql');
const SEED = path.join(__dirname, '..', 'db', 'seed.sql');

/**
 * Crea una base lista para usar.
 * Por defecto en memoria (ideal para pruebas). Pasa una ruta para persistir.
 */
export function crearDb(filePath: string = ':memory:'): Database.Database {
  if (filePath !== ':memory:') {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(fs.readFileSync(SCHEMA, 'utf8'));
  db.exec(fs.readFileSync(SEED, 'utf8'));
  return db;
}

export type Db = Database.Database;
