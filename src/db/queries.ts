import { getDb } from './client';

export interface BookRow {
  id: number;
  code: string;
  name: string;
  testament: 'AT' | 'NT';
  sort_order: number;
  chapter_count: number;
}

export interface ChapterRow {
  id: number;
  book_id: number;
  number: number;
}

export interface ChapterWithBook {
  id: number;
  number: number;
  book_id: number;
  book_name: string;
}

export interface VerseRow {
  id: number;
  chapter_id: number;
  number: number;
  text: string;
  /** Título que a fonte junta ao versículo (ex.: "Salmo de Davi"). */
  heading: string | null;
}

export async function getBooks(): Promise<BookRow[]> {
  const db = await getDb();
  return db.getAllAsync<BookRow>('SELECT * FROM books ORDER BY sort_order');
}

export async function getBookById(bookId: number): Promise<BookRow | null> {
  const db = await getDb();
  return db.getFirstAsync<BookRow>('SELECT * FROM books WHERE id = ?', bookId);
}

export async function getChaptersByBook(bookId: number): Promise<ChapterRow[]> {
  const db = await getDb();
  return db.getAllAsync<ChapterRow>('SELECT * FROM chapters WHERE book_id = ? ORDER BY number', bookId);
}

export async function getChapterWithBook(chapterId: number): Promise<ChapterWithBook | null> {
  const db = await getDb();
  return db.getFirstAsync<ChapterWithBook>(
    `SELECT c.id, c.number, c.book_id, b.name as book_name
     FROM chapters c JOIN books b ON b.id = c.book_id
     WHERE c.id = ?`,
    chapterId
  );
}

export interface ChapterLink {
  id: number;
  number: number;
  book_name: string;
}

/** Capítulo anterior/seguinte na ordem da Bíblia (atravessa livros). */
export async function getAdjacentChapters(
  chapterId: number
): Promise<{ prev: ChapterLink | null; next: ChapterLink | null }> {
  const db = await getDb();
  const base = `SELECT c.id, c.number, b.name as book_name FROM chapters c JOIN books b ON b.id = c.book_id`;
  const [prev, next] = await Promise.all([
    db.getFirstAsync<ChapterLink>(`${base} WHERE c.id < ? ORDER BY c.id DESC LIMIT 1`, chapterId),
    db.getFirstAsync<ChapterLink>(`${base} WHERE c.id > ? ORDER BY c.id ASC LIMIT 1`, chapterId),
  ]);
  return { prev, next };
}

export async function getVersesByChapter(chapterId: number): Promise<VerseRow[]> {
  const db = await getDb();
  return db.getAllAsync<VerseRow>(
    'SELECT id, chapter_id, number, text, heading FROM verses WHERE chapter_id = ? ORDER BY number',
    chapterId
  );
}

export interface SearchResultRow extends VerseRow {
  book_name: string;
  chapter_number: number;
}

const ACCENT_MAP: Record<string, string> = {
  á: 'a', à: 'a', â: 'a', ã: 'a', ä: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', õ: 'o', ö: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ç: 'c', ñ: 'n',
};

/**
 * Mesma normalização usada para gerar `verses.text_norm` no bible.db:
 * minúsculas, sem acentos e sem colchetes. Feita à mão (sem
 * String.prototype.normalize) para não depender do suporte do Hermes.
 */
export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\[\]]/g, '')
    .replace(/[áàâãäéèêëíìîïóòôõöúùûüçñ]/g, (ch) => ACCENT_MAP[ch] ?? ch)
    .trim();
}

export async function searchVerses(term: string): Promise<SearchResultRow[]> {
  const db = await getDb();
  const like = `%${normalizeForSearch(term)}%`;
  return db.getAllAsync<SearchResultRow>(
    `SELECT v.id, v.chapter_id, v.number, v.text, v.heading, b.name as book_name, c.number as chapter_number
     FROM verses v
     JOIN chapters c ON c.id = v.chapter_id
     JOIN books b ON b.id = c.book_id
     WHERE v.text_norm LIKE ?
     ORDER BY b.sort_order, c.number, v.number
     LIMIT 20`,
    like
  );
}

export interface FavoriteRow {
  id: number;
  verse_id: number;
  note: string | null;
  created_at: string;
}

export interface FavoriteWithVerse extends FavoriteRow {
  verse_number: number;
  chapter_number: number;
  chapter_id: number;
  book_name: string;
  text: string;
}

export async function getFavoritesWithVerses(): Promise<FavoriteWithVerse[]> {
  const db = await getDb();
  return db.getAllAsync<FavoriteWithVerse>(`
    SELECT
      f.id, f.verse_id, f.note, f.created_at,
      v.number as verse_number, v.text, v.chapter_id,
      c.number as chapter_number,
      b.name as book_name
    FROM favorites f
    JOIN verses v ON v.id = f.verse_id
    JOIN chapters c ON c.id = v.chapter_id
    JOIN books b ON b.id = c.book_id
    ORDER BY f.created_at DESC
  `);
}

