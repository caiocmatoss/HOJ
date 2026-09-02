import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { BrandMark } from "@/components/ui/BrandMark";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useNotificationStore } from "@/store/notification-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";

export function HomeHeaderExperience() {
  const user = useUserStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const statuses = usePresenceStore((state) => state.statuses);
  const online = user ? (statuses[user.id] ?? user.status) === "ONLINE" : false;

  return (
    <View style={styles.container}>
      <BrandMark compact tagline="Perto de você agora" />

      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={
            unreadCount > 0
              ? `${unreadCount} notificações não lidas`
              : "Abrir notificações"
          }
          onPress={() => router.push("/(main)/notifications")}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.textSecondary} name="notifications-outline" size={20} />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          accessibilityLabel="Abrir perfil"
          onPress={() => router.push("/(main)/profile")}
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}
        >
          <UserAvatar
            name={user?.name ?? "Usuário"}
            online={online}
            showStatus
            size={38}
            uri={user?.avatar}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.small,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    position: "relative",
    width: 40,
  },
  avatarButton: {
    borderRadius: 20,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderColor: colors.background,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 16,
    minWidth: 16,
    paddingHorizontal: 2,
    position: "absolute",
    right: -3,
    top: -4,
  },
  badgeText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 7,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
