import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, spacing } from '@/src/constants/theme';
import { getBooks, type BookRow } from '@/src/db/queries';

export default function LeituraScreen() {
  const [books, setBooks] = useState<BookRow[] | null>(null);
  const [testament, setTestament] = useState<'AT' | 'NT'>('AT');

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  const filtered = books?.filter((b) => b.testament === testament) ?? [];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Leitura</Text>
      </View>

      {books === null ? (
        <LoadingState />
      ) : (
        <FlatList
          contentContainerStyle={styles.body}
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <View style={styles.filters}>
              <Pressable
                onPress={() => setTestament('AT')}
                accessibilityRole="button"
                accessibilityState={{ selected: testament === 'AT' }}
                hitSlop={6}
              >
                <Chip label="Antigo Testamento" active={testament === 'AT'} />
              </Pressable>
              <Pressable
                onPress={() => setTestament('NT')}
                accessibilityRole="button"
                accessibilityState={{ selected: testament === 'NT' }}
                hitSlop={6}
              >
                <Chip label="Novo Testamento" active={testament === 'NT'} />
              </Pressable>
            </View>
          }
          ListEmptyComponent={<EmptyState icon="book-open" message="Nenhum livro cadastrado nesta seção ainda." />}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/livro/[bookId]', params: { bookId: String(item.id) } }} asChild>
              <Card style={styles.rowCard}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
                <View style={styles.rowRight}>
                  <Text style={styles.rowSub}>{item.chapter_count} caps.</Text>
                  <Feather name="chevron-right" size={16} color={colors.inkSoft} />
                </View>
              </Card>
            </Link>
          )}
        />
      )}
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.forestDark },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  filters: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  rowTitle: { flex: 1, fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 0 },
  rowSub: { fontSize: 12, color: colors.inkSoft },
});
