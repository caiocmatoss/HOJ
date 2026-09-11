import {
  useEffect,
} from "react";

import {
  configureNotifications,
  getNotificationPermissionStatus,
} from "@/services/notifications";
import { Platform } from "react-native";

import {
  useNotificationStore,
} from "@/store/notification-store";

import { joinNotifications, leaveNotifications, onNewNotification } from "@/services/socket";
import { useUserStore } from "@/store/user-store";
import { useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "@/services/api/query-keys";
import { useNotificationPreferencesQuery } from "@/services/api/resources/profile";
import { registerPushDeviceIfEnabled } from "@/services/push-device-registration";

export default function NotificationManager() {
  const setPermissionStatus =
    useNotificationStore(
      (state) =>
        state.setPermissionStatus,
    );

  const setNotificationsEnabled =
    useNotificationStore(
      (state) =>
        state.setNotificationsEnabled,
    );

  const setLoading =
    useNotificationStore(
      (state) =>
        state.setLoading,
    );

  const setError =
    useNotificationStore(
      (state) =>
        state.setError,
    );

  const accessToken = useUserStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const preferencesQuery = useNotificationPreferencesQuery(Boolean(accessToken));

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        if (mounted) {
          setLoading(true);
          setError(null);
        }

        await configureNotifications();

        if (!mounted) {
          return;
        }

        const status =
          await getNotificationPermissionStatus();

        if (!mounted) {
          return;
        }

        setPermissionStatus(
          status,
        );

        setNotificationsEnabled(
          status ===
            "granted",
        );

        setError(null);
      } catch (error) {
        if (!mounted) {
          return;
        }

        /*
         * Em caso de falha na configuração,
         * não consideramos as notificações
         * como ativas.
         */
        setNotificationsEnabled(
          false,
        );

        if (
          error instanceof Error
        ) {
          setError(
            error.message,
          );
        } else {
          setError(
            "Não foi possível configurar as notificações.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      mounted = false;
    };
  }, [
    setError,
    setLoading,
    setNotificationsEnabled,
    setPermissionStatus,
  ]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let active = true;
    const cleanup = onNewNotification(() => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });
    void joinNotifications().catch((error: unknown) => {
      if (active) {
        // A falha transitória do canal de notificações não deve bloquear a UI
        // com um toast técnico global. O socket mantém sua própria estratégia
        // de reconexão; em desenvolvimento registramos apenas um aviso.
        if (__DEV__) {
          console.warn("[Notifications] Socket indisponível", error);
        }
      }
    });
    return () => {
      active = false;
      cleanup();
      leaveNotifications();
    };
  }, [accessToken, queryClient]);

  useEffect(() => {
    if (!accessToken || Platform.OS === "web" || preferencesQuery.data?.pushEnabled !== true) return;
    void registerPushDeviceIfEnabled(true).catch(() => undefined);
  }, [accessToken, preferencesQuery.data?.pushEnabled]);

  return null;
}
