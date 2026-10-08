import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getDailyVerse, getSetting, setSetting } from '@/src/db/queries';
import { dayOfYear } from '@/src/utils/format';

/**
 * Desde o SDK 53, importar `expo-notifications` no Expo Go (Android) lança erro.
 * Por isso o módulo só é carregado (via require) em builds nativos; no Expo Go
 * as funções abaixo viram no-op e a permissão é tratada como negada.
 */
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type NotificationsModule = typeof import('expo-notifications');
type NotificationResponse = import('expo-notifications').NotificationResponse;

let cached: NotificationsModule | null = null;

function loadNotifications(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (!cached) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-notifications') as NotificationsModule;
    cached.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  return cached;
}

export const notificationsAvailable = !isExpoGo;

/** Chaves em `settings` (compartilhadas com use-notification-settings). */
export const NOTIFICATION_KEYS = {
  enabled: 'notification_enabled',
  hour: 'notification_hour',
  minute: 'notification_minute',
} as const;

export const DEFAULT_NOTIFICATION_HOUR = 8;
export const DEFAULT_NOTIFICATION_MINUTE = 0;

const CHANNEL_ID = 'versiculo-do-dia';

/**
 * Quantos dias à frente ficam agendados. Cada abertura do app reagenda a
 * janela inteira, então só para de avisar quem ficar 30 dias sem abrir o app.
 */
const DAYS_AHEAD = 30;

const MAX_BODY = 280;

export interface VerseNotificationData {
  type: 'verse-of-day';
  chapterId: number;
  verse: number;
}

async function ensureChannel(Notifications: NotificationsModule): Promise<void> {
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Versículo do dia',
    description: 'Aviso diário quando o versículo do dia estiver disponível',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#2B6E52',
  });
}

function truncate(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length <= MAX_BODY ? clean : `${clean.slice(0, MAX_BODY - 1).trimEnd()}…`;
}

export async function hasNotificationPermission(): Promise<boolean> {
  const Notifications = loadNotifications();
  if (!Notifications) return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function requestNotificationPermission(): Promise<boolean> {
  const Notifications = loadNotifications();
  if (!Notifications) return false;
  // No Android 13+ o canal precisa existir antes do pedido de permissão.
  await ensureChannel(Notifications);
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Agenda uma notificação por dia, no horário escolhido, já com o versículo
 * daquele dia no texto (referência no título, versículo no corpo). Tocar na
 * notificação abre o capítulo no versículo (ver subscribeToVerseNotificationTaps).
 */
export async function scheduleDailyVerseNotifications(hour: number, minute: number): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  await ensureChannel(Notifications);
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute);
    if (when.getTime() <= now.getTime()) continue;

    const row = await getDailyVerse(dayOfYear(when));
    if (!row) continue;

    const data: VerseNotificationData = {
      type: 'verse-of-day',
      chapterId: row.chapter_id,
      verse: row.first_verse_id % 1000,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Versículo do dia · ${row.reference}`,
        body: truncate(row.text),
        data: { ...data },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: when,
        channelId: CHANNEL_ID,
      },
    });
  }
}

export async function cancelDailyVerseNotifications(): Promise<void> {
  const Notifications = loadNotifications();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Chamado na abertura do app:
 * - 1ª vez: pede a permissão (lembrete vem ligado por padrão);
 * - depois: reagenda os próximos dias, mantendo a janela sempre cheia.
 */
export async function syncDailyVerseNotifications(): Promise<void> {
  if (!notificationsAvailable) return;

  const [storedEnabled, storedHour, storedMinute] = await Promise.all([
    getSetting(NOTIFICATION_KEYS.enabled),
    getSetting(NOTIFICATION_KEYS.hour),
    getSetting(NOTIFICATION_KEYS.minute),
  ]);
  const hour = storedHour !== null ? Number(storedHour) : DEFAULT_NOTIFICATION_HOUR;
  const minute = storedMinute !== null ? Number(storedMinute) : DEFAULT_NOTIFICATION_MINUTE;

  let enabled: boolean;
  if (storedEnabled === null) {
    enabled = await requestNotificationPermission();
    await setSetting(NOTIFICATION_KEYS.enabled, String(enabled));
  } else {
    enabled = storedEnabled === 'true' && (await hasNotificationPermission());
  }

  if (enabled) {
    await scheduleDailyVerseNotifications(hour, minute);
  } else {
    await cancelDailyVerseNotifications();
  }
}

function readVerseData(response: NotificationResponse | null): VerseNotificationData | null {
  const data = response?.notification.request.content.data as Partial<VerseNotificationData> | undefined;
  if (data?.type !== 'verse-of-day' || !data.chapterId || !data.verse) return null;
  return { type: 'verse-of-day', chapterId: Number(data.chapterId), verse: Number(data.verse) };
}

/**
 * Escuta toques na notificação do versículo do dia — inclusive o toque que
 * abriu o app do zero — e chama `onOpen` com o capítulo/versículo.
 */
export function subscribeToVerseNotificationTaps(
  onOpen: (chapterId: number, verse: number) => void
): () => void {
  const Notifications = loadNotifications();
  if (!Notifications) return () => {};

  const handle = (response: NotificationResponse | null) => {
    const data = readVerseData(response);
    if (!data) return;
    onOpen(data.chapterId, data.verse);
    // Evita reabrir o mesmo versículo num recarregamento do app.
    Notifications.clearLastNotificationResponse();
  };

  // Toque que abriu o app do zero (app fechado).
  handle(Notifications.getLastNotificationResponse());
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}
