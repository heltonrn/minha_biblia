import { Pressable, PressableProps, StyleSheet, View, ViewProps } from 'react-native';
import { colors, radii, spacing } from '@/src/constants/theme';

type CardProps = ViewProps & {
  /** Quando presente (ex.: via <Link asChild>), o card vira um Pressable. */
  onPress?: PressableProps['onPress'];
};

/**
 * Card base. Usado dentro de <Link asChild>, o Link injeta `onPress` no filho;
 * um <View> simples ignorava esse onPress e o toque "não fazia nada".
 */
export function Card({ style, children, onPress, ...rest }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
});
