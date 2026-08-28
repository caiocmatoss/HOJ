import {
  useEffect,
} from "react";

import {
  configureNotifications,
  getNotificationPermissionStatus,
} from "@/services/notifications";

import {
  useNotificationStore,
} from "@/store/notification-store";

import { joinNotifications, leaveNotifications, onNewNotification } from "@/services/socket";
import { useUserStore } from "@/store/user-store";

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

  const addNotification = useNotificationStore((state) => state.addNotification);
  const loadNotifications = useNotificationStore((state) => state.loadNotifications);
  const accessToken = useUserStore((state) => state.accessToken);

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
    void loadNotifications();
    const cleanup = onNewNotification(addNotification);
    void joinNotifications().catch((error: unknown) => {
      if (active) {
        console.error("[Notifications] Socket indisponível:", error);
      }
    });
    return () => {
      active = false;
      cleanup();
      leaveNotifications();
    };
  }, [accessToken, addNotification, loadNotifications]);

  return null;
}