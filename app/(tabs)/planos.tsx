import { Link } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, spacing } from '@/src/constants/theme';
import { useReadingPlans, type ReadingPlanWithProgress } from '@/src/hooks/use-reading-plans';

function statusLabel(plan: ReadingPlanWithProgress): string {
  switch (plan.status) {
    case 'not_started':
      return `${plan.duration_days} dias · não iniciado`;
    case 'finished':
      return `Concluído · ${plan.duration_days} de ${plan.duration_days} dias`;
    default:
      return `Dia ${plan.currentDay} de ${plan.duration_days} · ${plan.completed_days} concluídos`;
  }
}

export default function PlanosScreen() {
  const { plans, loading } = useReadingPlans();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Planos de leitura</Text>
        <Text style={styles.subtitle}>Escolha um plano e avance no seu ritmo, um dia de cada vez.</Text>
      </View>

      {loading ? (
        <LoadingState />
      ) : (
        <FlatList
          contentContainerStyle={styles.body}
          data={plans}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={<EmptyState icon="calendar" message="Nenhum plano de leitura disponível." />}
          renderItem={({ item }) => (
            <Link href={{ pathname: '/planos/[planId]', params: { planId: String(item.id) } }} asChild>
              <Card>
                <View style={styles.titleRow}>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.status !== 'not_started' && (
                    <Text style={[styles.badge, item.status === 'finished' && styles.badgeDone]}>
                      {item.status === 'finished' ? 'Concluído' : 'Em andamento'}
                    </Text>
                  )}
                </View>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.meta}>{statusLabel(item)}</Text>
                {item.status !== 'not_started' && (
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${item.progress * 100}%` }]} />
                  </View>
                )}
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
  subtitle: { fontSize: 12.5, color: colors.inkSoft, marginTop: 4 },
  body: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { flex: 1, fontFamily: fonts.displayBold, fontSize: 15, color: colors.ink },
  badge: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 10.5,
    color: colors.forestDark,
    backgroundColor: colors.forestLight,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 9,
    overflow: 'hidden',
  },
  badgeDone: { color: colors.ink, backgroundColor: colors.mustardLight },
  description: { fontSize: 12.5, lineHeight: 18, color: colors.ink, marginTop: 6 },
  meta: { fontSize: 12, color: colors.inkSoft, marginTop: spacing.sm, marginBottom: spacing.sm },
  track: { height: 8, borderRadius: 6, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.forest, borderRadius: 6 },
});
