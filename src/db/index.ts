import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'sqlite.db');

function createDb() {
  const sqlite = new Database(DB_PATH);
  return drizzle(sqlite, { schema });
}

type DbInstance = ReturnType<typeof createDb>;

let _db: DbInstance | null = null;

function getDb(): DbInstance {
  if (!_db) _db = createDb();
  return _db;
}

export const db = new Proxy({} as DbInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
