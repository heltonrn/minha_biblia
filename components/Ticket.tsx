import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '@/src/constants/theme';

interface TicketProps {
  category: string;
  quote: string;
  author: string;
}

export function Ticket({ category, quote, author }: TicketProps) {
  return (
    <View style={styles.ticket}>
      <View style={styles.chip}>
        <Text style={styles.chipText}>{category}</Text>
      </View>
      <Text style={styles.quoteMark}>&ldquo;</Text>
      <Text style={styles.quoteText}>{quote}</Text>
      <Text style={styles.author}>{author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.paper,
    borderRadius: radii.lg,
    padding: spacing.xl,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.forestLight,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  chipText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 11,
    color: colors.forestDark,
  },
  quoteMark: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    color: colors.mustard,
    lineHeight: 38,
    marginBottom: spacing.xs,
  },
  quoteText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    lineHeight: 27,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  author: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.inkSoft,
  },
});
