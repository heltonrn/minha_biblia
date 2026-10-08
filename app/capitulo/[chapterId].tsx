import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, radii, spacing } from '@/src/constants/theme';
import {
  getAdjacentChapters,
  getChapterWithBook,
  getVersesByChapter,
  getFavoritedVerseIdsForChapter,
  getFavoriteIdByVerse,
  addFavorite,
  removeFavorite,
  saveLastReading,
  type ChapterLink,
  type ChapterWithBook,
  type VerseRow,
} from '@/src/db/queries';

const SAVE_DELAY_MS = 800;

export default function VersiculosScreen() {
  const { chapterId, verse } = useLocalSearchParams<{ chapterId: string; verse?: string }>();
  const targetVerse = verse ? Number(verse) : null;

  const listRef = useRef<FlatList<VerseRow>>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [chapter, setChapter] = useState<ChapterWithBook | null>(null);
  const [verses, setVerses] = useState<VerseRow[] | null>(null);
  const [favorited, setFavorited] = useState<Set<number>>(new Set());
  const [adjacent, setAdjacent] = useState<{ prev: ChapterLink | null; next: ChapterLink | null }>({
    prev: null,
    next: null,
  });

  useEffect(() => {
    const id = Number(chapterId);
    setVerses(null);
    getChapterWithBook(id).then(setChapter);
    getVersesByChapter(id).then(setVerses);
    getFavoritedVerseIdsForChapter(id).then((ids) => setFavorited(new Set(ids)));
    getAdjacentChapters(id).then(setAdjacent);
    // Abrir o capítulo já conta como leitura (versículo indicado ou o 1º).
    saveLastReading(id, targetVerse ?? 1).catch(() => undefined);
  }, [chapterId, targetVerse]);

  // Leva até o versículo pedido (versículo do dia / continuar leitura).
  useEffect(() => {
    if (!verses || !targetVerse) return;
    const index = verses.findIndex((v) => v.number === targetVerse);
    if (index <= 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.15 });
    }, 50);
    return () => clearTimeout(timer);
  }, [verses, targetVerse]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    []
  );

  // Grava o versículo do topo da tela como ponto de leitura (com atraso, para
  // não escrever no banco a cada pixel de rolagem).
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<VerseRow>[] }) => {
    const top = viewableItems.find((v) => v.isViewable)?.item;
    if (!top) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveLastReading(top.chapter_id, top.number).catch(() => undefined);
    }, SAVE_DELAY_MS);
  }).current;

  const onScrollToIndexFailed = useCallback((info: { index: number; averageItemLength: number }) => {
    listRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: false });
    setTimeout(() => {
      listRef.current?.scrollToIndex({ index: info.index, animated: false, viewPosition: 0.15 });
    }, 100);
  }, []);

  const toggleFavorite = async (verseId: number) => {
    try {
      const existingId = await getFavoriteIdByVerse(verseId);
      if (existingId) {
        await removeFavorite(existingId);
        setFavorited((prev) => {
          const next = new Set(prev);
          next.delete(verseId);
          return next;
        });
      } else {
        await addFavorite(verseId);
        setFavorited((prev) => new Set(prev).add(verseId));
      }
    } catch (error) {
      console.error('Falha ao alternar favorito', error);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: chapter ? `${chapter.book_name} ${chapter.number}` : '',
          headerShown: true,
          headerStyle: { backgroundColor: colors.cream },
        }}
      />
      {verses === null ? (
        <LoadingState />
      ) : (
        <FlatList
          ref={listRef}
          contentContainerStyle={styles.body}
          data={verses}
          // Sem extraData a FlatList não re-renderiza ao mudar `favorited`.
          extraData={favorited}
          keyExtractor={(item) => String(item.id)}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          onScrollToIndexFailed={onScrollToIndexFailed}
          renderItem={({ item }) => {
            const isFav = favorited.has(item.id);
            const isTarget = item.number === targetVerse;
            return (
              <View>
                {item.heading ? <Text style={styles.heading}>{item.heading}</Text> : null}
                <View style={[styles.verseRow, isTarget && styles.verseRowTarget]}>
                  <Text style={styles.number}>{item.number}</Text>
                  <Text style={styles.text}>{item.text}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isFav ? `Remover versículo ${item.number} dos favoritos` : `Favoritar versículo ${item.number}`
                    }
                    hitSlop={12}
                    style={styles.favTouch}
                    onPress={() => toggleFavorite(item.id)}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isFav ? colors.plum : colors.inkSoft}
                    />
                  </Pressable>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <View style={styles.footer}>
              {adjacent.prev ? (
                <Link
                  href={{ pathname: '/capitulo/[chapterId]', params: { chapterId: String(adjacent.prev.id) } }}
                  replace
                  asChild
                >
                  <Pressable accessibilityRole="button" style={styles.navButton}>
                    <Feather name="chevron-left" size={16} color={colors.forestDark} />
                    <Text style={styles.navText} numberOfLines={1}>
                      {adjacent.prev.book_name} {adjacent.prev.number}
                    </Text>
                  </Pressable>
                </Link>
              ) : (
                <View style={styles.navPlaceholder} />
              )}
              {adjacent.next ? (
                <Link
                  href={{ pathname: '/capitulo/[chapterId]', params: { chapterId: String(adjacent.next.id) } }}
                  replace
                  asChild
                >
                  <Pressable accessibilityRole="button" style={styles.navButtonNext}>
                    <Text style={styles.navTextNext} numberOfLines={1}>
                      {adjacent.next.book_name} {adjacent.next.number}
                    </Text>
                    <Feather name="chevron-right" size={16} color={colors.paper} />
                  </Pressable>
                </Link>
              ) : (
                <View style={styles.navPlaceholder} />
              )}
            </View>
          }
        />
      )}
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  body: { padding: spacing.lg },
  heading: {
    fontFamily: fonts.bodyMedium,
    fontStyle: 'italic',
    fontSize: 12.5,
    color: colors.inkSoft,
    marginBottom: spacing.sm,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radii.sm,
  },
  verseRowTarget: {
    backgroundColor: colors.mustardLight,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  number: { fontFamily: fonts.displayBold, color: colors.mustard, fontSize: 13, minWidth: 22, paddingTop: 2 },
  text: { flex: 1, fontSize: 14.5, lineHeight: 23, color: colors.ink },
  favTouch: { padding: spacing.xs },
  footer: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.sm },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.forestLight,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
  },
  navButtonNext: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.forest,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
  },
  navText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.forestDark, flexShrink: 1 },
  navTextNext: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.paper, flexShrink: 1 },
  navPlaceholder: { flex: 1 },
});
