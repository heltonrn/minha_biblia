import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/src/constants/theme';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Carregando...' }: LoadingStateProps) {
  return (
    <View style={styles.container} accessibilityLabel={label}>
      <ActivityIndicator color={colors.forest} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  label: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkSoft },
});
