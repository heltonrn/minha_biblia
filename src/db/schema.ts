/**
 * Schema do banco do USUÁRIO (minha-biblia.db): favoritos, progresso dos
 * planos, última leitura e configurações.
 *
 * O conteúdo (texto bíblico, versículos do dia, planos e cronogramas) fica no
 * bible.db, somente leitura, gerado por scripts/build-bible-db.py a partir da
 * Bíblia Livre (BLIVRE, NT Textus Receptus, CC BY 3.0 BR) e anexado como
 * `bible`. As queries usam os nomes das tabelas direto (books, plans...).
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verse_id INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plan_state (
  plan_id INTEGER PRIMARY KEY,
  started_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plan_progress (
  plan_id INTEGER NOT NULL,
  day INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (plan_id, day)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
