import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  type ApiFriend,
  type ApiFriendRequest,
} from "@/services/api";
import { getPresence } from "@/services/socket";
import { usePresenceStore } from "@/store/presence-store";
import { colors, fonts, radii } from "@/theme/tokens";

type FriendFilter = "all" | "online" | "nearby";

function isFriendOnline(
  friend: ApiFriend,
  statuses: Record<string, "ONLINE" | "OFFLINE">,
) {
  return (statuses[friend.id] ?? friend.status) === "ONLINE";
}

function formatDistance(distanceKm?: number, distanceMeters?: number) {
  if (typeof distanceMeters === "number" && Number.isFinite(distanceMeters)) {
    if (distanceMeters < 1000) return `${Math.max(1, Math.round(distanceMeters))} m`;
    return `${(distanceMeters / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })} km`;
  }

  if (typeof distanceKm === "number" && Number.isFinite(distanceKm)) {
    return `${distanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
  }

  return null;
}

export default function FriendsExperience() {
  const presenceStatuses = usePresenceStore((state) => state.statuses);
  const friendLocations = usePresenceStore((state) => state.friendLocations);

  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [requests, setRequests] = useState<ApiFriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FriendFilter>("all");
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    setFriendsError(null);

    try {
      setFriends(await getFriends());
    } catch (requestError) {
      setFriendsError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar seus amigos.",
      );
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    setRequestsError(null);

    try {
      const result = await getFriendRequests();
      setRequests(result.filter((request) => request.status === "PENDING"));
    } catch (requestError) {
      setRequestsError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar as solicitações.",
      );
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    void Promise.allSettled([loadFriends(), loadRequests(), getPresence()]);
  }, [loadFriends, loadRequests]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([loadFriends(), loadRequests(), getPresence()]);
    setRefreshing(false);
  }, [loadFriends, loadRequests]);

  const onlineCount = useMemo(
    () => friends.filter((friend) => isFriendOnline(friend, presenceStatuses)).length,
    [friends, presenceStatuses],
  );

  const nearbyCount = useMemo(
    () => friends.filter((friend) => Boolean(friendLocations[friend.id])).length,
    [friendLocations, friends],
  );

  const filteredFriends = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("pt-BR");

    return friends
      .filter((friend) => {
        const matchesQuery =
          !normalizedQuery ||
          `${friend.name} ${friend.email}`
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedQuery);
        const matchesFilter =
          filter === "all" ||
          (filter === "online" && isFriendOnline(friend, presenceStatuses)) ||
          (filter === "nearby" && Boolean(friendLocations[friend.id]));

        return matchesQuery && matchesFilter;
      })
      .sort((first, second) => {
        const firstOnline = isFriendOnline(first, presenceStatuses);
        const secondOnline = isFriendOnline(second, presenceStatuses);
        if (firstOnline !== secondOnline) return firstOnline ? -1 : 1;

        const firstDistance = friendLocations[first.id]?.distanceMeters ?? Number.MAX_SAFE_INTEGER;
        const secondDistance = friendLocations[second.id]?.distanceMeters ?? Number.MAX_SAFE_INTEGER;
        if (firstDistance !== secondDistance) return firstDistance - secondDistance;

        return first.name.localeCompare(second.name, "pt-BR");
      });
  }, [filter, friendLocations, friends, presenceStatuses, searchQuery]);

  const handleRequest = async (requestId: string, action: "accept" | "reject") => {
    if (processingRequestId) return;

    setProcessingRequestId(requestId);
    setRequestsError(null);

    try {
      if (action === "accept") {
        await acceptFriendRequest(requestId);
        await Promise.all([loadFriends(), loadRequests()]);
      } else {
        await rejectFriendRequest(requestId);
        await loadRequests();
      }
    } catch (requestError) {
      setRequestsError(
        requestError instanceof Error
          ? requestError.message
          : action === "accept"
            ? "Não foi possível aceitar a solicitação."
            : "Não foi possível recusar a solicitação.",
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const hasActiveFilters = searchQuery.trim().length > 0 || filter !== "all";
  const initialLoading = loadingFriends && friends.length === 0;

  return (
    <View style={styles.page}>
      <FlatList
        contentContainerStyle={
          filteredFriends.length > 0 ? styles.listContent : styles.emptyListContent
        }
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <View style={styles.headerSection}>
              <ScreenHeading
                action={
                  <Pressable
                    accessibilityLabel="Abrir convites de grupos"
                    accessibilityRole="button"
                    onPress={() => router.push("/(main)/invites")}
                    style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
                  >
                    <Ionicons color={colors.background} name="mail-outline" size={20} />
                  </Pressable>
                }
                eyebrow="Sua rede"
                subtitle={`${friends.length} ${friends.length === 1 ? "amizade" : "amizades"} · ${onlineCount} online agora`}
                title="Amigos"
              />

              <View style={styles.summaryRow}>
                <SummaryCard icon="radio-outline" label="Online" value={String(onlineCount)} />
                <SummaryCard icon="navigate-outline" label="Por perto" value={String(nearbyCount)} />
                <SummaryCard icon="person-add-outline" label="Pedidos" value={String(requests.length)} />
              </View>

              <View style={styles.searchShell}>
                <Ionicons color={colors.textMuted} name="search" size={18} />
                <TextInput
                  accessibilityLabel="Buscar amigos"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setSearchQuery}
                  placeholder="Buscar por nome ou e-mail"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={searchQuery}
                />
                {searchQuery ? (
                  <Pressable
                    accessibilityLabel="Limpar busca"
                    accessibilityRole="button"
                    onPress={() => setSearchQuery("")}
                  >
                    <Ionicons color={colors.textMuted} name="close-circle" size={19} />
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.filters}>
                <FilterChip
                  count={friends.length}
                  label="Todos"
                  onPress={() => setFilter("all")}
                  selected={filter === "all"}
                />
                <FilterChip
                  count={onlineCount}
                  label="Online"
                  onPress={() => setFilter("online")}
                  selected={filter === "online"}
                />
                <FilterChip
                  count={nearbyCount}
                  label="Por perto"
                  onPress={() => setFilter("nearby")}
                  selected={filter === "nearby"}
                />
              </View>

              {requestsError ? (
                <ErrorBanner message={requestsError} onRetry={() => void loadRequests()} />
              ) : null}

              {loadingRequests && requests.length === 0 ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator color={colors.brand} size="small" />
                  <Text style={styles.inlineLoadingText}>Verificando solicitações...</Text>
                </View>
              ) : requests.length > 0 ? (
                <View style={styles.requestsSection}>
                  <View style={styles.sectionHeadingRow}>
                    <View>
                      <Text style={styles.sectionLabel}>SOLICITAÇÕES</Text>
                      <Text style={styles.sectionDescription}>Pessoas esperando sua resposta</Text>
                    </View>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{requests.length}</Text>
                    </View>
                  </View>

                  {requests.map((request, index) => {
                    const requester = request.requester;
                    const requesterName = requester?.name ?? "Usuário";
                    const processing = processingRequestId === request.id;

                    return (
                      <View key={request.id}>
                        <View style={styles.requestCard}>
                          <UserAvatar
                            name={requesterName}
                            size={50}
                            uri={requester?.avatar}
                          />
                          <View style={styles.requestCopy}>
                            <Text numberOfLines={1} style={styles.requestName}>
                              {requesterName}
                            </Text>
                            <Text style={styles.requestMessage}>quer fazer parte da sua rede</Text>
                            <View style={styles.requestActions}>
                              <Pressable
                                accessibilityLabel={`Aceitar solicitação de ${requesterName}`}
                                accessibilityRole="button"
                                accessibilityState={{ disabled: Boolean(processingRequestId) }}
                                disabled={Boolean(processingRequestId)}
                                onPress={() => void handleRequest(request.id, "accept")}
                                style={({ pressed }) => [
                                  styles.acceptButton,
                                  Boolean(processingRequestId) && styles.disabled,
                                  pressed && !processingRequestId && styles.pressed,
                                ]}
                              >
                                {processing ? (
                                  <ActivityIndicator color={colors.background} size="small" />
                                ) : (
                                  <Text style={styles.acceptButtonText}>Aceitar</Text>
                                )}
                              </Pressable>
                              <Pressable
                                accessibilityLabel={`Recusar solicitação de ${requesterName}`}
                                accessibilityRole="button"
                                accessibilityState={{ disabled: Boolean(processingRequestId) }}
                                disabled={Boolean(processingRequestId)}
                                onPress={() => void handleRequest(request.id, "reject")}
                                style={({ pressed }) => [
                                  styles.rejectButton,
                                  Boolean(processingRequestId) && styles.disabled,
                                  pressed && !processingRequestId && styles.pressed,
                                ]}
                              >
                                <Text style={styles.rejectButtonText}>Recusar</Text>
                              </Pressable>
                            </View>
                          </View>
                        </View>
                        {index < requests.length - 1 ? <View style={styles.requestDivider} /> : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {friendsError ? (
                <ErrorBanner message={friendsError} onRetry={() => void loadFriends()} />
              ) : null}

              {filteredFriends.length > 0 ? (
                <View style={styles.listHeading}>
                  <Text style={styles.sectionLabel}>SUA REDE</Text>
                  <Text style={styles.sectionDescription}>
                    {filteredFriends.length} {filteredFriends.length === 1 ? "pessoa" : "pessoas"}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScreenContainer>
        }
        ListEmptyComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            {initialLoading ? (
              <StateCard
                loading
                message="Sincronizando sua rede e o status de presença."
                title="Carregando amigos"
              />
            ) : hasActiveFilters ? (
              <StateCard
                action="Limpar filtros"
                icon="search-outline"
                message="Tente outro nome ou veja todos os seus amigos."
                onPress={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
                title="Nenhum resultado"
              />
            ) : friendsError ? (
              <StateCard
                action="Tentar novamente"
                icon="cloud-offline-outline"
                message="Não foi possível atualizar sua rede agora."
                onPress={() => void loadFriends()}
                title="Amigos indisponíveis"
              />
            ) : (
              <StateCard
                icon="people-outline"
                message="Quando suas solicitações forem aceitas, as pessoas aparecerão aqui."
                title="Sua rede começa aqui"
              />
            )}
          </ScreenContainer>
        }
        refreshControl={
          <RefreshControl
            colors={[colors.brand]}
            onRefresh={() => void refresh()}
            refreshing={refreshing}
            tintColor={colors.brand}
          />
        }
        renderItem={({ item }) => {
          const online = isFriendOnline(item, presenceStatuses);
          const location = friendLocations[item.id];
          const distance = formatDistance(location?.distanceKm, location?.distanceMeters);

          return (
            <ScreenContainer maxWidth={720} paddingHorizontal={16}>
              <Pressable
                accessibilityHint="Abre os detalhes, presença e ações desta amizade"
                accessibilityLabel={`Abrir perfil de ${item.name}`}
                accessibilityRole="button"
                onPress={() =>
                  router.push({ pathname: "/(main)/friend/[id]", params: { id: item.id } })
                }
                style={({ pressed }) => [styles.friendCard, pressed && styles.cardPressed]}
              >
                <UserAvatar
                  name={item.name}
                  online={online}
                  showStatus
                  size={56}
                  uri={item.avatar}
                />
                <View style={styles.friendCopy}>
                  <Text numberOfLines={1} style={styles.friendName}>
                    {item.name}
                  </Text>
                  <View style={styles.friendMetaRow}>
                    <View style={[styles.presenceDot, !online && styles.presenceDotOffline]} />
                    <Text style={[styles.friendStatus, online && styles.friendStatusOnline]}>
                      {online ? "Online agora" : "Offline"}
                    </Text>
                    {distance ? (
                      <>
                        <Text style={styles.metaSeparator}>·</Text>
                        <Ionicons color={colors.textMuted} name="navigate-outline" size={13} />
                        <Text style={styles.friendDistance}>{distance}</Text>
                      </>
                    ) : null}
                  </View>
                  <Text numberOfLines={1} style={styles.friendBio}>
                    {item.bio?.trim() || "Amigo da sua rede no Hoje é Onde"}
                  </Text>
                </View>
                <View style={styles.cardArrow}>
                  <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
                </View>
              </Pressable>
            </ScreenContainer>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Ionicons color={colors.brand} name={icon} size={18} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text numberOfLines={1} style={styles.summaryLabel}>
        {label}
      </Text>
    </View>
  );
}

function FilterChip({
  count,
  label,
  onPress,
  selected,
}: {
  count: number;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        selected && styles.filterChipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>{label}</Text>
      <View style={[styles.filterCount, selected && styles.filterCountSelected]}>
        <Text style={[styles.filterCountText, selected && styles.filterCountTextSelected]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.errorBanner}>
      <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
      <Text style={styles.errorText}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onRetry}>
        <Text style={styles.retryText}>Tentar novamente</Text>
      </Pressable>
    </View>
  );
}

function StateCard({
  action,
  icon = "people-outline",
  loading = false,
  message,
  onPress,
  title,
}: {
  action?: string;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  message: string;
  onPress?: () => void;
  title: string;
}) {
  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        {loading ? (
          <ActivityIndicator color={colors.brand} size="small" />
        ) : (
          <Ionicons color={colors.brand} name={icon} size={28} />
        )}
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
      {action && onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.stateAction, pressed && styles.pressed]}
        >
          <Text style={styles.stateActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  listContent: { paddingBottom: 116 },
  emptyListContent: { flexGrow: 1, paddingBottom: 116 },
  headerSection: { paddingBottom: 8, paddingTop: 24 },
  headerAction: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  summaryRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  summaryCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flex: 1,
    minHeight: 82,
    paddingHorizontal: 6,
    paddingVertical: 10,
  },
  summaryValue: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, marginTop: 4 },
  summaryLabel: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 9, marginTop: 2 },
  searchShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 11 },
  filterChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  filterChipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterLabel: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 },
  filterLabelSelected: { color: colors.background },
  filterCount: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: 9,
    justifyContent: "center",
    minHeight: 18,
    minWidth: 18,
    paddingHorizontal: 4,
  },
  filterCountSelected: { backgroundColor: "rgba(11, 13, 15, 0.14)" },
  filterCountText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 8 },
  filterCountTextSelected: { color: colors.background },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(239, 125, 125, 0.2)",
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 11,
  },
  errorText: {
    color: colors.textSecondary,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  retryText: { color: colors.danger, fontFamily: fonts.bold, fontSize: 10 },
  inlineLoading: { alignItems: "center", flexDirection: "row", gap: 9, marginTop: 16 },
  inlineLoadingText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11 },
  requestsSection: {
    backgroundColor: colors.surface,
    borderColor: colors.brandBorder,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 18,
    overflow: "hidden",
    padding: 14,
  },
  sectionHeadingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  sectionDescription: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  countBadge: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    minWidth: 26,
    paddingHorizontal: 7,
  },
  countBadgeText: { color: colors.background, fontFamily: fonts.bold, fontSize: 10 },
  requestCard: { alignItems: "flex-start", flexDirection: "row", paddingVertical: 10 },
  requestCopy: { flex: 1, marginLeft: 12, minWidth: 0 },
  requestName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  requestMessage: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  requestActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  acceptButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.small,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  acceptButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  rejectButton: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.small,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  rejectButtonText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 },
  requestDivider: { backgroundColor: colors.border, height: 1, marginLeft: 62 },
  listHeading: { marginBottom: 4, marginTop: 22 },
  friendCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    minHeight: 86,
    padding: 14,
  },
  cardPressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.99 }] },
  friendCopy: { flex: 1, marginLeft: 13, minWidth: 0 },
  friendName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  friendMetaRow: { alignItems: "center", flexDirection: "row", marginTop: 5 },
  presenceDot: { backgroundColor: colors.success, borderRadius: 3, height: 6, marginRight: 5, width: 6 },
  presenceDotOffline: { backgroundColor: colors.textMuted },
  friendStatus: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10 },
  friendStatusOnline: { color: colors.success },
  metaSeparator: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginHorizontal: 6 },
  friendDistance: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10, marginLeft: 3 },
  friendBio: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 5 },
  cardArrow: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    marginLeft: 10,
    width: 36,
  },
  stateCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 230,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  stateIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  stateTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16, marginTop: 16, textAlign: "center" },
  stateText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 6, textAlign: "center" },
  stateAction: { backgroundColor: colors.brand, borderRadius: radii.small, marginTop: 16, paddingHorizontal: 18, paddingVertical: 11 },
  stateActionText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
});
