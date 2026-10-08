import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, spacing } from '@/src/constants/theme';
import { useFavorites } from '@/src/hooks/use-favorites';

export default function FavoritosScreen() {
  const { favorites, loading, removeFavoriteById, setNote } = useFavorites();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
      </View>

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          contentContainerStyle={styles.body}
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <EmptyState icon="heart" message="Nenhum versículo favoritado ainda. Toque no coração durante a leitura." />
          }
          renderItem={({ item }) => (
            <Card>
              <View style={styles.rowTop}>
                <Text style={styles.reference}>
                  {item.book_name} {item.chapter_number}:{item.verse_number}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remover dos favoritos"
                  hitSlop={12}
                  style={styles.favTouch}
                  onPress={() => removeFavoriteById(item.id)}
                >
                  <Ionicons name="heart" size={18} color={colors.plum} />
                </Pressable>
              </View>
              <Text style={styles.text}>{item.text}</Text>
              <TextInput
                placeholder="Adicionar uma nota..."
                placeholderTextColor={colors.inkSoft}
                defaultValue={item.note ?? ''}
                onEndEditing={(e) => setNote(item.id, e.nativeEvent.text)}
                style={styles.noteInput}
                accessibilityLabel={`Nota para ${item.book_name} ${item.chapter_number}:${item.verse_number}`}
              />
            </Card>
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
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  reference: { flex: 1, fontFamily: fonts.displayBold, fontSize: 13, color: colors.forestDark },
  favTouch: { padding: spacing.xs },
  text: { fontSize: 13.5, lineHeight: 20, color: colors.ink, marginTop: 6 },
  noteInput: {
    fontSize: 12,
    color: colors.ink,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
    minHeight: 32,
  },
});
