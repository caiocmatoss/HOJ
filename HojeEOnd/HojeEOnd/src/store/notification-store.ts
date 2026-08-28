import { create } from "zustand";

import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, type ApiNotification } from "@/services/api";
import type { NotificationPermissionStatus } from "@/services/notifications";

type NotificationStore = {
  permissionStatus: NotificationPermissionStatus;
  notificationsEnabled: boolean;
  notifications: ApiNotification[];
  unreadCount: number;
  loading: boolean;
  processingIds: Record<string, boolean>;
  error: string | null;
  setPermissionStatus: (status: NotificationPermissionStatus) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  loadNotifications: () => Promise<void>;
  addNotification: (notification: ApiNotification) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

const messageFor = (error: unknown, fallback: string) => error instanceof Error ? error.message : fallback;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  permissionStatus: "undetermined",
  notificationsEnabled: false,
  notifications: [],
  unreadCount: 0,
  loading: false,
  processingIds: {},
  error: null,
  setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  loadNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const notifications = await getNotifications();
      set({ notifications, unreadCount: notifications.filter((item) => item.readAt === null).length, loading: false });
    } catch (error) {
      set({ loading: false, error: messageFor(error, "Não foi possível carregar as notificações.") });
    }
  },
  addNotification: (notification) => set((state) => state.notifications.some((item) => item.id === notification.id) ? state : { notifications: [notification, ...state.notifications], unreadCount: state.unreadCount + (notification.readAt === null ? 1 : 0) }),
  markAsRead: async (id) => {
    if (get().processingIds[id]) return;
    const current = get().notifications.find((item) => item.id === id);
    if (!current || current.readAt !== null) return;
    set((state) => ({ processingIds: { ...state.processingIds, [id]: true }, error: null }));
    try {
      const updated = await markNotificationAsRead(id);
      set((state) => ({ notifications: state.notifications.map((item) => item.id === id ? updated : item), unreadCount: state.notifications.filter((item) => item.id !== id && item.readAt === null).length + (updated.readAt === null ? 1 : 0), processingIds: { ...state.processingIds, [id]: false } }));
    } catch (error) {
      set((state) => ({ processingIds: { ...state.processingIds, [id]: false }, error: messageFor(error, "Não foi possível marcar a notificação como lida.") }));
    }
  },
  markAllAsRead: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      await markAllNotificationsAsRead();
      set((state) => ({ notifications: state.notifications.map((item) => item.readAt === null ? { ...item, readAt: new Date().toISOString() } : item), unreadCount: 0, loading: false }));
    } catch (error) {
      set({ loading: false, error: messageFor(error, "Não foi possível marcar as notificações como lidas.") });
    }
  },
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));