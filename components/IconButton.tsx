import { Pressable, StyleSheet } from 'react-native';
import { colors, radii } from '@/src/constants/theme';

interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: number;
}

export function IconButton({ children, onPress, accessibilityLabel, size = 44 }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, { width: size, height: size, borderRadius: radii.sm }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.forestLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
