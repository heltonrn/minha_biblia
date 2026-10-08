import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ticket } from '@/components/Ticket';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import { LoadingState } from '@/components/LoadingState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, radii, spacing } from '@/src/constants/theme';
import { useVerseOfDay } from '@/src/hooks/use-verse-of-day';
import { useLastReading } from '@/src/hooks/use-last-reading';
import { shareVerse } from '@/src/services/share';
import { formatLongDate } from '@/src/utils/format';

export default function InicioScreen() {
  const { verse, loading } = useVerseOfDay();
  const { lastReading, loading: loadingLast } = useLastReading();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha Bíblia</Text>
        <Link href="/configuracoes" asChild>
          <IconButton accessibilityLabel="Configurações" size={34}>
            <Feather name="settings" size={16} color={colors.forestDark} />
          </IconButton>
        </Link>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.dayHeader}>
          <Text style={styles.sectionLabel}>Versículo do dia</Text>
          {verse && <Text style={styles.date}>{formatLongDate(verse.date)}</Text>}
        </View>

        {loading ? (
          <LoadingState />
        ) : verse ? (
          <>
            <Ticket category={verse.reference} quote={verse.text} author={verse.translation} />

            <View style={styles.actions}>
              <Pressable
                onPress={() => shareVerse(verse.reference, verse.text)}
                accessibilityRole="button"
                accessibilityLabel="Compartilhar o versículo do dia"
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Feather name="share-2" size={16} color={colors.paper} />
                <Text style={styles.primaryButtonText}>Compartilhar</Text>
              </Pressable>

              <Link
                href={{
                  pathname: '/capitulo/[chapterId]',
                  params: { chapterId: String(verse.chapterId), verse: String(verse.verseNumber) },
                }}
                asChild
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ler o versículo do dia no capítulo"
                  // <Link asChild> exige estilo "plano" (sem array/função) no filho.
                  style={styles.secondaryButton}
                >
                  <Feather name="book-open" size={16} color={colors.forestDark} />
                  <Text style={styles.secondaryButtonText}>Ler no capítulo</Text>
                </Pressable>
              </Link>
            </View>
            <Text style={styles.hint}>Volte amanhã para um novo versículo</Text>
          </>
        ) : (
          <Text style={styles.hint}>Não foi possível carregar o versículo de hoje.</Text>
        )}

        <Text style={[styles.sectionLabel, styles.sectionSpacing]}>
          {lastReading ? 'Continuar leitura' : 'Comece sua leitura'}
        </Text>
        {loadingLast ? null : lastReading ? (
          <Link
            href={{
              pathname: '/capitulo/[chapterId]',
              params: { chapterId: String(lastReading.chapter_id), verse: String(lastReading.verse_number) },
            }}
            asChild
          >
            <Card style={styles.rowCard}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>
                  {lastReading.book_name} {lastReading.chapter_number}
                </Text>
                <Text style={styles.rowSub}>Você parou no versículo {lastReading.verse_number}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.inkSoft} />
            </Card>
          </Link>
        ) : (
          <Link href="/leitura" asChild>
            <Card style={styles.rowCard}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>Escolha um livro</Text>
                <Text style={styles.rowSub}>Seu ponto de leitura fica salvo aqui</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.inkSoft} />
            </Card>
          </Link>
        )}
      </ScrollView>

      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { fontFamily: fonts.displayBold, fontSize: 19, color: colors.forestDark },
  body: { padding: spacing.lg },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.forestDark },
  sectionSpacing: { marginTop: spacing.xl, marginBottom: spacing.sm },
  date: { fontSize: 12, color: colors.inkSoft },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.forest,
    borderRadius: radii.sm,
    paddingVertical: 12,
  },
  primaryButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.paper },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.forestLight,
    borderRadius: radii.sm,
    paddingVertical: 12,
  },
  secondaryButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.forestDark },
  pressed: { opacity: 0.75 },
  hint: { textAlign: 'center', fontSize: 12, color: colors.inkSoft, marginTop: spacing.md },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  rowSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
});
