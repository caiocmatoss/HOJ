import { create } from "zustand";

import type {
    NotificationPermissionStatus,
} from "@/services/notifications";

type NotificationStore = {
  permissionStatus:
    NotificationPermissionStatus;

  notificationsEnabled: boolean;

  loading: boolean;

  error: string | null;

  setPermissionStatus: (
    status:
      NotificationPermissionStatus,
  ) => void;

  setNotificationsEnabled: (
    enabled: boolean,
  ) => void;

  setLoading: (
    loading: boolean,
  ) => void;

  setError: (
    error: string | null,
  ) => void;
};

export const useNotificationStore =
  create<NotificationStore>((set) => ({
    permissionStatus:
      "undetermined",

    notificationsEnabled: false,

    loading: false,

    error: null,

    setPermissionStatus:
      (permissionStatus) =>
        set({
          permissionStatus,
        }),

    setNotificationsEnabled:
      (notificationsEnabled) =>
        set({
          notificationsEnabled,
        }),

    setLoading: (loading) =>
      set({
        loading,
      }),

    setError: (error) =>
      set({
        error,
      }),
  }));