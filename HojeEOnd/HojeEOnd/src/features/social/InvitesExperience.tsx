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
import { useGroupStore } from "@/store/group-store";
import { useInviteStore } from "@/store/invite-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";
import type { Invite } from "@/types/invite";

type InviteFilter = "received" | "sent";

function formatInviteDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function statusPresentation(status: Invite["status"]) {
  if (status === "accepted") {
    return { color: colors.success, icon: "checkmark-circle-outline" as const, label: "Aceito" };
  }

  if (status === "rejected") {
    return { color: colors.danger, icon: "close-circle-outline" as const, label: "Recusado" };
  }

  return { color: colors.brand, icon: "time-outline" as const, label: "Pendente" };
}

export default function InvitesExperience() {
  const user = useUserStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);
  const loadGroups = useGroupStore((state) => state.loadGroups);
  const groupError = useGroupStore((state) => state.error);

  const allInvites = useInviteStore((state) => state.invites);
  const sentInvites = useInviteStore((state) => state.sentInvites);
  const loading = useInviteStore((state) => state.loading);
  const error = useInviteStore((state) => state.error);
  const processingInviteIds = useInviteStore((state) => state.processingInviteIds);
  const loadInvites = useInviteStore((state) => state.loadInvites);
  const loadSentInvites = useInviteStore((state) => state.loadSentInvites);
  const acceptInvite = useInviteStore((state) => state.acceptInvite);
  const rejectInvite = useInviteStore((state) => state.rejectInvite);
  const clearError = useInviteStore((state) => state.clearError);

  const [filter, setFilter] = useState<InviteFilter>("received");
  const [query, setQuery] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const syncInvites = useCallback(async () => {
    if (!user) return;

    await Promise.allSettled([loadInvites(), loadSentInvites(), loadGroups()]);
  }, [loadGroups, loadInvites, loadSentInvites, user]);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      await syncInvites();
      if (active) setInitializing(false);
    };

    if (user) {
      void initialize();
    } else {
      setInitializing(false);
    }

    return () => {
      active = false;
    };
  }, [syncInvites, user]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setActionError(null);
    clearError();
    await syncInvites();
    setRefreshing(false);
  }, [clearError, syncInvites]);

  const pendingInvites = useMemo(() => {
    if (!user) return [];
    return allInvites.filter(
      (invite) => invite.status === "pending" && invite.toUserId === user.id,
    );
  }, [allInvites, user]);

  const visibleInvites = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    const source = filter === "received" ? pendingInvites : sentInvites;

    return source.filter((invite) => {
      const person = filter === "received" ? invite.sender : invite.receiver;
      const searchable = `${person?.name ?? ""} ${person?.email ?? ""} ${invite.group?.name ?? ""}`;
      return !normalizedQuery || searchable.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
    });
  }, [filter, pendingInvites, query, sentInvites]);

  const handleInvite = async (inviteId: string, action: "accept" | "reject") => {
    if (processingInviteIds.length > 0) return;

    setActionError(null);
    clearError();

    try {
      if (action === "accept") {
        await acceptInvite(inviteId);
      } else {
        await rejectInvite(inviteId);
      }
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : action === "accept"
            ? "Não foi possível aceitar o convite."
            : "Não foi possível recusar o convite.",
      );
    }
  };

  if (!user) {
    return (
      <View style={styles.page}>
        <ScreenContainer maxWidth={720} paddingHorizontal={16}>
          <View style={styles.signedOutState}>
            <View style={styles.stateIcon}>
              <Ionicons color={colors.brand} name="lock-closed-outline" size={28} />
            </View>
            <Text style={styles.stateTitle}>Sessão não encontrada</Text>
            <Text style={styles.stateText}>
              Entre novamente para visualizar e responder aos convites.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/(auth)/login")}
              style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            >
              <Text style={styles.primaryActionText}>Ir para o login</Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const currentError = actionError ?? error ?? groupError;
  const hasQuery = query.trim().length > 0;

  return (
    <View style={styles.page}>
      <FlatList
        contentContainerStyle={
          visibleInvites.length > 0 ? styles.listContent : styles.emptyListContent
        }
        data={visibleInvites}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <View style={styles.headerSection}>
              <Pressable
                accessibilityLabel="Voltar para grupos"
                accessibilityRole="button"
                onPress={() => router.replace("/(main)/chat")}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons color={colors.text} name="arrow-back" size={19} />
                <Text style={styles.backButtonText}>Grupos</Text>
              </Pressable>

              <ScreenHeading
                eyebrow="Organização"
                subtitle={
                  pendingInvites.length > 0
                    ? `${pendingInvites.length} ${pendingInvites.length === 1 ? "convite pede" : "convites pedem"} sua resposta`
                    : "Acompanhe convites recebidos e enviados"
                }
                title="Convites"
              />

              <View style={styles.searchShell}>
                <Ionicons color={colors.textMuted} name="search" size={18} />
                <TextInput
                  accessibilityLabel="Buscar convites"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setQuery}
                  placeholder="Buscar pessoa ou grupo"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={query}
                />
                {query ? (
                  <Pressable
                    accessibilityLabel="Limpar busca"
                    accessibilityRole="button"
                    onPress={() => setQuery("")}
                  >
                    <Ionicons color={colors.textMuted} name="close-circle" size={19} />
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.filters}>
                <FilterChip
                  count={pendingInvites.length}
                  icon="mail-unread-outline"
                  label="Recebidos"
                  onPress={() => setFilter("received")}
                  selected={filter === "received"}
                />
                <FilterChip
                  count={sentInvites.length}
                  icon="paper-plane-outline"
                  label="Enviados"
                  onPress={() => setFilter("sent")}
                  selected={filter === "sent"}
                />
              </View>

              {currentError ? (
                <View style={styles.errorBanner}>
                  <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
                  <Text style={styles.errorText}>{currentError}</Text>
                  <Pressable accessibilityRole="button" onPress={() => void refresh()}>
                    <Text style={styles.retryText}>Tentar novamente</Text>
                  </Pressable>
                </View>
              ) : null}

              {visibleInvites.length > 0 ? (
                <View style={styles.listHeading}>
                  <Text style={styles.sectionLabel}>
                    {filter === "received" ? "AGUARDANDO VOCÊ" : "HISTÓRICO DE ENVIOS"}
                  </Text>
                  <Text style={styles.sectionDescription}>
                    {visibleInvites.length} {visibleInvites.length === 1 ? "convite" : "convites"}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScreenContainer>
        }
        ListEmptyComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            {initializing && loading ? (
              <EmptyInviteState
                loading
                message="Buscando convites e informações dos grupos."
                title="Atualizando convites"
              />
            ) : hasQuery ? (
              <EmptyInviteState
                action="Limpar busca"
                icon="search-outline"
                message="Tente buscar por outro nome de pessoa ou grupo."
                onPress={() => setQuery("")}
                title="Nenhum resultado"
              />
            ) : filter === "received" ? (
              <EmptyInviteState
                action="Voltar para grupos"
                icon="mail-open-outline"
                message="Novos convites de grupo aparecerão aqui quando forem enviados para você."
                onPress={() => router.replace("/(main)/chat")}
                title="Tudo respondido"
              />
            ) : (
              <EmptyInviteState
                action="Ver grupos"
                icon="paper-plane-outline"
                message="Convide amigos pela página de um grupo para acompanhar o envio aqui."
              onPress={() => router.replace("/(main)/chat")}
                title="Nenhum convite enviado"
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
          const received = filter === "received";
          const person = received ? item.sender : item.receiver;
          const personName = person?.name ?? (received ? "Usuário" : "Destinatário");
          const groupName = item.group?.name ?? "Grupo";
          const group = groups.find((entry) => entry.id === item.groupId);
          const memberCount = group?.members.length;
          const processing = processingInviteIds.includes(item.id);
          const status = statusPresentation(item.status);
          const date = formatInviteDate(item.createdAt);

          return (
            <ScreenContainer maxWidth={720} paddingHorizontal={16}>
              <View style={styles.inviteCard}>
                <View style={styles.cardTopRow}>
                  <UserAvatar name={personName} size={52} uri={person?.avatar} />
                  <View style={styles.cardCopy}>
                    <Text numberOfLines={1} style={styles.personName}>
                      {personName}
                    </Text>
                    <Text style={styles.inviteDescription}>
                      {received ? "convidou você para participar" : "foi convidado por você"}
                    </Text>
                  </View>
                  {date ? <Text style={styles.dateText}>{date}</Text> : null}
                </View>

                <View style={styles.groupPanel}>
                  <View style={styles.groupIcon}>
                    <Ionicons color={colors.brand} name="people-outline" size={21} />
                  </View>
                  <View style={styles.groupCopy}>
                    <Text numberOfLines={1} style={styles.groupName}>
                      {groupName}
                    </Text>
                    <Text style={styles.groupMeta}>
                      {typeof memberCount === "number"
                        ? `${memberCount} ${memberCount === 1 ? "membro" : "membros"}`
                        : "Informações recebidas do servidor"}
                    </Text>
                  </View>
                  {!received ? (
                    <View style={[styles.statusBadge, { borderColor: status.color }]}>
                      <Ionicons color={status.color} name={status.icon} size={14} />
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  ) : null}
                </View>

                {received ? (
                  <View style={styles.actionRow}>
                    <Pressable
                      accessibilityLabel={`Aceitar convite para ${groupName}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: processingInviteIds.length > 0 }}
                      disabled={processingInviteIds.length > 0}
                      onPress={() => void handleInvite(item.id, "accept")}
                      style={({ pressed }) => [
                        styles.acceptButton,
                        processingInviteIds.length > 0 && styles.disabled,
                        pressed && processingInviteIds.length === 0 && styles.pressed,
                      ]}
                    >
                      {processing ? (
                        <ActivityIndicator color={colors.background} size="small" />
                      ) : (
                        <>
                          <Ionicons color={colors.background} name="checkmark" size={17} />
                          <Text style={styles.acceptButtonText}>Aceitar</Text>
                        </>
                      )}
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Recusar convite para ${groupName}`}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: processingInviteIds.length > 0 }}
                      disabled={processingInviteIds.length > 0}
                      onPress={() => void handleInvite(item.id, "reject")}
                      style={({ pressed }) => [
                        styles.rejectButton,
                        processingInviteIds.length > 0 && styles.disabled,
                        pressed && processingInviteIds.length === 0 && styles.pressed,
                      ]}
                    >
                      <Ionicons color={colors.textSecondary} name="close" size={17} />
                      <Text style={styles.rejectButtonText}>Recusar</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </ScreenContainer>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function FilterChip({
  count,
  icon,
  label,
  onPress,
  selected,
}: {
  count: number;
  icon: React.ComponentProps<typeof Ionicons>["name"];
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
      <Ionicons
        color={selected ? colors.background : colors.textSecondary}
        name={icon}
        size={15}
      />
      <Text style={[styles.filterLabel, selected && styles.filterLabelSelected]}>{label}</Text>
      <View style={[styles.filterCount, selected && styles.filterCountSelected]}>
        <Text style={[styles.filterCountText, selected && styles.filterCountTextSelected]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyInviteState({
  action,
  icon = "mail-outline",
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
    <View style={styles.emptyState}>
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
          style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
        >
          <Text style={styles.primaryActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  listContent: { paddingBottom: 96 },
  emptyListContent: { flexGrow: 1, paddingBottom: 96 },
  headerSection: { paddingBottom: 10, paddingTop: 18 },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginBottom: 14,
    minHeight: 36,
    paddingRight: 10,
  },
  backButtonText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  searchShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 20,
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
  filters: { flexDirection: "row", gap: 8, marginTop: 11 },
  filterChip: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 38,
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
  errorText: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15 },
  retryText: { color: colors.danger, fontFamily: fonts.bold, fontSize: 10 },
  listHeading: { marginBottom: 4, marginTop: 22 },
  sectionLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  sectionDescription: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  inviteCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginBottom: 11,
    padding: 15,
  },
  cardTopRow: { alignItems: "center", flexDirection: "row" },
  cardCopy: { flex: 1, marginLeft: 12, minWidth: 0 },
  personName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  inviteDescription: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  dateText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 9, marginLeft: 8 },
  groupPanel: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.medium,
    flexDirection: "row",
    marginTop: 14,
    minHeight: 62,
    padding: 10,
  },
  groupIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  groupCopy: { flex: 1, marginLeft: 10, minWidth: 0 },
  groupName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  groupMeta: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 9, marginTop: 3 },
  statusBadge: {
    alignItems: "center",
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: { fontFamily: fonts.bold, fontSize: 8 },
  actionRow: { flexDirection: "row", gap: 9, marginTop: 13 },
  acceptButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.small,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 43,
  },
  acceptButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  rejectButton: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.small,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 43,
  },
  rejectButtonText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 240,
    paddingHorizontal: 24,
    paddingVertical: 34,
  },
  signedOutState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 560,
    paddingHorizontal: 24,
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
  primaryAction: { backgroundColor: colors.brand, borderRadius: radii.small, marginTop: 17, paddingHorizontal: 18, paddingVertical: 11 },
  primaryActionText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
});
