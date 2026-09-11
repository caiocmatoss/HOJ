import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushDevice } from "@/services/api/resources/push-devices";

export async function registerPushDeviceIfEnabled(enabled: boolean): Promise<void> {
  if (!enabled || !Device.isDevice) return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;
  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") return;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  if (token) await registerPushDevice({ token, platform: Platform.OS === "ios" ? "IOS" : "ANDROID" });
}
