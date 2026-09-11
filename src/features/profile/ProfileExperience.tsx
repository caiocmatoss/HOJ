import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  type NotificationPermissionStatus,
} from "@/services/notifications";
import { logout as logoutRemote } from "@/services/api/auth";
import { useChatStore } from "@/store/chat-store";
import { useFavoriteStore } from "@/store/favorite-store";
import { useGroupStore } from "@/store/group-store";
import { useLocationStore } from "@/store/location-store";
import { useNotificationStore } from "@/store/notification-store";
import { useUnreadNotificationCountQuery } from "@/services/api/resources/notifications";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

export default function ProfileExperience() {
  const user = useUserStore((state) => state.user);

  const groups = useGroupStore((state) => state.groups);
  const loadGroups = useGroupStore((state) => state.loadGroups);
  const groupLoading = useGroupStore((state) => state.loading);

  const favoriteVenues = useFavoriteStore((state) => state.favoriteVenues);
  const favoriteLoading = useFavoriteStore((state) => state.loading);
  const favoriteError = useFavoriteStore((state) => state.error);
  const loadFavorites = useFavoriteStore((state) => state.loadFavorites);

  const presenceVisible = usePresenceStore((state) => state.visible);
  const presenceStatuses = usePresenceStore((state) => state.statuses);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const unreadCount = useUnreadNotificationCountQuery().data ?? 0;
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);
  const clearAllChats = useChatStore((state) => state.clearAllChats);

  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>("undetermined");
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "error" | "success" | "warning";
  } | null>(null);

  useEffect(() => {
    void loadFavorites();
    void loadGroups();
  }, [loadFavorites, loadGroups]);

  useEffect(() => {
    let active = true;

    const loadPermission = async () => {
      try {
        const status = await getNotificationPermissionStatus();
        if (active) setPermissionStatus(status);
      } catch {
        if (active) setPermissionStatus("undetermined");
      }
    };

    void loadPermission();
    return () => {
      active = false;
    };
  }, []);

  if (!user) {
    return (
      <View style={styles.page}>
        <ScreenContainer maxWidth={720}>
          <View style={styles.signedOut}>
            <View style={styles.signedOutIcon}>
              <Ionicons color={colors.brand} name="person-outline" size={30} />
            </View>
            <Text style={styles.signedOutTitle}>Sua conta não está disponível</Text>
            <Text style={styles.signedOutText}>
              Entre novamente para acessar o perfil, favoritos e preferências.
            </Text>
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Ir para login</Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const profileName = user.name.trim() || "Usuário";
  const profileBio = user.bio?.trim() || "Conte um pouco sobre você e sua vibe.";
  const currentPresence = presenceStatuses[user.id] ?? user.status;
  const isOnline = currentPresence === "ONLINE";
  const hasLocation = latitude !== null && longitude !== null;
  const notificationsEnabled = permissionStatus === "granted";

  const handleEnableNotifications = async () => {
    setNotificationLoading(true);
    setFeedback(null);

    try {
      const allowed = await requestNotificationPermission();
      setPermissionStatus(allowed ? "granted" : "denied");
      setFeedback({
        message: allowed
          ? "Notificações ativadas. Você não perde mais nenhuma novidade."
          : "A permissão foi negada. Você pode alterá-la nas configurações do dispositivo.",
        type: allowed ? "success" : "warning",
      });
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível solicitar a permissão de notificações.",
        type: "error",
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutRemote();
    clearAllChats();
    clearNotifications();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.page}
    >
      <ScreenContainer maxWidth={720} paddingHorizontal={16}>
        <ScreenHeading
          eyebrow="Sua conta"
          subtitle="Preferências, lugares salvos e sua presença no app."
          title="Perfil"
        />

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <UserAvatar
              name={profileName}
              online={isOnline}
              showStatus
              size={84}
              uri={user.avatar}
            />

            <Pressable
              accessibilityLabel="Editar perfil"
              onPress={() => router.push("/(main)/edit-profile")}
              style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.brand} name="pencil-outline" size={17} />
              <Text style={styles.editButtonText}>Editar</Text>
            </Pressable>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {profileName}
          </Text>
          <View style={styles.onlineRow}>
            <View style={[styles.onlineDot, !isOnline && styles.offlineDot]} />
            <Text style={[styles.onlineText, !isOnline && styles.offlineText]}>
              {isOnline ? "Online agora" : "Offline"}
            </Text>
          </View>
          <Text style={styles.bio}>{profileBio}</Text>

          <View style={styles.statsRow}>
            <ProfileStat label="Grupos" value={groupLoading ? "—" : String(groups.length)} />
            <View style={styles.statDivider} />
            <ProfileStat label="Favoritos" value={favoriteLoading ? "—" : String(favoriteVenues.length)} />
            <View style={styles.statDivider} />
            <ProfileStat label="Presença" value={presenceVisible ? "ON" : "OFF"} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>ATALHOS</Text>
        <View style={styles.quickActions}>
          <QuickAction
            badge={unreadCount > 0 ? String(Math.min(unreadCount, 99)) : undefined}
            icon="notifications-outline"
            label="Avisos"
            onPress={() => router.push("/(main)/notifications")}
          />
          <QuickAction
            icon="people-outline"
            label="Grupos"
            onPress={() => router.push("/(main)/chat")}
          />
          <QuickAction
            icon="compass-outline"
            label="Explorar"
            onPress={() => router.push("/(main)/explore")}
          />
        </View>

        <Text style={styles.sectionLabel}>PREFERÊNCIAS</Text>
        <View style={styles.sectionCard}>
          <MenuItem
            icon="radio-outline"
            iconColor={presenceVisible ? colors.success : colors.textMuted}
            subtitle={
              presenceVisible
                ? "Seus amigos podem ver que você está por perto"
                : "Sua presença está oculta"
            }
            title="Presença"
            trailing={presenceVisible ? "Visível" : "Oculta"}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="location-outline"
            iconColor={hasLocation ? colors.success : colors.textMuted}
            subtitle={
              hasLocation
                ? "Usada para ordenar lugares por proximidade"
                : "Ative a localização para ver o que está perto"
            }
            title="Localização"
            trailing={hasLocation ? "Ativa" : "Inativa"}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="notifications-outline"
            iconColor={notificationsEnabled ? colors.success : colors.brand}
            onPress={notificationsEnabled ? undefined : handleEnableNotifications}
            subtitle={
              notificationsEnabled
                ? "Convites, mensagens e novidades estão autorizados"
                : "Receba mensagens, convites e novidades"
            }
            title="Notificações do dispositivo"
            trailing={notificationLoading ? "Aguarde" : notificationsEnabled ? "Ativas" : "Ativar"}
          />
        </View>

        {feedback ? (
          <View style={styles.feedback}>
            <FeedbackMessage
              message={feedback.message}
              title={feedback.type === "success" ? "Tudo certo" : "Atenção"}
              type={feedback.type}
            />
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabelNoMargin}>FAVORITOS RECENTES</Text>
          {favoriteVenues.length > 0 ? (
            <Pressable onPress={() => router.push("/(main)/explore")}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.sectionCard}>
          {favoriteLoading ? (
            <InlineLoading label="Carregando lugares salvos..." />
          ) : favoriteError ? (
            <View style={styles.inlineState}>
              <Text style={styles.inlineStateText}>{favoriteError}</Text>
              <Pressable onPress={() => void loadFavorites()}>
                <Text style={styles.retryText}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : favoriteVenues.length > 0 ? (
            favoriteVenues.slice(0, 3).map((venue, index) => (
              <View key={venue.id}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: "/venue/[id]", params: { id: venue.id } })
                  }
                  style={({ pressed }) => [styles.listItem, pressed && styles.pressed]}
                >
                  {venue.image ? (
                    <Image source={{ uri: venue.image }} style={styles.venueImage} />
                  ) : (
                    <View style={styles.venuePlaceholder}>
                      <Ionicons color={colors.brand} name="location-outline" size={21} />
                    </View>
                  )}
                  <View style={styles.listCopy}>
                    <Text numberOfLines={1} style={styles.listTitle}>
                      {venue.name}
                    </Text>
                    <Text numberOfLines={1} style={styles.listSubtitle}>
                      {venue.category} · {venue.distance}
                    </Text>
                  </View>
                  <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
                </Pressable>
                {index < Math.min(favoriteVenues.length, 3) - 1 ? (
                  <View style={styles.menuDivider} />
                ) : null}
              </View>
            ))
          ) : (
            <EmptyInline
              action="Explorar lugares"
              icon="heart-outline"
              message="Seus lugares favoritos aparecerão aqui."
              onPress={() => router.push("/(main)/explore")}
            />
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabelNoMargin}>MEUS GRUPOS</Text>
          {groups.length > 0 ? (
            <Pressable onPress={() => router.push("/(main)/chat")}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.sectionCard}>
          {groupLoading && groups.length === 0 ? (
            <InlineLoading label="Carregando grupos..." />
          ) : groups.length > 0 ? (
            groups.slice(0, 3).map((group, index) => (
              <View key={group.id}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: "/(main)/group/[id]", params: { id: group.id } })
                  }
                  style={({ pressed }) => [styles.listItem, pressed && styles.pressed]}
                >
                  <View style={styles.groupIcon}>
                    <Ionicons color={colors.brand} name="people-outline" size={20} />
                  </View>
                  <View style={styles.listCopy}>
                    <Text numberOfLines={1} style={styles.listTitle}>
                      {group.name}
                    </Text>
                    <Text style={styles.listSubtitle}>
                      {group.members.length} {group.members.length === 1 ? "membro" : "membros"}
                    </Text>
                  </View>
                  <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
                </Pressable>
                {index < Math.min(groups.length, 3) - 1 ? <View style={styles.menuDivider} /> : null}
              </View>
            ))
          ) : (
            <EmptyInline
              action="Ver grupos"
              icon="people-outline"
              message="Crie um grupo para organizar a próxima saída."
              onPress={() => router.push("/(main)/chat")}
            />
          )}
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.danger} name="log-out-outline" size={19} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScreenContainer>
    </ScrollView>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  badge,
  icon,
  label,
  onPress,
}: {
  badge?: string;
  icon: IoniconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
    >
      <View style={styles.quickIcon}>
        <Ionicons color={colors.brand} name={icon} size={21} />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function MenuItem({
  icon,
  iconColor,
  onPress,
  subtitle,
  title,
  trailing,
}: {
  icon: IoniconName;
  iconColor: string;
  onPress?: () => void | Promise<void>;
  subtitle: string;
  title: string;
  trailing: string;
}) {
  const content = (
    <>
      <View style={styles.menuIcon}>
        <Ionicons color={iconColor} name={icon} size={20} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.menuTrailing}>{trailing}</Text>
      {onPress ? <Ionicons color={colors.textMuted} name="chevron-forward" size={16} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.menuItem}>{content}</View>;

  return (
    <Pressable
      onPress={() => void onPress()}
      style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

function InlineLoading({ label }: { label: string }) {
  return (
    <View style={styles.inlineLoading}>
      <ActivityIndicator color={colors.brand} size="small" />
      <Text style={styles.inlineStateText}>{label}</Text>
    </View>
  );
}

function EmptyInline({
  action,
  icon,
  message,
  onPress,
}: {
  action: string;
  icon: IoniconName;
  message: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.emptyInline}>
      <View style={styles.emptyIcon}>
        <Ionicons color={colors.brand} name={icon} size={22} />
      </View>
      <Text style={styles.inlineStateText}>{message}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.retryText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { paddingBottom: 120, paddingTop: 24 },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    marginTop: 24,
    padding: 20,
  },
  heroTop: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  editButton: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  editButtonText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 12 },
  name: { color: colors.text, fontFamily: fonts.display, fontSize: 30, marginTop: 18 },
  onlineRow: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 5 },
  onlineDot: { backgroundColor: colors.success, borderRadius: 4, height: 7, width: 7 },
  offlineDot: { backgroundColor: colors.textMuted },
  onlineText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 11 },
  offlineText: { color: colors.textMuted },
  bio: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, marginTop: 13 },
  statsRow: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.medium,
    flexDirection: "row",
    marginTop: 20,
    paddingVertical: 14,
  },
  stat: { alignItems: "center", flex: 1 },
  statValue: { color: colors.brand, fontFamily: fonts.bold, fontSize: 19 },
  statLabel: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  statDivider: { backgroundColor: colors.borderStrong, height: 32, width: 1 },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 24,
  },
  sectionLabelNoMargin: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  quickActions: { flexDirection: "row", gap: 10 },
  quickAction: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 15,
  },
  quickActionPressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.98 }] },
  quickIcon: { alignItems: "center", height: 26, justifyContent: "center", position: "relative", width: 32 },
  quickLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 11, marginTop: 6 },
  badge: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 15,
    minWidth: 15,
    paddingHorizontal: 3,
    position: "absolute",
    right: -4,
    top: -4,
  },
  badgeText: { color: colors.background, fontFamily: fonts.bold, fontSize: 8 },
  sectionCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, overflow: "hidden", paddingHorizontal: 14 },
  menuItem: { alignItems: "center", flexDirection: "row", minHeight: 72, paddingVertical: 12 },
  menuIcon: { alignItems: "center", backgroundColor: colors.elevated, borderRadius: radii.small, height: 40, justifyContent: "center", marginRight: 12, width: 40 },
  menuCopy: { flex: 1, minWidth: 0 },
  menuTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  menuSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15, marginTop: 3 },
  menuTrailing: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 10, marginLeft: 8, marginRight: 5 },
  menuDivider: { backgroundColor: colors.border, height: 1, marginLeft: 52 },
  feedback: { marginTop: 12 },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 10, marginTop: 24 },
  seeAll: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 11 },
  listItem: { alignItems: "center", flexDirection: "row", minHeight: 68, paddingVertical: 9 },
  venueImage: { backgroundColor: colors.elevated, borderRadius: radii.small, height: 46, marginRight: 12, width: 46 },
  venuePlaceholder: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: radii.small, height: 46, justifyContent: "center", marginRight: 12, width: 46 },
  groupIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 23, height: 46, justifyContent: "center", marginRight: 12, width: 46 },
  listCopy: { flex: 1, minWidth: 0 },
  listTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  listSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11, marginTop: 4 },
  inlineLoading: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "center", minHeight: 90 },
  inlineState: { alignItems: "center", gap: 8, justifyContent: "center", minHeight: 100, paddingVertical: 16 },
  emptyInline: { alignItems: "center", gap: 8, justifyContent: "center", minHeight: 130, paddingVertical: 18 },
  emptyIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  inlineStateText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, textAlign: "center" },
  retryText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 11 },
  logoutButton: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(239, 125, 125, 0.2)",
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 52,
  },
  logoutText: { color: colors.danger, fontFamily: fonts.semibold, fontSize: 13 },
  signedOut: { alignItems: "center", justifyContent: "center", minHeight: 520, paddingHorizontal: 20 },
  signedOutIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  signedOutTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 28, marginTop: 18, textAlign: "center" },
  signedOutText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 8, textAlign: "center" },
  primaryButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: radii.medium, marginTop: 20, paddingHorizontal: 24, paddingVertical: 14 },
  primaryButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 13 },
  pressed: { opacity: 0.78 },
});
