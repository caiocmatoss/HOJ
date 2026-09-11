export type NotificationPermissionStatus = "granted" | "denied" | "undetermined";
export async function configureNotifications(): Promise<void> { return; }
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> { return "undetermined"; }
export async function requestNotificationPermission(): Promise<boolean> { return false; }
export async function scheduleLocalNotification(_input: { title: string; body: string; data?: Record<string, string> }) { return null; }
export async function sendTestNotification() { return null; }
export async function cancelAllNotifications(): Promise<void> { return; }
