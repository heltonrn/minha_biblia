// Não importar 'react-native-google-mobile-ads' aqui: quebraria o app no Expo Go.
// O ID abaixo é o mesmo de TestIds.ADAPTIVE_BANNER (teste do Google).
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/9214589741';

/**
 * Quem decide entre anúncio de teste e real é EXPO_PUBLIC_ADS_ENV, definida por
 * perfil no eas.json (development/preview = "test", production = "production").
 * `__DEV__` sozinho não basta: ele é `false` em QUALQUER APK/AAB do EAS,
 * inclusive no preview — e anúncio real em build de teste arrisca a conta AdMob.
 * Sem a variável, o padrão é seguro (teste).
 */
const USE_TEST_ADS = __DEV__ || process.env.EXPO_PUBLIC_ADS_ENV !== 'production';

/** IDs de anúncio do app "Minha Bíblia" (br.com.volvet.minhabiblia) no AdMob. */
export const AD_UNIT_IDS = {
  banner: USE_TEST_ADS ? TEST_BANNER_ID : 'ca-app-pub-7069995647129253/9645871326',
};

export const ADMOB_ANDROID_APP_ID = 'ca-app-pub-7069995647129253~5463083738';
