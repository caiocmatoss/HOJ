import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getFriends, removeFriend, type ApiFriend } from "@/services/api";
import { getPresence } from "@/services/socket";
import { usePresenceStore } from "@/store/presence-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";

function formatDistance(distanceKm?: number, distanceMeters?: number) {
  if (typeof distanceMeters === "number" && Number.isFinite(distanceMeters)) {
    if (distanceMeters < 1000) return `${Math.max(1, Math.round(distanceMeters))} m de você`;
    return `${(distanceMeters / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} km de você`;
  }

  if (typeof distanceKm === "number" && Number.isFinite(distanceKm)) {
    return `${distanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km de você`;
  }

  return null;
}

function formatLocationUpdate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `Atualizada às ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function FriendDetailExperience() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const friendId = Array.isArray(id) ? id[0] : id;

  const presenceStatuses = usePresenceStore((state) => state.statuses);
  const friendLocations = usePresenceStore((state) => state.friendLocations);
  const visible = usePresenceStore((state) => state.visible);
  const removePresenceUser = usePresenceStore((state) => state.removeUser);

  const [friend, setFriend] = useState<ApiFriend | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);

  const loadFriend = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!friendId) {
      setFriend(null);
      setLoading(false);
      return;
    }

    try {
      const result = await getFriends();
      setFriend(result.find((item) => item.id === friendId) ?? null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar este amigo.",
      );
    } finally {
      setLoading(false);
    }
  }, [friendId]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      await Promise.allSettled([loadFriend(), getPresence()]);
      if (!active) return;
    };

    void initialize();

    return () => {
      active = false;
    };
  }, [loadFriend]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([loadFriend(), getPresence()]);
    setRefreshing(false);
  }, [loadFriend]);

  const location = friendId ? friendLocations[friendId] : undefined;
  const distance = useMemo(
    () => formatDistance(location?.distanceKm, location?.distanceMeters),
    [location?.distanceKm, location?.distanceMeters],
  );
  const locationUpdate = useMemo(
    () => formatLocationUpdate(location?.updatedAt),
    [location?.updatedAt],
  );

  const backToFriends = () => router.replace("/(main)/friends");

  const handleRemoveFriend = async () => {
    if (!friend || removing) return;

    setRemoving(true);
    setRemoveError(null);

    try {
      await removeFriend(friend.id);
      removePresenceUser(friend.id);
      router.replace("/(main)/friends");
    } catch (requestError) {
      setRemoveError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível remover esta amizade.",
      );
      setConfirmingRemoval(false);
    } finally {
      setRemoving(false);
    }
  };

  if (loading && !friend) {
    return (
      <View style={styles.centeredPage}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator color={colors.brand} size="small" />
        </View>
        <Text style={styles.stateTitle}>Carregando perfil</Text>
        <Text style={styles.stateText}>Sincronizando amizade e presença.</Text>
      </View>
    );
  }

  if (error || !friend) {
    return (
      <View style={styles.centeredPage}>
        <ScreenContainer maxWidth={720} paddingHorizontal={16}>
          <View style={styles.errorCard}>
            <View style={styles.loadingIcon}>
              <Ionicons
                color={error ? colors.danger : colors.brand}
                name={error ? "cloud-offline-outline" : "person-remove-outline"}
                size={28}
              />
            </View>
            <Text style={styles.stateTitle}>
              {error ? "Perfil indisponível" : "Amigo não encontrado"}
            </Text>
            <Text style={styles.stateText}>
              {error ?? "Essa pessoa pode não fazer mais parte da sua rede."}
            </Text>
            {error ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void loadFriend()}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>Tentar novamente</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={backToFriends}
              style={({ pressed }) => [styles.simpleBackButton, pressed && styles.pressed]}
            >
              <Text style={styles.simpleBackText}>Voltar para amigos</Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const online = (presenceStatuses[friend.id] ?? friend.status) === "ONLINE";

  return (
    <View style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            colors={[colors.brand]}
            onRefresh={() => void refresh()}
            refreshing={refreshing}
            tintColor={colors.brand}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenContainer maxWidth={720} paddingHorizontal={16}>
          <Pressable
            accessibilityLabel="Voltar para amigos"
            accessibilityRole="button"
            onPress={backToFriends}
            style={({ pressed }) => [styles.topBackButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.text} name="arrow-back" size={19} />
            <Text style={styles.topBackText}>Amigos</Text>
          </Pressable>

          <ScreenHeading
            eyebrow="Sua rede"
            subtitle="Presença, proximidade e ações da amizade"
            title="Perfil de amigo"
          />

          <View style={styles.heroCard}>
            <View style={styles.heroAccent} />
            <UserAvatar
              name={friend.name}
              online={online}
              showStatus
              size={104}
              uri={friend.avatar}
            />
            <Text style={styles.name}>{friend.name}</Text>
            <View style={[styles.presenceBadge, !online && styles.presenceBadgeOffline]}>
              <View style={[styles.presenceDot, !online && styles.presenceDotOffline]} />
              <Text style={[styles.presenceText, !online && styles.presenceTextOffline]}>
                {online ? "Online agora" : "Offline"}
              </Text>
            </View>
            {friend.bio?.trim() ? <Text style={styles.bio}>{friend.bio.trim()}</Text> : null}
            <Text numberOfLines={1} style={styles.email}>
              {friend.email}
            </Text>

            <Pressable
              accessibilityLabel={`Enviar mensagem para ${friend.name}`}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/(main)/chat/[id]", params: { id: friend.id } })
              }
              style={({ pressed }) => [styles.chatButton, pressed && styles.chatButtonPressed]}
            >
              <Ionicons color={colors.background} name="chatbubble-outline" size={19} />
              <Text style={styles.chatButtonText}>Enviar mensagem</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>AGORA</Text>
          <View style={styles.infoCard}>
            <InfoRow
              accent={online ? colors.success : colors.textMuted}
              icon={online ? "radio-outline" : "moon-outline"}
              subtitle={
                online
                  ? `${friend.name} está disponível no aplicativo.`
                  : `${friend.name} não está conectado no momento.`
              }
              title="Presença"
              trailing={online ? "Online" : "Offline"}
            />
            <View style={styles.divider} />
            <InfoRow
              accent={distance ? colors.brand : colors.textMuted}
              icon={distance ? "navigate-outline" : "location-outline"}
              subtitle={
                distance
                  ? locationUpdate ?? "Localização compartilhada em tempo real"
                  : "A localização não está sendo compartilhada agora."
              }
              title="Proximidade"
              trailing={distance ?? "Indisponível"}
            />
          </View>

          <Text style={styles.sectionLabel}>SUA PRIVACIDADE</Text>
          <View style={styles.privacyCard}>
            <View style={styles.privacyIcon}>
              <Ionicons
                color={visible ? colors.success : colors.textMuted}
                name={visible ? "eye-outline" : "eye-off-outline"}
                size={21}
              />
            </View>
            <View style={styles.privacyCopy}>
              <Text style={styles.privacyTitle}>
                {visible ? "Você está visível" : "Você está oculto"}
              </Text>
              <Text style={styles.privacyText}>
                {visible
                  ? "Seus amigos podem receber sua presença e proximidade quando disponíveis."
                  : "Sua presença e localização não estão visíveis para sua rede."}
              </Text>
            </View>
            <View style={[styles.visibilityBadge, visible && styles.visibilityBadgeActive]}>
              <Text style={[styles.visibilityText, visible && styles.visibilityTextActive]}>
                {visible ? "Ativa" : "Oculta"}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>GERENCIAR AMIZADE</Text>
          <View style={styles.manageCard}>
            {removeError ? (
              <View style={styles.errorBanner}>
                <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
                <Text style={styles.errorText}>{removeError}</Text>
              </View>
            ) : null}

            {confirmingRemoval ? (
              <View style={styles.confirmationPanel}>
                <View style={styles.confirmationIcon}>
                  <Ionicons color={colors.danger} name="person-remove-outline" size={22} />
                </View>
                <Text style={styles.confirmationTitle}>Remover {friend.name}?</Text>
                <Text style={styles.confirmationText}>
                  Vocês deixarão de ver presença e localização um do outro. Essa ação pode ser
                  refeita com uma nova solicitação de amizade.
                </Text>
                <View style={styles.confirmationActions}>
                  <Pressable
                    accessibilityLabel="Cancelar remoção da amizade"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: removing }}
                    disabled={removing}
                    onPress={() => setConfirmingRemoval(false)}
                    style={({ pressed }) => [
                      styles.cancelButton,
                      pressed && !removing && styles.pressed,
                    ]}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Confirmar remoção de ${friend.name}`}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: removing }}
                    disabled={removing}
                    onPress={() => void handleRemoveFriend()}
                    style={({ pressed }) => [
                      styles.confirmRemoveButton,
                      removing && styles.disabled,
                      pressed && !removing && styles.pressed,
                    ]}
                  >
                    {removing ? (
                      <ActivityIndicator color={colors.text} size="small" />
                    ) : (
                      <Text style={styles.confirmRemoveText}>Remover</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                accessibilityHint="Abre uma confirmação antes de remover"
                accessibilityLabel={`Remover amizade com ${friend.name}`}
                accessibilityRole="button"
                onPress={() => {
                  setRemoveError(null);
                  setConfirmingRemoval(true);
                }}
                style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
              >
                <View style={styles.removeIcon}>
                  <Ionicons color={colors.danger} name="person-remove-outline" size={20} />
                </View>
                <View style={styles.removeCopy}>
                  <Text style={styles.removeTitle}>Remover amizade</Text>
                  <Text style={styles.removeDescription}>
                    Retira esta pessoa da sua rede de amigos.
                  </Text>
                </View>
                <Ionicons color={colors.danger} name="chevron-forward" size={17} />
              </Pressable>
            )}
          </View>
        </ScreenContainer>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  accent,
  icon,
  subtitle,
  title,
  trailing,
}: {
  accent: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  subtitle: string;
  title: string;
  trailing: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons color={accent} name={icon} size={20} />
      </View>
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoSubtitle}>{subtitle}</Text>
      </View>
      <Text numberOfLines={1} style={[styles.infoTrailing, { color: accent }]}>
        {trailing}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  centeredPage: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  scrollContent: { paddingBottom: 64, paddingTop: 18 },
  topBackButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginBottom: 14,
    minHeight: 36,
    paddingRight: 10,
  },
  topBackText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  heroCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    marginTop: 22,
    overflow: "hidden",
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
    ...shadows.floating,
  },
  heroAccent: {
    backgroundColor: colors.brand,
    height: 3,
    left: 24,
    position: "absolute",
    right: 24,
    top: 0,
  },
  name: { color: colors.text, fontFamily: fonts.display, fontSize: 30, marginTop: 17, textAlign: "center" },
  presenceBadge: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radii.pill,
    flexDirection: "row",
    marginTop: 8,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  presenceBadgeOffline: { backgroundColor: colors.elevated },
  presenceDot: { backgroundColor: colors.success, borderRadius: 3, height: 6, marginRight: 6, width: 6 },
  presenceDotOffline: { backgroundColor: colors.textMuted },
  presenceText: { color: colors.success, fontFamily: fonts.bold, fontSize: 10 },
  presenceTextOffline: { color: colors.textMuted },
  bio: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, marginTop: 13, maxWidth: 430, textAlign: "center" },
  email: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 8, maxWidth: "100%" },
  chatButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 48,
    paddingHorizontal: 24,
  },
  chatButtonPressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.99 }] },
  chatButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 13 },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 9,
    marginTop: 24,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: 14,
  },
  infoRow: { alignItems: "center", flexDirection: "row", minHeight: 78, paddingVertical: 12 },
  infoIcon: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.small,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },
  infoCopy: { flex: 1, minWidth: 0 },
  infoTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  infoSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 14, marginTop: 3 },
  infoTrailing: { fontFamily: fonts.bold, fontSize: 9, marginLeft: 10, maxWidth: 92, textAlign: "right" },
  divider: { backgroundColor: colors.border, height: 1, marginLeft: 54 },
  privacyCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 88,
    padding: 14,
  },
  privacyIcon: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.small,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },
  privacyCopy: { flex: 1, minWidth: 0 },
  privacyTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  privacyText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 14, marginTop: 3 },
  visibilityBadge: { backgroundColor: colors.elevated, borderRadius: radii.pill, marginLeft: 9, paddingHorizontal: 9, paddingVertical: 6 },
  visibilityBadgeActive: { backgroundColor: colors.successSoft },
  visibilityText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 8 },
  visibilityTextActive: { color: colors.success },
  manageCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
  },
  removeButton: { alignItems: "center", flexDirection: "row", minHeight: 60 },
  removeIcon: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.small,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },
  removeCopy: { flex: 1, minWidth: 0 },
  removeTitle: { color: colors.danger, fontFamily: fonts.semibold, fontSize: 12 },
  removeDescription: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 9, lineHeight: 14, marginTop: 3 },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.small,
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    padding: 10,
  },
  errorText: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15 },
  confirmationPanel: { alignItems: "center", paddingHorizontal: 6, paddingVertical: 8 },
  confirmationIcon: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  confirmationTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, marginTop: 13, textAlign: "center" },
  confirmationText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 11, lineHeight: 17, marginTop: 6, textAlign: "center" },
  confirmationActions: { flexDirection: "row", gap: 9, marginTop: 16, width: "100%" },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.small,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 43,
  },
  cancelButtonText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 },
  confirmRemoveButton: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: radii.small,
    flex: 1,
    justifyContent: "center",
    minHeight: 43,
  },
  confirmRemoveText: { color: colors.text, fontFamily: fonts.bold, fontSize: 11 },
  errorCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  loadingIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  stateTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 17, marginTop: 16, textAlign: "center" },
  stateText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 6, textAlign: "center" },
  primaryButton: { backgroundColor: colors.brand, borderRadius: radii.small, marginTop: 17, paddingHorizontal: 18, paddingVertical: 11 },
  primaryButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  simpleBackButton: { marginTop: 14, padding: 8 },
  simpleBackText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
});
