/**
 * Design tokens compartilhados por toda a UI do app.
 * Mesma paleta usada no mockup visual (Frase do Dia / Meu Mercado).
 *
 * Fase 7: `inkSoft` foi escurecido de #83786C para #6E6255 — o tom original
 * dava contraste ~4:1 sobre `cream`, abaixo do mínimo de 4.5:1 (WCAG AA)
 * para texto normal. O novo tom fica em ~5.4:1.
 */
export const colors = {
  cream: '#FAF6EE',
  paper: '#FFFFFF',
  forest: '#2B6E52',
  forestDark: '#1F5540',
  forestLight: '#E4EFE6',
  mustard: '#C9922E',
  mustardLight: '#F6E8CE',
  plum: '#8B3A4B',
  plumLight: '#F3E1E4',
  ink: '#2B2620',
  inkSoft: '#6E6255',
  line: '#E9E2D6',
} as const;

export const fonts = {
  displayBold: 'Quicksand_700Bold',
  displaySemiBold: 'Quicksand_600SemiBold',
  displayMedium: 'Quicksand_500Medium',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 16,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
} as const;
