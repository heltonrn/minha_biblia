import { StyleSheet, Text } from 'react-native';
import { colors, fonts } from '@/src/constants/theme';

interface ChipProps {
  label: string;
  active?: boolean;
}

export function Chip({ label, active = true }: ChipProps) {
  return (
    <Text style={[styles.chip, active ? styles.active : styles.inactive]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 12,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  active: {
    backgroundColor: colors.forestLight,
    color: colors.forestDark,
  },
  inactive: {
    backgroundColor: colors.line,
    color: colors.inkSoft,
  },
});
