import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  getFavoritesWithVerses,
  addFavorite,
  removeFavorite,
  updateFavoriteNote,
  getFavoriteIdByVerse,
  type FavoriteWithVerse,
} from '@/src/db/queries';

/**
 * Fase 4: favoritos persistidos de verdade no SQLite (tabela `favorites`).
 * Substitui o stub em memória usado até a Fase 3.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteWithVerse[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setFavorites(await getFavoritesWithVerses());
  }, []);

  // A aba Favoritos continua montada ao trocar de aba; recarrega sempre que
  // ela volta a ficar visível, para mostrar o que foi favoritado na leitura.
  useFocusEffect(
    useCallback(() => {
      reload().finally(() => setLoading(false));
    }, [reload])
  );

  const toggleFavorite = useCallback(
    async (verseId: number) => {
      const existingId = await getFavoriteIdByVerse(verseId);
      if (existingId) {
        await removeFavorite(existingId);
      } else {
        await addFavorite(verseId);
      }
      await reload();
    },
    [reload]
  );

  const removeFavoriteById = useCallback(
    async (id: number) => {
      await removeFavorite(id);
      await reload();
    },
    [reload]
  );

  const setNote = useCallback(
    async (id: number, note: string) => {
      await updateFavoriteNote(id, note.trim() ? note.trim() : null);
      await reload();
    },
    [reload]
  );

  return { favorites, loading, toggleFavorite, removeFavoriteById, setNote };
}
