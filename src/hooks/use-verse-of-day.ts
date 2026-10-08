import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getDailyVerse } from '@/src/db/queries';
import { dayOfYear } from '@/src/utils/format';

export interface VerseOfDay {
  reference: string;
  text: string;
  translation: string;
  chapterId: number;
  verseNumber: number;
  date: Date;
}

export const TRANSLATION_LABEL = 'Bíblia Livre (BLIVRE)';

export { dayOfYear };

/**
 * Versículo do dia: lista curada de 366 versículos que fazem sentido sozinhos
 * (tabela `daily_verses` do bible.db), um por dia do ano. Recarrega ao voltar
 * para a tela, então muda sozinho na virada do dia.
 */
export function useVerseOfDay() {
  const [verse, setVerse] = useState<VerseOfDay | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const now = new Date();
      getDailyVerse(dayOfYear(now))
        .then((row) => {
          if (!active) return;
          setVerse(
            row
              ? {
                  reference: row.reference,
                  text: row.text,
                  translation: TRANSLATION_LABEL,
                  chapterId: row.chapter_id,
                  verseNumber: row.first_verse_id % 1000,
                  date: now,
                }
              : null
          );
        })
        .catch((error) => console.error('Falha ao carregar o versículo do dia', error))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  return { verse, loading };
}
