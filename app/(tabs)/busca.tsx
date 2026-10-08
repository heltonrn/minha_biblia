import { useState } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, spacing } from '@/src/constants/theme';
import { searchVerses, type SearchResultRow } from '@/src/db/queries';

export default function BuscaScreen() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SearchResultRow[] | null>(null);
  const [searching, setSearching] = useState(false);

  const runSearch = async () => {
    if (!term.trim()) {
      setResults(null);
      return;
    }
    setSearching(true);
    setResults(await searchVerses(term.trim()));
    setSearching(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Busca</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.body}
        data={searching ? [] : results ?? []}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={colors.inkSoft} />
            <TextInput
              placeholder='ex.: "esperança"'
              placeholderTextColor={colors.inkSoft}
              style={styles.input}
              value={term}
              onChangeText={setTerm}
              onSubmitEditing={runSearch}
              returnKeyType="search"
              accessibilityLabel="Buscar por palavra ou referência"
            />
          </View>
        }
        ListEmptyComponent={
          searching ? (
            <LoadingState label="Buscando..." />
          ) : results !== null ? (
            <EmptyState icon="search" message={`Nenhum resultado para "${term}".`} />
          ) : null
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/capitulo/[chapterId]', params: { chapterId: String(item.chapter_id) } }} asChild>
            <Card>
              <Text style={styles.reference}>{item.book_name} {item.chapter_number}:{item.number}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </Card>
          </Link>
        )}
      />
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.forestDark },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  input: { flex: 1, fontSize: 14, color: colors.ink, minHeight: 24 },
  reference: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.forestDark, marginBottom: 4 },
  text: { fontSize: 13.5, lineHeight: 20, color: colors.ink },
});
