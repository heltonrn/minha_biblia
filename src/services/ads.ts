import Constants, { ExecutionEnvironment } from 'expo-constants';

/**
 * O módulo nativo do AdMob não existe no Expo Go. Importá-lo de forma estática
 * derruba o app inteiro lá; por isso ele só é carregado (via require) quando
 * o app roda num build nativo (development build ou release).
 */
export const adsAvailable =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

type MobileAdsModule = typeof import('react-native-google-mobile-ads');

export function loadAdsModule(): MobileAdsModule | null {
  if (!adsAvailable) return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-google-mobile-ads') as MobileAdsModule;
}

export function initAds(): void {
  loadAdsModule()?.default().initialize();
}
