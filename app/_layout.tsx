import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { initAds } from '@/src/services/ads';
import { subscribeToVerseNotificationTaps } from '@/src/services/notification-service';
import { syncVerseNotificationsOnLaunch } from '@/src/hooks/use-notification-settings';
import {
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initAds();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Versículo do dia: (re)agenda as notificações dos próximos dias a cada abertura.
  useEffect(() => {
    syncVerseNotificationsOnLaunch().catch((error) =>
      console.error('Falha ao agendar as notificações do versículo do dia', error)
    );
  }, []);

  // Tocar na notificação abre o capítulo já no versículo do dia.
  // Só depois das fontes: antes disso o Stack ainda não está montado.
  useEffect(() => {
    if (!fontsLoaded) return;
    return subscribeToVerseNotificationTaps((chapterId, verse) => {
      router.push({
        pathname: '/capitulo/[chapterId]',
        params: { chapterId: String(chapterId), verse: String(verse) },
      });
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="configuracoes" options={{ presentation: 'card' }} />
    </Stack>
  );
}
