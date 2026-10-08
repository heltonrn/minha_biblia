import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/src/constants/theme';

interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function parseTime(value: string): { hour: number; minute: number } {
  const [hour, minute] = value.split(':').map(Number);
  return {
    hour: Number.isInteger(hour) ? hour : 8,
    minute: Number.isInteger(minute) ? minute : 0,
  };
}

/**
 * Seletor de horário em bottom sheet — portado do Hidrata (template Volvet),
 * com as cores/fontes do Minha Bíblia. Valor no formato "HH:MM"; minutos de 5 em 5.
 */
export function TimePickerField({ label, value, onChange }: TimePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);

  function open(): void {
    const next = parseTime(value);
    setHour(next.hour);
    setMinute(next.minute);
    setVisible(true);
  }

  function confirm(): void {
    onChange(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    setVisible(false);
  }

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole='button' accessibilityLabel={`${label}: ${value}`} onPress={open} style={({ pressed }) => [styles.field, pressed && styles.pressed]}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      <Modal animationType='slide' onRequestClose={() => setVisible(false)} transparent visible={visible}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable accessibilityRole='button' onPress={() => setVisible(false)}><Text style={styles.cancel}>Cancelar</Text></Pressable>
            </View>
            <Text style={styles.preview}>{String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}</Text>
            <View style={styles.columns}>
              <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 24 }, (_, item) => (
                  <Pressable key={item} onPress={() => setHour(item)} style={[styles.option, item === hour && styles.selectedOption]}>
                    <Text style={[styles.optionText, item === hour && styles.selectedText]}>{String(item).padStart(2, '0')}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.separator}>:</Text>
              <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 12 }, (_, item) => item * 5).map((item) => (
                  <Pressable key={item} onPress={() => setMinute(item)} style={[styles.option, item === minute && styles.selectedOption]}>
                    <Text style={[styles.optionText, item === minute && styles.selectedText]}>{String(item).padStart(2, '0')}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
            <Pressable accessibilityRole='button' onPress={confirm} style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}><Text style={styles.confirmText}>Usar este horário</Text></Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, fontFamily: fonts.bodySemiBold, fontSize: 13, lineHeight: 18, marginBottom: 7 },
  field: { alignItems: 'center', backgroundColor: colors.paper, borderColor: colors.line, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 14 },
  value: { color: colors.ink, fontFamily: fonts.bodyMedium, fontSize: 16 },
  chevron: { color: colors.forest, fontSize: 20 },
  pressed: { opacity: 0.7 },
  overlay: { backgroundColor: 'rgba(43, 38, 32, 0.38)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  sheetHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sheetTitle: { color: colors.ink, fontFamily: fonts.displayBold, fontSize: 20 },
  cancel: { color: colors.inkSoft, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  preview: { color: colors.forestDark, fontFamily: fonts.displayBold, fontSize: 42, marginVertical: 14, textAlign: 'center' },
  columns: { alignItems: 'center', flexDirection: 'row', height: 190, justifyContent: 'center' },
  options: { gap: 4, paddingVertical: 70 },
  option: { alignItems: 'center', borderRadius: 10, minHeight: 40, justifyContent: 'center', minWidth: 72 },
  selectedOption: { backgroundColor: colors.forestLight },
  optionText: { color: colors.inkSoft, fontFamily: fonts.bodyMedium, fontSize: 18 },
  selectedText: { color: colors.forestDark, fontFamily: fonts.bodyBold },
  separator: { color: colors.ink, fontFamily: fonts.displayBold, fontSize: 24, marginHorizontal: 8 },
  confirm: { alignItems: 'center', backgroundColor: colors.forest, borderRadius: 13, minHeight: 50, justifyContent: 'center', marginTop: 14 },
  confirmText: { color: colors.paper, fontFamily: fonts.bodyBold, fontSize: 14 },
});
