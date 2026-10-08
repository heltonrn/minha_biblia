import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { LoadingState } from '@/components/LoadingState';
import { AdBanner } from '@/components/AdBanner';
import { TimePickerField } from '@/components/TimePickerField';
import { colors, fonts, radii, spacing } from '@/src/constants/theme';
import { useNotificationSettings } from '@/src/hooks/use-notification-settings';
import { getBibleMeta } from '@/src/db/queries';

export default function ConfiguracoesScreen() {
  const {
    enabled,
    time,
    permission,
    scheduledCount,
    error,
    loading,
    setEnabled,
    setTime,
    requestPermission,
  } = useNotificationSettings();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    getBibleMeta()
      .then(setMeta)
      .catch((error) => console.error('Falha ao carregar os créditos do texto bíblico', error));
  }, []);

  async function handlePermission(): Promise<void> {
    const status = await requestPermission();
    setFeedback(
      status === 'granted'
        ? 'Permissão concedida. Notificações agendadas.'
        : 'As notificações continuam bloqueadas neste dispositivo. Libere nas configurações do Android.'
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Stack.Screen options={{ title: 'Configurações', headerShown: true, headerStyle: { backgroundColor: colors.cream } }} />
      {loading ? (
        <LoadingState />
      ) : (
        <ScrollView contentContainerStyle={styles.body}>
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Notificação diária</Text>
            <View style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.label}>Lembrete diário</Text>
                <Text style={styles.sub}>Avisa quando o versículo do dia estiver disponível</Text>
              </View>
              <Switch value={enabled} onValueChange={setEnabled} trackColor={{ true: colors.forest }} />
            </View>
            <View style={[styles.timeRow, styles.rowBorder, !enabled && styles.disabled]} pointerEvents={enabled ? 'auto' : 'none'}>
              <TimePickerField label="Horário" onChange={setTime} value={time} />
            </View>

            {enabled && permission !== 'granted' ? (
              <View style={styles.permissionBox}>
                <Text style={styles.permissionText}>
                  {permission === 'unavailable'
                    ? 'As notificações só funcionam no app instalado (não no Expo Go).'
                    : 'Permita notificações para receber o versículo no horário escolhido.'}
                </Text>
                {permission !== 'unavailable' ? (
                  <Pressable
                    // Negada de vez (canAskAgain = false): o Android não mostra
                    // mais o diálogo, então o caminho é a tela de configurações do app.
                    onPress={() => (permission === 'denied' ? void Linking.openSettings() : void handlePermission())}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.permissionButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.permissionButtonText}>
                      {permission === 'denied' ? 'Abrir configurações do Android' : 'Permitir notificações'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {enabled && scheduledCount > 0 ? (
              <Text style={styles.scheduledText}>Próximos {scheduledCount} dias agendados</Text>
            ) : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Sobre o app</Text>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Versão</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Tradução</Text>
              <Text style={styles.aboutValue}>{meta?.short_name ?? 'Bíblia Livre (BLIVRE)'}</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Edição do texto</Text>
              <Text style={styles.aboutValue}>{meta?.source_version ?? '—'}</Text>
            </View>
          </Card>

          {/* Atribuição exigida pela licença CC BY 3.0 BR da Bíblia Livre. */}
          <Card style={styles.section}>
            <Text style={styles.sectionLabel}>Créditos do texto bíblico</Text>
            <Text style={styles.credit}>{meta?.attribution ?? ''}</Text>
            {meta?.license_url ? (
              <Pressable
                onPress={() => Linking.openURL(meta.license_url)}
                accessibilityRole="link"
                hitSlop={8}
              >
                <Text style={styles.link}>Ver a licença ({meta.license})</Text>
              </Pressable>
            ) : null}
            {meta?.source_url ? (
              <Pressable onPress={() => Linking.openURL(meta.source_url)} accessibilityRole="link" hitSlop={8}>
                <Text style={styles.link}>Projeto Bíblia Livre</Text>
              </Pressable>
            ) : null}
          </Card>
        </ScrollView>
      )}
      <AdBanner />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  body: { padding: spacing.lg },
  section: { marginBottom: spacing.md },
  sectionLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.forestDark, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  rowText: { flex: 1, paddingRight: spacing.md },
  label: { fontSize: 14, fontWeight: '500', color: colors.ink },
  sub: { fontSize: 11.5, color: colors.inkSoft, marginTop: 2 },
  timeRow: { paddingTop: spacing.md, paddingBottom: spacing.xs },
  disabled: { opacity: 0.5 },
  permissionBox: {
    backgroundColor: colors.mustardLight,
    borderRadius: radii.sm,
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  permissionText: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 17, color: colors.ink },
  permissionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.forest,
    borderRadius: radii.sm,
    minHeight: 44,
  },
  permissionButtonText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.paper },
  pressed: { opacity: 0.7 },
  scheduledText: { fontFamily: fonts.bodySemiBold, fontSize: 12, color: colors.forestDark, marginTop: spacing.sm },
  errorText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.plum, marginTop: spacing.sm },
  feedback: { fontFamily: fonts.bodySemiBold, fontSize: 12, lineHeight: 17, color: colors.forestDark, marginTop: spacing.sm },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  aboutLabel: { fontSize: 13, color: colors.inkSoft },
  aboutValue: { fontSize: 13, color: colors.ink, fontWeight: '500' },
  credit: { fontSize: 12, color: colors.ink, lineHeight: 18 },
  link: { fontSize: 12.5, color: colors.forest, textDecorationLine: 'underline', marginTop: spacing.sm },
});
