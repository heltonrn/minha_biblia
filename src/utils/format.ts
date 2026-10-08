const WEEKDAYS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** "quinta-feira, 1 de outubro" — sem depender do Intl do Hermes. */
export function formatLongDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

/**
 * Agrupa capítulos consecutivos do mesmo livro: [Gn 1, Gn 2, Gn 3, Êx 1]
 * → "Gênesis 1–3; Êxodo 1".
 */
export function summarizeChapters(items: { book_id: number; book_name: string; chapter_number: number }[]): string {
  const parts: string[] = [];
  let i = 0;
  while (i < items.length) {
    let j = i;
    while (
      j + 1 < items.length &&
      items[j + 1].book_id === items[i].book_id &&
      items[j + 1].chapter_number === items[j].chapter_number + 1
    ) {
      j++;
    }
    const first = items[i];
    const last = items[j];
    parts.push(
      first === last
        ? `${first.book_name} ${first.chapter_number}`
        : `${first.book_name} ${first.chapter_number}–${last.chapter_number}`
    );
    i = j + 1;
  }
  return parts.join('; ');
}

/** Dia do ano no fuso do aparelho: 1 de janeiro = 1 … 31 de dezembro = 365/366. */
export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((today.getTime() - start.getTime()) / 86_400_000) + 1;
}
