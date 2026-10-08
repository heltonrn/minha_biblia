import { useCallback, useState } from 'react';
import { Link, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/LoadingState';
import { AdBanner } from '@/components/AdBanner';
import { colors, fonts, radii, spacing } from '@/src/constants/theme';
import {
  getPlanDayReadings,
  getReadingPlanById,
  leavePlan,
  markDayCompleted,
  startPlan,
  type PlanReadingRow,
} from '@/src/db/queries';
import { withProgress, type ReadingPlanWithProgress } from '@/src/hooks/use-reading-plans';
import { summarizeChapters } from '@/src/utils/format';

export default function PlanoDetalheScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const id = Number(planId);
  const [plan, setPlan] = useState<ReadingPlanWithProgress | null>(null);
  const [readings, setReadings] = useState<PlanReadingRow[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const row = await getReadingPlanById(id);
    if (!row) return;
    const p = withProgress(row);
    setPlan(p);
    setReadings(await getPlanDayReadings(id, p.currentDay));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load().catch((error) => console.error('Falha ao carregar o plano', error));
    }, [load])
  );

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    try {
      await action();
      await load();
    } catch (error) {
      console.error('Falha ao atualizar o plano', error);
    } finally {
      setSaving(false);
    }
  };

  const confirmLeave = () =>
    Alert.alert('Sair do plano?', 'O progresso deste plano será apagado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair do plano', style: 'destructive', onPress: () => run(() => leavePlan(id)) },
    ]);

  if (!plan) {
    return (
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <Stack.Screen options={{ title: '', headerShown: true, headerStyle: { backgroundColor: colors.cream } }} />
        <LoadingState />
        <AdBanner />
      </SafeAreaView>
    );
  }

  const summary = summarizeChapters(readings);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <Stack.Screen options={{ title: plan.name, headerShown: true, headerStyle: { backgroundColor: colors.cream } }} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.description}>{plan.description}</Text>

        {plan.status === 'not_started' && (
          <View style={styles.ticket}>
            <Text style={styles.chip}>{plan.duration_days} dias</Text>
            <Text style={styles.heading}>Como funciona</Text>
            <Text style={styles.paragraph}>
              A cada dia você lê os capítulos indicados e marca o dia como concluído. Se pular um dia, o plano
              espera por você — ele avança no seu ritmo.
            </Text>
            <Text style={styles.previewLabel}>Primeiro dia</Text>
            <Text style={styles.previewText}>{summary}</Text>
            <Pressable
              onPress={() => run(() => startPlan(id))}
              disabled={saving}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, (pressed || saving) && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>{saving ? 'Iniciando...' : 'Iniciar plano'}</Text>
            </Pressable>
          </View>
        )}

        {plan.status === 'in_progress' && (
          <View style={styles.ticket}>
            <Text style={styles.chip}>
              Dia {plan.currentDay} de {plan.duration_days}
            </Text>
            <Text style={styles.heading}>Leitura de hoje</Text>
            <Text style={styles.summary}>{summary}</Text>
            {readings.map((r) => (
              <Link
                key={r.chapter_id}
                href={{ pathname: '/capitulo/[chapterId]', params: { chapterId: String(r.chapter_id) } }}
                asChild
              >
                <Card style={styles.rowCard}>
                  <Text style={styles.rowTitle}>
                    {r.book_name} {r.chapter_number}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.inkSoft} />
                </Card>
              </Link>
            ))}
            <Pressable
              onPress={() => run(() => markDayCompleted(id, plan.currentDay))}
              disabled={saving}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, (pressed || saving) && styles.pressed]}
            >
              <Feather name="check" size={16} color={colors.paper} />
              <Text style={styles.primaryButtonText}>{saving ? 'Salvando...' : 'Marcar dia como concluído'}</Text>
            </Pressable>
          </View>
        )}

        {plan.status === 'finished' && (
          <View style={styles.ticket}>
            <Text style={styles.chip}>Concluído</Text>
            <Text style={styles.heading}>Parabéns! Você concluiu o plano.</Text>
            <Text style={styles.paragraph}>
              Foram {plan.duration_days} dias de leitura. Você pode recomeçar quando quiser.
            </Text>
            <Pressable
              onPress={() => run(() => startPlan(id))}
              disabled={saving}
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, (pressed || saving) && styles.pressed]}
            >
              <Feather name="rotate-ccw" size={16} color={colors.paper} />
              <Text style={styles.primaryButtonText}>Recomeçar plano</Text>
            </Pressable>
          </View>
        )}

        {plan.status !== 'not_started' && (
          <>
            <Text style={styles.sectionLabel}>Progresso do plano</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${plan.progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {plan.completed_days} de {plan.duration_days} dias
            </Text>
            <Pressable onPress={confirmLeave} accessibilityRole="button" hitSlop={8} style={styles.leave}>
              <Text style={styles.leaveText}>Sair do plano</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  body: { padding: spacing.lg },
  description: { fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginBottom: spacing.md },
  ticket: { backgroundColor: colors.paper, borderRadius: radii.lg, padding: spacing.lg },
  chip: {
    alignSelf: 'flex-start',
    fontFamily: fonts.displaySemiBold,
    fontSize: 11,
    color: colors.forestDark,
    backgroundColor: colors.forestLight,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  heading: { fontFamily: fonts.displayBold, fontSize: 16, color: colors.ink, marginBottom: spacing.sm },
  summary: { fontSize: 13, color: colors.inkSoft, marginBottom: spacing.md },
  paragraph: { fontSize: 13, lineHeight: 19, color: colors.ink, marginBottom: spacing.md },
  previewLabel: { fontFamily: fonts.displayBold, fontSize: 12, color: colors.forestDark },
  previewText: { fontSize: 13, color: colors.ink, marginTop: 2, marginBottom: spacing.md },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowTitle: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.forest,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: spacing.sm,
  },
  primaryButtonText: { fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.paper },
  pressed: { opacity: 0.7 },
  sectionLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 13,
    color: colors.forestDark,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  track: { height: 8, borderRadius: 6, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.forest, borderRadius: 6 },
  progressLabel: { textAlign: 'right', fontSize: 12, color: colors.inkSoft, marginTop: 6 },
  leave: { alignSelf: 'center', marginTop: spacing.xl, padding: spacing.sm },
  leaveText: { fontSize: 13, color: colors.plum, textDecorationLine: 'underline' },
});
