import { StyleSheet, View } from 'react-native';
import { AD_UNIT_IDS } from '@/src/constants/ads';
import { colors, spacing } from '@/src/constants/theme';
import { loadAdsModule } from '@/src/services/ads';

/**
 * Banner discreto — mesma ideia do mockup original ("não cobre a frase" /
 * "permitido aqui" nas telas de Início e Configurações).
 * No Expo Go (sem módulo nativo do AdMob) não renderiza nada.
 */
export function AdBanner() {
  const ads = loadAdsModule();
  if (!ads) return null;
  const { BannerAd, BannerAdSize } = ads;

  return (
    <View style={styles.container}>
      <BannerAd unitId={AD_UNIT_IDS.banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});
