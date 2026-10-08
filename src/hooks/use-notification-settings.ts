import { useCallback, useEffect, useState } from 'react';
import { getSetting, setSetting } from '@/src/db/queries';
import {
  countVerseNotifications,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  syncVerseNotifications,
  type NotificationPermissionStatus,
  type VerseNotificationSettings,
} from '@/src/services/notification-service';

const KEY_ENABLED = 'notification_enabled';
const KEY_TIME = 'notification_time';

export const DEFAULT_NOTIFICATION_TIME = '08:00';

/** Lê as preferências salvas em `settings` (lembrete vem ligado por padrão). */
export async function loadVerseNotificationSettings(): Promise<
  VerseNotificationSettings & { firstRun: boolean }
> {
  const [storedEnabled, storedTime] = await Promise.all([getSetting(KEY_ENABLED), getSetting(KEY_TIME)]);
  return {
    enabled: storedEnabled === null ? true : storedEnabled === 'true',
    time: storedTime ?? DEFAULT_NOTIFICATION_TIME,
    firstRun: storedEnabled === null,
  };
}

async function saveVerseNotificationSettings(settings: VerseNotificationSettings): Promise<void> {
  await setSetting(KEY_ENABLED, String(settings.enabled));
  await setSetting(KEY_TIME, settings.time);
}

/**
 * Abertura do app (mesmo fluxo do Hidrata): reagenda sem pedir permissão.
 * A única exceção é a 1ª abertura — o Minha Bíblia não tem onboarding, então
 * é aqui que o pedido de permissão acontece uma vez.
 */
export async function syncVerseNotificationsOnLaunch(): Promise<void> {
  const { firstRun, ...settings } = await loadVerseNotificationSettings();
  // Se a permissão for negada a preferência continua "ligada"; a tela de
  // Configurações mostra o aviso com o botão "Permitir notificações".
  await syncVerseNotifications(settings, firstRun);
  if (firstRun) {
    await saveVerseNotificationSettings(settings);
  }
}

/**
 * Preferências da notificação do versículo do dia para a tela de
 * Configurações: aplica na hora (sem botão "Salvar") e expõe o status da
 * permissão e quantos dias estão agendados, como no Hidrata.
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState<VerseNotificationSettings>({
    enabled: true,
    time: DEFAULT_NOTIFICATION_TIME,
  });
  const [permission, setPermission] = useState<NotificationPermissionStatus>('undetermined');
  const [scheduledCount, setScheduledCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { enabled, time } = await loadVerseNotificationSettings();
        const [status, count] = await Promise.all([
          getNotificationPermissionStatus(),
          countVerseNotifications(),
        ]);
        setSettings({ enabled, time });
        setPermission(status);
        setScheduledCount(count);
      } catch {
        setError('Não foi possível carregar as notificações.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const apply = useCallback(async (next: VerseNotificationSettings, askPermission: boolean) => {
    setSettings(next);
    setError(null);
    try {
      await saveVerseNotificationSettings(next);
      const result = await syncVerseNotifications(next, askPermission);
      setPermission(result.permission);
      setScheduledCount(result.scheduledCount);
    } catch {
      setError('Não foi possível agendar as notificações.');
    }
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => apply({ ...settings, enabled }, enabled),
    [apply, settings],
  );

  const setTime = useCallback(
    (time: string) => apply({ ...settings, time }, false),
    [apply, settings],
  );

  /** Botão "Permitir notificações" do aviso de permissão. */
  const requestPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
    try {
      const status = await requestNotificationPermission();
      setPermission(status);
      if (status === 'granted') {
        await apply({ ...settings, enabled: true }, false);
      }
      return status;
    } catch {
      setError('Não foi possível solicitar a permissão.');
      return permission;
    }
  }, [apply, permission, settings]);

  return {
    enabled: settings.enabled,
    time: settings.time,
    permission,
    scheduledCount,
    error,
    loading,
    setEnabled,
    setTime,
    requestPermission,
  };
}
