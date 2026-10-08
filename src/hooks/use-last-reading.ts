import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getLastReading, type LastReading } from '@/src/db/queries';

/** Último capítulo/versículo lido (gravado pela tela do capítulo). */
export function useLastReading() {
  const [lastReading, setLastReading] = useState<LastReading | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getLastReading()
        .then((row) => active && setLastReading(row))
        .catch((error) => console.error('Falha ao carregar a última leitura', error))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, [])
  );

  return { lastReading, loading };
}
