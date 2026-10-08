import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/src/constants/theme';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  message: string;
}

export function EmptyState({ icon, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Feather name={icon} size={26} color={colors.inkSoft} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  message: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 19 },
});
