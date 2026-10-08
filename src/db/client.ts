import * as SQLite from 'expo-sqlite';
import { SCHEMA_SQL } from './schema';

const USER_DB_NAME = 'minha-biblia.db';
const BIBLE_DB_NAME = 'bible.db';

/**
 * Suba este número sempre que assets/db/bible.db for regerado
 * (scripts/build-bible-db.py): na próxima abertura o app copia o asset novo
 * por cima do antigo. Os dados do usuário ficam intactos (outro arquivo).
 */
const BIBLE_DB_VERSION = '2';

/** Versão do schema do banco do usuário (PRAGMA user_version). */
const USER_SCHEMA_VERSION = 3;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Conexão única com o banco do usuário, com o texto bíblico anexado como
 * `bible` (books, chapters, verses, daily_verses, plans, plan_readings, meta).
 * Guardar a Promise evita abrir o banco duas vezes em chamadas simultâneas.
 */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openDatabase().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(USER_DB_NAME);
  await migrateUserDb(db);
  await db.execAsync(SCHEMA_SQL);
  await attachBibleDb(db);
  return db;
}

async function migrateUserDb(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  // v2: texto bíblico saiu do banco do usuário (agora vem do bible.db).
  // Favoritos/progresso de teste apontavam para IDs fictícios.
  if (current < 2) {
    await db.execAsync(`
      DROP TABLE IF EXISTS verses;
      DROP TABLE IF EXISTS chapters;
      DROP TABLE IF EXISTS books;
      DROP TABLE IF EXISTS favorites;
      DROP TABLE IF EXISTS plan_progress;
    `);
  }

  // v3: planos e cronogramas passaram para o bible.db; o progresso ganhou
  // formato novo (um registro por dia concluído) e o estado "iniciado".
  if (current < 3) {
    await db.execAsync(`
      DROP TABLE IF EXISTS reading_plans;
      DROP TABLE IF EXISTS plan_progress;
    `);
  }

  if (current !== USER_SCHEMA_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${USER_SCHEMA_VERSION}`);
  }
}

async function attachBibleDb(db: SQLite.SQLiteDatabase): Promise<void> {
  const installed = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'bible_db_version'"
  );
  const needsUpdate = installed?.value !== BIBLE_DB_VERSION;

  // Copia o asset para a pasta de bancos do app (só sobrescreve se a versão mudou).
  await SQLite.importDatabaseFromAssetAsync(BIBLE_DB_NAME, {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    assetId: require('@/assets/db/bible.db'),
    forceOverwrite: needsUpdate,
  });

  if (needsUpdate) {
    await db.runAsync(
      `INSERT INTO settings (key, value) VALUES ('bible_db_version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      BIBLE_DB_VERSION
    );
  }

  const bible = await SQLite.openDatabaseAsync(BIBLE_DB_NAME);
  const biblePath = bible.databasePath;
  await bible.closeAsync();

  await db.runAsync('ATTACH DATABASE ? AS bible', biblePath);
}
