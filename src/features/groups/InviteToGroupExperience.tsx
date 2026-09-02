import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getFriends, type ApiFriend } from "@/services/api";
import { useGroupStore } from "@/store/group-store";
import { useInviteStore } from "@/store/invite-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";

type Feedback = { message: string; type: "error" | "success" } | null;

export default function InviteToGroupExperience() {
  const { groupId } = useLocalSearchParams<{ groupId?: string | string[] }>();
  const resolvedGroupId = Array.isArray(groupId) ? groupId[0] : groupId;

  const groups = useGroupStore((state) => state.groups);
  const receivedInvites = useInviteStore((state) => state.invites);
  const sentInvites = useInviteStore((state) => state.sentInvites);
  const loadSentInvites = useInviteStore((state) => state.loadSentInvites);
  const sendInvite = useInviteStore((state) => state.sendInvite);
  const user = useUserStore((state) => state.user);
  const presenceStatuses = usePresenceStore((state) => state.statuses);

  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sentUserIds, setSentUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const group = groups.find((item) => item.id === resolvedGroupId);

  const loadData = useCallback(async () => {
    setLoading(true);
    setDataError(null);

    const [friendsResult, invitesResult] = await Promise.allSettled([
      getFriends(),
      loadSentInvites(),
    ]);

    if (friendsResult.status === "fulfilled") {
      setFriends(friendsResult.value);
    }

    if (friendsResult.status === "rejected" || invitesResult.status === "rejected") {
      const failure =
        friendsResult.status === "rejected"
          ? friendsResult.reason
          : invitesResult.status === "rejected"
            ? invitesResult.reason
            : undefined;
      setDataError(
        failure instanceof Error
          ? failure.message
          : "Não foi possível carregar seus amigos e convites enviados.",
      );
    }

    setLoading(false);
  }, [loadSentInvites]);

  useEffect(() => {
    if (resolvedGroupId) void loadData();
  }, [loadData, resolvedGroupId]);

  const pendingUserIds = useMemo(() => {
    if (!resolvedGroupId) return new Set<string>();

    return new Set(
      [...receivedInvites, ...sentInvites]
        .filter(
          (invite) => invite.groupId === resolvedGroupId && invite.status === "pending",
        )
        .map((invite) => invite.toUserId),
    );
  }, [receivedInvites, resolvedGroupId, sentInvites]);

  const eligibleFriends = useMemo(
    () =>
      friends
        .filter(
          (friend) =>
            friend.id !== user?.id &&
            !pendingUserIds.has(friend.id) &&
            !sentUserIds.includes(friend.id),
        )
        .sort((first, second) => {
          const firstOnline = (presenceStatuses[first.id] ?? first.status) === "ONLINE";
          const secondOnline = (presenceStatuses[second.id] ?? second.status) === "ONLINE";
          if (firstOnline !== secondOnline) return firstOnline ? -1 : 1;
          return first.name.localeCompare(second.name, "pt-BR");
        }),
    [friends, pendingUserIds, presenceStatuses, sentUserIds, user?.id],
  );

  const filteredFriends = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return eligibleFriends;

    return eligibleFriends.filter((friend) =>
      `${friend.name} ${friend.email}`.toLocaleLowerCase("pt-BR").includes(normalized),
    );
  }, [eligibleFriends, query]);

  const alreadyInvitedCount = useMemo(
    () =>
      friends.filter(
        (friend) => pendingUserIds.has(friend.id) || sentUserIds.includes(friend.id),
      ).length,
    [friends, pendingUserIds, sentUserIds],
  );

  const allVisibleSelected =
    filteredFriends.length > 0 && filteredFriends.every((friend) => selectedIds.includes(friend.id));
  const renderedFriends = loading || dataError ? [] : filteredFriends;

  const toggleFriend = (friendId: string) => {
    if (submitting) return;
    setFeedback(null);
    setSelectedIds((current) =>
      current.includes(friendId)
        ? current.filter((id) => id !== friendId)
        : [...current, friendId],
    );
  };

  const toggleAllVisible = () => {
    if (submitting || filteredFriends.length === 0) return;
    const visibleIds = filteredFriends.map((friend) => friend.id);

    setSelectedIds((current) => {
      if (visibleIds.every((id) => current.includes(id))) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
    setFeedback(null);
  };

  const sendSelectedInvites = async () => {
    if (!resolvedGroupId || !user || selectedIds.length === 0 || submitting) return;

    setSubmitting(true);
    setFeedback(null);
    const successfulIds: string[] = [];
    const failedNames: string[] = [];

    for (const [index, friendId] of selectedIds.entries()) {
      const friend = friends.find((item) => item.id === friendId);

      try {
        await sendInvite({
          fromUserId: user.id,
          groupId: resolvedGroupId,
          id: `invite-${Date.now()}-${index}-${friendId}`,
          status: "pending",
          toUserId: friendId,
        });
        successfulIds.push(friendId);
      } catch {
        failedNames.push(friend?.name ?? "um amigo");
      }
    }

    if (successfulIds.length > 0) {
      setSentUserIds((current) => Array.from(new Set([...current, ...successfulIds])));
      setSelectedIds((current) => current.filter((id) => !successfulIds.includes(id)));
    }

    if (failedNames.length > 0) {
      setFeedback({
        message:
          successfulIds.length > 0
            ? `${successfulIds.length} convite(s) enviado(s). Não foi possível enviar para ${failedNames.join(", ")}.`
            : `Não foi possível enviar para ${failedNames.join(", ")}. Tente novamente.`,
        type: "error",
      });
    } else {
      setFeedback({
        message: `${successfulIds.length} ${successfulIds.length === 1 ? "convite enviado" : "convites enviados"} com sucesso.`,
        type: "success",
      });
    }

    setSubmitting(false);
  };

  const goBack = () => {
    if (!submitting) router.replace("/(main)/chat");
  };

  if (!resolvedGroupId || !user) {
    return (
      <View style={styles.page}>
        <ScreenContainer maxWidth={720} paddingHorizontal={16}>
          <View style={styles.invalidState}>
            <View style={styles.stateIcon}>
              <Ionicons color={colors.brand} name="warning-outline" size={30} />
            </View>
            <Text style={styles.stateTitle}>
              {resolvedGroupId ? "Sessão não encontrada" : "Grupo não informado"}
            </Text>
            <Text style={styles.stateText}>
              {resolvedGroupId
                ? "Entre novamente para enviar convites aos seus amigos."
                : "Abra um grupo e tente novamente para escolher quem será convidado."}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={goBack}
              style={({ pressed }) => [styles.stateAction, pressed && styles.pressed]}
            >
              <Text style={styles.stateActionText}>Voltar para grupos</Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <FlatList
        contentContainerStyle={
          renderedFriends.length > 0 ? styles.listContent : styles.emptyListContent
        }
        data={renderedFriends}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <View style={styles.headerSection}>
              <Pressable
                accessibilityLabel="Voltar para grupos"
                accessibilityRole="button"
                disabled={submitting}
                hitSlop={8}
                onPress={goBack}
                style={({ pressed }) => [styles.backButton, pressed && !submitting && styles.pressed]}
              >
                <Ionicons color={colors.text} name="arrow-back" size={20} />
                <Text style={styles.backText}>Grupos</Text>
              </Pressable>

              <ScreenHeading
                eyebrow="Monte a turma"
                subtitle={
                  group
                    ? `Escolha quem vai receber um convite para “${group.name}”.`
                    : "Escolha os amigos que vão receber o convite."
                }
                title="Convidar amigos"
              />

              <View style={styles.summaryCard}>
                <View style={styles.summaryIcon}>
                  <Ionicons color={colors.brand} name="paper-plane-outline" size={21} />
                </View>
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryTitle}>
                    {selectedIds.length > 0
                      ? `${selectedIds.length} ${selectedIds.length === 1 ? "amigo selecionado" : "amigos selecionados"}`
                      : "Selecione sua companhia"}
                  </Text>
                  <Text style={styles.summaryText}>
                    {alreadyInvitedCount > 0
                      ? `${alreadyInvitedCount} já ${alreadyInvitedCount === 1 ? "possui" : "possuem"} convite pendente.`
                      : "Você pode escolher várias pessoas de uma vez."}
                  </Text>
                </View>
              </View>

              <View style={styles.searchShell}>
                <Ionicons color={colors.textMuted} name="search" size={18} />
                <TextInput
                  accessibilityLabel="Buscar amigos"
                  autoCapitalize="none"
                  editable={!submitting}
                  onChangeText={setQuery}
                  placeholder="Buscar por nome ou e-mail"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={query}
                />
                {query ? (
                  <Pressable
                    accessibilityLabel="Limpar busca"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setQuery("")}
                  >
                    <Ionicons color={colors.textMuted} name="close-circle" size={18} />
                  </Pressable>
                ) : null}
              </View>

              {feedback ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={[
                    styles.feedback,
                    feedback.type === "success" && styles.feedbackSuccess,
                  ]}
                >
                  <Ionicons
                    color={feedback.type === "success" ? colors.success : colors.danger}
                    name={feedback.type === "success" ? "checkmark-circle-outline" : "alert-circle-outline"}
                    size={19}
                  />
                  <Text
                    style={[
                      styles.feedbackText,
                      feedback.type === "success" && styles.feedbackTextSuccess,
                    ]}
                  >
                    {feedback.message}
                  </Text>
                </View>
              ) : null}

              {!loading && !dataError && filteredFriends.length > 0 ? (
                <View style={styles.listHeaderRow}>
                  <Text style={styles.sectionLabel}>
                    {filteredFriends.length} {filteredFriends.length === 1 ? "AMIGO DISPONÍVEL" : "AMIGOS DISPONÍVEIS"}
                  </Text>
                  <Pressable
                    accessibilityLabel={allVisibleSelected ? "Desmarcar todos" : "Selecionar todos"}
                    accessibilityRole="button"
                    disabled={submitting}
                    onPress={toggleAllVisible}
                  >
                    <Text style={styles.selectAllText}>
                      {allVisibleSelected ? "Desmarcar todos" : "Selecionar todos"}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </ScreenContainer>
        }
        ListEmptyComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            {loading ? (
              <EmptyFriends
                icon="sync-outline"
                loading
                message="Buscando sua lista de amigos e os convites já enviados."
                title="Atualizando amigos"
              />
            ) : dataError ? (
              <EmptyFriends
                action="Tentar novamente"
                icon="cloud-offline-outline"
                message={dataError}
                onPress={() => void loadData()}
                title="Não foi possível carregar"
              />
            ) : query ? (
              <EmptyFriends
                action="Limpar busca"
                icon="search-outline"
                message="Tente buscar pelo nome ou e-mail de outro amigo."
                onPress={() => setQuery("")}
                title="Nenhum amigo encontrado"
              />
            ) : (
              <EmptyFriends
                action="Voltar para grupos"
                icon="checkmark-done-outline"
                message="Todos os amigos disponíveis já possuem um convite pendente para este grupo."
                onPress={goBack}
                title="Todo mundo foi convidado"
              />
            )}
          </ScreenContainer>
        }
        renderItem={({ item }) => {
          const online = (presenceStatuses[item.id] ?? item.status) === "ONLINE";
          const selected = selectedIds.includes(item.id);

          return (
            <ScreenContainer maxWidth={720} paddingHorizontal={16}>
              <Pressable
                accessibilityLabel={`${selected ? "Desmarcar" : "Selecionar"} ${item.name}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled: submitting }}
                disabled={submitting}
                onPress={() => toggleFriend(item.id)}
                style={({ pressed }) => [
                  styles.friendCard,
                  selected && styles.friendCardSelected,
                  pressed && !submitting && styles.cardPressed,
                ]}
              >
                <UserAvatar
                  name={item.name}
                  online={online}
                  showStatus
                  size={54}
                  uri={item.avatar}
                />
                <View style={styles.friendCopy}>
                  <Text numberOfLines={1} style={styles.friendName}>
                    {item.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.friendEmail}>
                    {item.email}
                  </Text>
                  <Text style={[styles.presenceText, online && styles.presenceTextOnline]}>
                    {online ? "Online agora" : "Offline"}
                  </Text>
                </View>
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected ? (
                    <Ionicons color={colors.background} name="checkmark" size={16} />
                  ) : null}
                </View>
              </Pressable>
            </ScreenContainer>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      {selectedIds.length > 0 ? (
        <View style={styles.footerShell}>
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <Pressable
              accessibilityLabel={
                submitting
                  ? "Enviando convites"
                  : `Enviar ${selectedIds.length} ${selectedIds.length === 1 ? "convite" : "convites"}`
              }
              accessibilityRole="button"
              accessibilityState={{ busy: submitting, disabled: submitting }}
              disabled={submitting}
              onPress={() => void sendSelectedInvites()}
              style={({ pressed }) => [
                styles.sendButton,
                submitting && styles.buttonDisabled,
                pressed && !submitting && styles.primaryPressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Ionicons color={colors.background} name="paper-plane" size={18} />
              )}
              <Text style={styles.sendButtonText}>
                {submitting
                  ? "Enviando convites..."
                  : `Enviar ${selectedIds.length} ${selectedIds.length === 1 ? "convite" : "convites"}`}
              </Text>
            </Pressable>
          </ScreenContainer>
        </View>
      ) : null}
    </View>
  );
}

function EmptyFriends({
  action,
  icon,
  loading = false,
  message,
  onPress,
  title,
}: {
  action?: string;
  icon: ComponentProps<typeof Ionicons>["name"];
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
          <Ionicons color={colors.brand} name={icon} size={29} />
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
  listContent: { paddingBottom: 132 },
  emptyListContent: { flexGrow: 1, paddingBottom: 132 },
  headerSection: { paddingBottom: 12, paddingTop: 16 },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginBottom: 18,
    minHeight: 36,
  },
  backText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  summaryCard: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 20,
    padding: 14,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.small,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  summaryText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15, marginTop: 3 },
  searchShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 12,
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
  feedback: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(239, 125, 125, 0.2)",
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
    padding: 11,
  },
  feedbackSuccess: { backgroundColor: colors.successSoft, borderColor: "rgba(106, 191, 160, 0.22)" },
  feedbackText: { color: colors.danger, flex: 1, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15 },
  feedbackTextSuccess: { color: colors.success },
  listHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  sectionLabel: { color: colors.textMuted, flex: 1, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.1 },
  selectAllText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 10, marginLeft: 10 },
  friendCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 9,
    minHeight: 82,
    padding: 13,
  },
  friendCardSelected: { backgroundColor: colors.brandSoft, borderColor: colors.brandBorder },
  friendCopy: { flex: 1, marginLeft: 13, minWidth: 0 },
  friendName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  friendEmail: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  presenceText: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 9, marginTop: 5 },
  presenceTextOnline: { color: colors.success },
  checkbox: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 2,
    height: 24,
    justifyContent: "center",
    marginLeft: 12,
    width: 24,
  },
  checkboxSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  footerShell: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 14,
    paddingTop: 10,
    position: "absolute",
    right: 0,
    ...shadows.floating,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 52,
  },
  sendButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 13 },
  invalidState: { alignItems: "center", justifyContent: "center", minHeight: 560, paddingHorizontal: 20 },
  emptyState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 24,
    minHeight: 280,
    padding: 28,
  },
  stateIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  stateTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 25, marginTop: 18, textAlign: "center" },
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 340,
    textAlign: "center",
  },
  stateAction: {
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  stateActionText: { color: colors.background, fontFamily: fonts.bold, fontSize: 12 },
  buttonDisabled: { opacity: 0.58 },
  primaryPressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.99 }] },
  cardPressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.995 }] },
  pressed: { opacity: 0.76 },
});
