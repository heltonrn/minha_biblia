import { useEffect, useState } from 'react';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, spacing } from '@/src/constants/theme';
import { getBookById, getChaptersByBook, type BookRow, type ChapterRow } from '@/src/db/queries';

export default function CapitulosScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { width } = useWindowDimensions();
  const [book, setBook] = useState<BookRow | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[] | null>(null);

  // Telas menores (ex.: 320-360dp) ficam apertadas com 5 colunas; 4 respira melhor.
  const numColumns = width < 360 ? 4 : 5;

  // Tamanho fixo calculado a partir da largura da tela. Com `flex: 1`, as
  // células da última linha (incompleta) se esticavam para ocupar a sobra.
  const cellSize = Math.floor((width - spacing.lg * 2) / numColumns) - CELL_MARGIN * 2;

  useEffect(() => {
    const id = Number(bookId);
    setChapters(null);
    getBookById(id).then(setBook);
    getChaptersByBook(id).then(setChapters);
  }, [bookId]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Stack.Screen options={{ title: book?.name ?? '', headerShown: true, headerStyle: { backgroundColor: colors.cream } }} />
      <Text style={styles.sectionLabel}>Capítulos</Text>
      {chapters === null ? (
        <LoadingState />
      ) : (
        <FlatList
          contentContainerStyle={styles.grid}
          data={chapters}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <EmptyState icon="alert-circle" message="Este livro ainda não tem capítulos cadastrados (dado fake da Fase 2/3)." />
          }
          renderItem={({ item }) => (
            <Link href={{ pathname: '/capitulo/[chapterId]', params: { chapterId: String(item.id) } }} asChild>
              <Text
                style={StyleSheet.flatten([styles.cell, { width: cellSize, height: cellSize }])}
                accessibilityRole="button"
                accessibilityLabel={`Capítulo ${item.number}`}
              >
                {item.number}
              </Text>
            </Link>
          )}
        />
      )}
      <AdBanner />
    </SafeAreaView>
  );
}

const CELL_MARGIN = 5;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.lg },
  sectionLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.forestDark, marginVertical: spacing.md },
  grid: { gap: spacing.sm },
  cell: {
    margin: CELL_MARGIN,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
    overflow: 'hidden',
  },
});