export async function getFavoriteIdByVerse(verseId: number): Promise<number | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ id: number }>('SELECT id FROM favorites WHERE verse_id = ?', verseId);
  return row?.id ?? null;
}

export async function getFavoritedVerseIdsForChapter(chapterId: number): Promise<number[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ verse_id: number }>(
    `SELECT f.verse_id FROM favorites f JOIN verses v ON v.id = f.verse_id WHERE v.chapter_id = ?`,
    chapterId
  );
  return rows.map((r) => r.verse_id);
}

export async function addFavorite(verseId: number, note?: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT INTO favorites (verse_id, note) VALUES (?, ?)', verseId, note ?? null);
}

export async function removeFavorite(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM favorites WHERE id = ?', id);
}

export async function updateFavoriteNote(id: number, note: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE favorites SET note = ? WHERE id = ?', note, id);
}

export interface ReadingPlanRow {
  id: number;
  name: string;
  description: string;
  duration_days: number;
  /** null = plano ainda não iniciado. */
  started_at: string | null;
  completed_days: number;
}

const READING_PLANS_QUERY = `
  SELECT
    p.id,
    p.name,
    p.description,
    p.duration_days,
    s.started_at,
    (SELECT COUNT(*) FROM plan_progress pp WHERE pp.plan_id = p.id) AS completed_days
  FROM plans p
  LEFT JOIN plan_state s ON s.plan_id = p.id
`;

export async function getReadingPlans(): Promise<ReadingPlanRow[]> {
  const db = await getDb();
  return db.getAllAsync<ReadingPlanRow>(`${READING_PLANS_QUERY} ORDER BY p.id`);
}

export async function getReadingPlanById(planId: number): Promise<ReadingPlanRow | null> {
  const db = await getDb();
  return db.getFirstAsync<ReadingPlanRow>(`${READING_PLANS_QUERY} WHERE p.id = ?`, planId);
}

export interface PlanReadingRow {
  seq: number;
  chapter_id: number;
  chapter_number: number;
  book_id: number;
  book_name: string;
}

/** Capítulos previstos para um dia do plano, em ordem. */
export async function getPlanDayReadings(planId: number, day: number): Promise<PlanReadingRow[]> {
  const db = await getDb();
  return db.getAllAsync<PlanReadingRow>(
    `SELECT pr.seq, c.id as chapter_id, c.number as chapter_number, b.id as book_id, b.name as book_name
     FROM plan_readings pr
     JOIN chapters c ON c.id = pr.chapter_id
     JOIN books b ON b.id = c.book_id
     WHERE pr.plan_id = ? AND pr.day = ?
     ORDER BY pr.seq`,
    planId,
    day
  );
}

/** Inicia (ou reinicia) o plano: zera o progresso e marca a data de início. */
export async function startPlan(planId: number): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM plan_progress WHERE plan_id = ?', planId);
    await db.runAsync(
      `INSERT INTO plan_state (plan_id, started_at) VALUES (?, datetime('now'))
       ON CONFLICT(plan_id) DO UPDATE SET started_at = excluded.started_at`,
      planId
    );
  });
}

/** Sai do plano: volta ao estado "não iniciado". */
export async function leavePlan(planId: number): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM plan_progress WHERE plan_id = ?', planId);
    await db.runAsync('DELETE FROM plan_state WHERE plan_id = ?', planId);
  });
}

export async function markDayCompleted(planId: number, day: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('INSERT OR IGNORE INTO plan_progress (plan_id, day) VALUES (?, ?)', planId, day);
}

export interface DailyVerseRow {
  day: number;
  first_verse_id: number;
  chapter_id: number;
  reference: string;
  text: string;
}

/** Versículo do dia (lista curada no bible.db), por dia do ano (1–366). */
export async function getDailyVerse(dayOfYear: number): Promise<DailyVerseRow | null> {
  const db = await getDb();
  return db.getFirstAsync<DailyVerseRow>('SELECT * FROM daily_verses WHERE day = ?', dayOfYear);
}

/** Metadados do texto bíblico (atribuição, licença, versão da fonte). */
export async function getBibleMeta(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM bible.meta');
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export interface LastReading {
  chapter_id: number;
  chapter_number: number;
  book_name: string;
  verse_number: number;
}

const KEY_LAST_CHAPTER = 'last_chapter_id';
const KEY_LAST_VERSE = 'last_verse_number';

export async function saveLastReading(chapterId: number, verseNumber: number): Promise<void> {
  await setSetting(KEY_LAST_CHAPTER, String(chapterId));
  await setSetting(KEY_LAST_VERSE, String(verseNumber));
}

export async function getLastReading(): Promise<LastReading | null> {
  const [chapterId, verse] = await Promise.all([getSetting(KEY_LAST_CHAPTER), getSetting(KEY_LAST_VERSE)]);
  if (!chapterId) return null;
  const chapter = await getChapterWithBook(Number(chapterId));
  if (!chapter) return null;
  return {
    chapter_id: chapter.id,
    chapter_number: chapter.number,
    book_name: chapter.book_name,
    verse_number: verse ? Number(verse) : 1,
  };
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value
  );
}
