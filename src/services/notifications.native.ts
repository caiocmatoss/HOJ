import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";

export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("default", { name: "HOJE É ONDE", importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 250, 250] });
}
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> { return (await Notifications.getPermissionsAsync()).status; }
export async function requestNotificationPermission(): Promise<boolean> { const current = await Notifications.getPermissionsAsync(); if (current.status === "granted") return true; return (await Notifications.requestPermissionsAsync()).status === "granted"; }
export async function scheduleLocalNotification({ title, body, data }: { title: string; body: string; data?: Record<string, string> }) { if (!(await requestNotificationPermission())) return null; return Notifications.scheduleNotificationAsync({ content: { title, body, data, sound: true }, trigger: null }); }
export async function sendTestNotification() { return scheduleLocalNotification({ title: "HOJE É ONDE 🎉", body: "As notificações estão funcionando.", data: { type: "test" } }); }
export async function cancelAllNotifications(): Promise<void> { await Notifications.cancelAllScheduledNotificationsAsync(); }
