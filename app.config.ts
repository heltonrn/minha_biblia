import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Minha Bíblia',
  slug: 'minha-biblia',
  scheme: 'minha-biblia',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#FAF6EE',
  primaryColor: '#2B6E52',
  android: {
    // ATENÇÃO: depois do primeiro envio à Play Store o pacote nunca mais pode mudar.
    package: 'br.com.volvet.minhabiblia',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#2B6E52',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 180,
        resizeMode: 'contain',
        backgroundColor: '#FAF6EE',
        dark: {
          image: './assets/splash-icon.png',
          backgroundColor: '#1F5540',
        },
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        // App ID de produção (AdMob). O App ID pode ficar fixo em todos os builds;
        // quem decide anúncio de teste x real é o bloco em src/constants/ads.ts.
        androidAppId: 'ca-app-pub-7069995647129253~5463083738',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#2B6E52',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
