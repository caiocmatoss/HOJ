import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  getFriends,
  getGroup,
  getGroupMembers,
  getVenue,
  type ApiFriend,
  type ApiGroupMember,
  type ApiVenue,
} from "@/services/api";
import { useGroupStore } from "@/store/group-store";
import { useInviteStore } from "@/store/invite-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";
import type { Group } from "@/types/group";

function normalizeGroup(response: Awaited<ReturnType<typeof getGroup>>): Group {
  return {
    creatorId: response.creatorId,
    id: response.id,
    members: response.members?.map((member) => member.userId) ?? [],
    name: response.name,
    venueId: response.venueId,
  };
}

export default function GroupDetailExperience() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;

  const user = useUserStore((state) => state.user);
  const presenceStatuses = usePresenceStore((state) => state.statuses);
  const joinGroup = useGroupStore((state) => state.joinGroup);
  const leaveGroup = useGroupStore((state) => state.leaveGroup);
  const deleteGroup = useGroupStore((state) => state.deleteGroup);
  const groupProcessing = useGroupStore((state) => state.processing);
  const receivedInvites = useInviteStore((state) => state.invites);
  const sentInvites = useInviteStore((state) => state.sentInvites);
  const sendInvite = useInviteStore((state) => state.sendInvite);
  const processingInviteIds = useInviteStore((state) => state.processingInviteIds);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<ApiGroupMember[]>([]);
  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [venue, setVenue] = useState<ApiVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingMembers, setRefreshingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);
  const loadRequestId = useRef(0);

  const loadGroup = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    if (!groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getGroup(groupId);
      if (requestId !== loadRequestId.current) return;

      setGroup(normalizeGroup(response));

      const [membersResult, friendsResult, venueResult] = await Promise.allSettled([
        getGroupMembers(groupId),
        getFriends(),
        getVenue(response.venueId),
      ]);

      if (requestId !== loadRequestId.current) return;

      if (membersResult.status === "fulfilled") {
        setMembers(membersResult.value);
        setGroup((current) =>
          current
            ? { ...current, members: membersResult.value.map((member) => member.userId) }
            : current,
        );
      }

      if (friendsResult.status === "fulfilled") setFriends(friendsResult.value);
      if (venueResult.status === "fulfilled") setVenue(venueResult.value);

      const partialFailure = [membersResult, friendsResult, venueResult].some(
        (result) => result.status === "rejected",
      );
      if (partialFailure) {
        setActionError("Algumas informações do grupo não puderam ser atualizadas.");
      }
    } catch (requestError) {
      if (requestId === loadRequestId.current) {
        setGroup(null);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível carregar este grupo.",
        );
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadGroup();
    return () => {
      loadRequestId.current += 1;
    };
  }, [loadGroup]);

  const memberUsers = useMemo(
    () => members.map((member) => member.user).filter((member) => Boolean(member)),
    [members],
  );

  const pendingInvites = useMemo(
    () => [...receivedInvites, ...sentInvites].filter((invite) => invite.status === "pending"),
    [receivedInvites, sentInvites],
  );

  const availableFriends = useMemo(() => {
    if (!group) return [];

    return friends.filter((friend) => {
      const isMember = group.members.includes(friend.id);
      const isPending = pendingInvites.some(
        (invite) => invite.groupId === group.id && invite.toUserId === friend.id,
      );
      return friend.id !== user?.id && !isMember && !isPending;
    });
  }, [friends, group, pendingInvites, user?.id]);

  const handleMembership = async (nextMembership: "join" | "leave") => {
    if (!group || !user || groupProcessing) return;

    setActionError(null);
    try {
      if (nextMembership === "join") {
        await joinGroup(group.id, user.id);
        setGroup((current) =>
          current && !current.members.includes(user.id)
            ? { ...current, members: [...current.members, user.id] }
            : current,
        );
      } else {
        await leaveGroup(group.id, user.id);
        setGroup((current) =>
          current
            ? { ...current, members: current.members.filter((memberId) => memberId !== user.id) }
            : current,
        );
        setMembers((current) => current.filter((member) => member.userId !== user.id));
      }
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar sua participação.",
      );
    }
  };

  const handleInvite = async (friend: ApiFriend) => {
    if (!group || !user || invitingFriendId) return;

    const temporaryId = `invite-${Date.now()}-${friend.id}`;
    setInvitingFriendId(friend.id);
    setActionError(null);

    try {
      await sendInvite({
        fromUserId: user.id,
        groupId: group.id,
        id: temporaryId,
        status: "pending",
        toUserId: friend.id,
      });
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível enviar o convite.",
      );
    } finally {
      setInvitingFriendId(null);
    }
  };

  const handleRefreshMembers = async () => {
    if (!groupId || refreshingMembers) return;
    setRefreshingMembers(true);
    setActionError(null);

    try {
      const response = await getGroupMembers(groupId);
      setMembers(response);
      setGroup((current) =>
        current ? { ...current, members: response.map((member) => member.userId) } : current,
      );
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar os membros.",
      );
    } finally {
      setRefreshingMembers(false);
    }
  };

  const handleDelete = async () => {
    if (!group || groupProcessing) return;
    setActionError(null);

    try {
      await deleteGroup(group.id);
      router.replace("/(main)/chat");
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir o grupo.",
      );
    }
  };

  if (!groupId) {
    return <GroupState message="Não foi possível identificar este grupo." />;
  }

  if (loading && !group) {
    return <GroupLoading />;
  }

  if (!group) {
    return <GroupState message={error ?? "Este grupo não está mais disponível."} />;
  }

  const currentUserIsMember = Boolean(user && group.members.includes(user.id));
  const canDelete = Boolean(user && user.id === group.creatorId);
  const visibleFriends = availableFriends.slice(0, 4);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={styles.page}
    >
      <ScreenContainer maxWidth={820}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel="Voltar para grupos"
            accessibilityRole="button"
            onPress={() => router.replace("/(main)/chat")}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.text} name="chevron-back" size={23} />
          </Pressable>
          <Text style={styles.topBarLabel}>Detalhes do grupo</Text>
          <Pressable
            accessibilityLabel="Atualizar membros"
            accessibilityRole="button"
            disabled={refreshingMembers}
            onPress={() => void handleRefreshMembers()}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.textSecondary}
              name="refresh-outline"
              size={21}
            />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.groupMark}>
            <Ionicons color={colors.brand} name="people" size={32} />
          </View>
          <Text style={styles.eyebrow}>SEU GRUPO</Text>
          <Text style={styles.title}>{group.name}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.metaPill}>
              <Ionicons color={colors.brand} name="people-outline" size={14} />
              <Text style={styles.metaText}>
                {group.members.length} {group.members.length === 1 ? "membro" : "membros"}
              </Text>
            </View>
            {venue ? (
              <View style={styles.metaPill}>
                <Ionicons color={colors.brand} name="location-outline" size={14} />
                <Text numberOfLines={1} style={styles.metaText}>{venue.name}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.primaryActions}>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/(main)/group/chat/[id]", params: { id: group.id } })
              }
              style={({ pressed }) => [styles.chatButton, pressed && styles.primaryPressed]}
            >
              <Ionicons color={colors.background} name="chatbubbles" size={19} />
              <Text style={styles.chatButtonText}>Abrir conversa</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/(main)/group/invite", params: { groupId: group.id } })
              }
              style={({ pressed }) => [styles.inviteAllButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.text} name="person-add-outline" size={19} />
            </Pressable>
          </View>
        </View>

        {actionError ? (
          <View accessibilityRole="alert" style={styles.errorBanner}>
            <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
            <Text style={styles.errorBannerText}>{actionError}</Text>
            <Pressable accessibilityLabel="Fechar aviso" onPress={() => setActionError(null)}>
              <Ionicons color={colors.textMuted} name="close" size={18} />
            </Pressable>
          </View>
        ) : null}

        {venue ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({ pathname: "/venue/[id]", params: { id: venue.id } })
            }
            style={({ pressed }) => [styles.venueCard, pressed && styles.pressed]}
          >
            <View style={styles.venueIcon}>
              <Ionicons color={colors.brand} name="location" size={22} />
            </View>
            <View style={styles.venueCopy}>
              <Text style={styles.cardEyebrow}>PONTO DE ENCONTRO</Text>
              <Text numberOfLines={1} style={styles.venueName}>{venue.name}</Text>
              <Text numberOfLines={1} style={styles.venueDetail}>
                {[venue.category, venue.distance].filter(Boolean).join(" · ")}
              </Text>
            </View>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={19} />
          </Pressable>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Membros</Text>
            <Text style={styles.sectionSubtitle}>Quem participa desta combinação</Text>
          </View>
          {refreshingMembers ? <ActivityIndicator color={colors.brand} size="small" /> : null}
        </View>

        <View style={styles.card}>
          {memberUsers.length === 0 ? (
            <View style={styles.compactEmpty}>
              <Ionicons color={colors.brand} name="people-outline" size={24} />
              <Text style={styles.compactEmptyText}>Nenhum membro encontrado.</Text>
            </View>
          ) : (
            memberUsers.map((member, index) => {
              const online = (presenceStatuses[member!.id] ?? member!.status) === "ONLINE";
              return (
                <Pressable
                  accessibilityRole="button"
                  key={member!.id}
                  onPress={() =>
                    router.push({ pathname: "/(main)/friend/[id]", params: { id: member!.id } })
                  }
                  style={({ pressed }) => [
                    styles.personRow,
                    index > 0 && styles.rowDivider,
                    pressed && styles.pressed,
                  ]}
                >
                  <UserAvatar
                    name={member!.name}
                    online={online}
                    showStatus
                    size={46}
                    uri={member!.avatar}
                  />
                  <View style={styles.personCopy}>
                    <View style={styles.personNameRow}>
                      <Text numberOfLines={1} style={styles.personName}>{member!.name}</Text>
                      {member!.id === group.creatorId ? (
                        <View style={styles.ownerBadge}>
                          <Text style={styles.ownerText}>Criador</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.personStatus, online && styles.onlineText]}>
                      {online ? "Online agora" : "Offline"}
                    </Text>
                  </View>
                  <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Convidar amigos</Text>
            <Text style={styles.sectionSubtitle}>Traga mais gente para o grupo</Text>
          </View>
          <Pressable
            accessibilityLabel="Ver todos os amigos disponíveis"
            onPress={() =>
              router.push({ pathname: "/(main)/group/invite", params: { groupId: group.id } })
            }
          >
            <Text style={styles.linkText}>Ver todos</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {visibleFriends.length === 0 ? (
            <View style={styles.compactEmpty}>
              <Ionicons color={colors.success} name="checkmark-circle-outline" size={24} />
              <Text style={styles.compactEmptyText}>
                Todos os amigos disponíveis já participam ou foram convidados.
              </Text>
            </View>
          ) : (
            visibleFriends.map((friend, index) => {
              const online = (presenceStatuses[friend.id] ?? friend.status) === "ONLINE";
              const isSending = invitingFriendId === friend.id ||
                processingInviteIds.some((id) => id.endsWith(friend.id));
              return (
                <View key={friend.id} style={[styles.personRow, index > 0 && styles.rowDivider]}>
                  <UserAvatar
                    name={friend.name}
                    online={online}
                    showStatus
                    size={44}
                    uri={friend.avatar}
                  />
                  <View style={styles.personCopy}>
                    <Text numberOfLines={1} style={styles.personName}>{friend.name}</Text>
                    <Text style={[styles.personStatus, online && styles.onlineText]}>
                      {online ? "Online agora" : "Offline"}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel={`Convidar ${friend.name}`}
                    accessibilityRole="button"
                    disabled={Boolean(invitingFriendId)}
                    onPress={() => void handleInvite(friend)}
                    style={({ pressed }) => [
                      styles.smallInviteButton,
                      Boolean(invitingFriendId) && styles.disabled,
                      pressed && !invitingFriendId && styles.primaryPressed,
                    ]}
                  >
                    {isSending ? (
                      <ActivityIndicator color={colors.background} size="small" />
                    ) : (
                      <Text style={styles.smallInviteText}>Convidar</Text>
                    )}
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Participação</Text>
            <Text style={styles.sectionSubtitle}>Gerencie sua presença neste grupo</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.membershipRow}>
            <View style={[styles.membershipIcon, currentUserIsMember && styles.membershipIconActive]}>
              <Ionicons
                color={currentUserIsMember ? colors.success : colors.brand}
                name={currentUserIsMember ? "checkmark-circle" : "enter-outline"}
                size={22}
              />
            </View>
            <View style={styles.personCopy}>
              <Text style={styles.personName}>
                {currentUserIsMember ? "Você faz parte deste grupo" : "Entre neste grupo"}
              </Text>
              <Text style={styles.personStatus}>
                {currentUserIsMember
                  ? "Você recebe atualizações e participa do chat."
                  : "Participe para conversar com os membros."}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              disabled={groupProcessing}
              onPress={() => void handleMembership(currentUserIsMember ? "leave" : "join")}
              style={({ pressed }) => [
                currentUserIsMember ? styles.leaveButton : styles.joinButton,
                groupProcessing && styles.disabled,
                pressed && !groupProcessing && styles.pressed,
              ]}
            >
              <Text style={currentUserIsMember ? styles.leaveButtonText : styles.joinButtonText}>
                {groupProcessing ? "Aguarde" : currentUserIsMember ? "Sair" : "Entrar"}
              </Text>
            </Pressable>
          </View>
        </View>

        {canDelete ? (
          <View style={styles.dangerZone}>
            {!confirmDelete ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmDelete(true)}
                style={({ pressed }) => [styles.deleteTrigger, pressed && styles.pressed]}
              >
                <Ionicons color={colors.danger} name="trash-outline" size={19} />
                <Text style={styles.deleteTriggerText}>Excluir grupo</Text>
              </Pressable>
            ) : (
              <View>
                <Text style={styles.deleteTitle}>Excluir “{group.name}”?</Text>
                <Text style={styles.deleteText}>
                  Esta ação remove o grupo e não pode ser desfeita.
                </Text>
                <View style={styles.deleteActions}>
                  <Pressable
                    disabled={groupProcessing}
                    onPress={() => setConfirmDelete(false)}
                    style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    disabled={groupProcessing}
                    onPress={() => void handleDelete()}
                    style={({ pressed }) => [
                      styles.confirmDeleteButton,
                      groupProcessing && styles.disabled,
                      pressed && !groupProcessing && styles.pressed,
                    ]}
                  >
                    <Text style={styles.confirmDeleteText}>
                      {groupProcessing ? "Excluindo…" : "Excluir definitivamente"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        ) : null}
      </ScreenContainer>
    </ScrollView>
  );
}

function GroupLoading() {
  return (
    <View style={styles.statePage}>
      <ActivityIndicator color={colors.brand} size="small" />
      <Text style={styles.stateText}>Carregando grupo…</Text>
    </View>
  );
}

function GroupState({ message }: { message: string }) {
  return (
    <View style={styles.statePage}>
      <View style={styles.stateIcon}>
        <Ionicons color={colors.brand} name="people-outline" size={30} />
      </View>
      <Text style={styles.stateTitle}>Grupo não encontrado</Text>
      <Text style={styles.stateText}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace("/(main)/chat")}
        style={({ pressed }) => [styles.stateButton, pressed && styles.primaryPressed]}
      >
        <Ionicons color={colors.background} name="arrow-back" size={18} />
        <Text style={styles.stateButtonText}>Voltar para grupos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { paddingBottom: 50, paddingTop: 16 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  topBarLabel: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 12 },
  iconButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  heroCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.sheet, borderWidth: 1, overflow: "hidden", padding: 24, ...shadows.floating },
  heroGlow: { backgroundColor: colors.brandSoft, borderRadius: 130, height: 230, position: "absolute", right: -110, top: -130, width: 230 },
  groupMark: { alignItems: "center", backgroundColor: colors.brandSoft, borderColor: colors.brandBorder, borderRadius: 34, borderWidth: 1, height: 68, justifyContent: "center", width: 68 },
  eyebrow: { color: colors.brand, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5, marginTop: 17 },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 34, lineHeight: 39, marginTop: 5, textAlign: "center" },
  heroMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 13 },
  metaPill: { alignItems: "center", backgroundColor: colors.elevated, borderRadius: radii.pill, flexDirection: "row", gap: 6, maxWidth: 240, paddingHorizontal: 11, paddingVertical: 7 },
  metaText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 11 },
  primaryActions: { flexDirection: "row", gap: 9, marginTop: 21, width: "100%" },
  chatButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: radii.medium, flex: 1, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 50 },
  chatButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 14 },
  inviteAllButton: { alignItems: "center", backgroundColor: colors.elevated, borderColor: colors.borderStrong, borderRadius: radii.medium, borderWidth: 1, height: 50, justifyContent: "center", width: 50 },
  errorBanner: { alignItems: "center", backgroundColor: colors.dangerSoft, borderColor: "rgba(239, 125, 125, 0.2)", borderRadius: radii.small, borderWidth: 1, flexDirection: "row", gap: 8, marginTop: 14, padding: 12 },
  errorBannerText: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
  venueCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, flexDirection: "row", marginTop: 16, padding: 16 },
  venueIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: radii.medium, height: 48, justifyContent: "center", marginRight: 13, width: 48 },
  venueCopy: { flex: 1, minWidth: 0 },
  cardEyebrow: { color: colors.brand, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1.2 },
  venueName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, marginTop: 3 },
  venueDetail: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11, marginTop: 3 },
  sectionHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginBottom: 10, marginTop: 24 },
  sectionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  sectionSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11, marginTop: 3 },
  linkText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 11, paddingVertical: 5 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, overflow: "hidden", paddingHorizontal: 14 },
  personRow: { alignItems: "center", flexDirection: "row", minHeight: 70, paddingVertical: 11 },
  rowDivider: { borderTopColor: colors.border, borderTopWidth: 1 },
  personCopy: { flex: 1, marginHorizontal: 12, minWidth: 0 },
  personNameRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  personName: { color: colors.text, flexShrink: 1, fontFamily: fonts.semibold, fontSize: 14 },
  personStatus: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11, lineHeight: 16, marginTop: 3 },
  onlineText: { color: colors.success },
  ownerBadge: { backgroundColor: colors.brandSoft, borderRadius: radii.pill, paddingHorizontal: 7, paddingVertical: 3 },
  ownerText: { color: colors.brand, fontFamily: fonts.bold, fontSize: 8, textTransform: "uppercase" },
  compactEmpty: { alignItems: "center", flexDirection: "row", gap: 10, minHeight: 82, paddingVertical: 14 },
  compactEmptyText: { color: colors.textMuted, flex: 1, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  smallInviteButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: radii.small, justifyContent: "center", minHeight: 38, minWidth: 82, paddingHorizontal: 12 },
  smallInviteText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  membershipRow: { alignItems: "center", flexDirection: "row", minHeight: 82, paddingVertical: 12 },
  membershipIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  membershipIconActive: { backgroundColor: colors.successSoft },
  joinButton: { backgroundColor: colors.brand, borderRadius: radii.small, paddingHorizontal: 15, paddingVertical: 10 },
  joinButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  leaveButton: { backgroundColor: colors.dangerSoft, borderRadius: radii.small, paddingHorizontal: 15, paddingVertical: 10 },
  leaveButtonText: { color: colors.danger, fontFamily: fonts.bold, fontSize: 11 },
  dangerZone: { backgroundColor: colors.dangerSoft, borderColor: "rgba(239, 125, 125, 0.2)", borderRadius: radii.large, borderWidth: 1, marginTop: 24, padding: 16 },
  deleteTrigger: { alignItems: "center", flexDirection: "row", gap: 9, justifyContent: "center", minHeight: 42 },
  deleteTriggerText: { color: colors.danger, fontFamily: fonts.semibold, fontSize: 13 },
  deleteTitle: { color: colors.danger, fontFamily: fonts.bold, fontSize: 15 },
  deleteText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 5 },
  deleteActions: { flexDirection: "row", gap: 9, marginTop: 15 },
  cancelButton: { alignItems: "center", backgroundColor: colors.elevated, borderRadius: radii.small, flex: 1, justifyContent: "center", minHeight: 44 },
  cancelButtonText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 11 },
  confirmDeleteButton: { alignItems: "center", backgroundColor: colors.danger, borderRadius: radii.small, flex: 1.4, justifyContent: "center", minHeight: 44, paddingHorizontal: 10 },
  confirmDeleteText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11, textAlign: "center" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.72 },
  primaryPressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.99 }] },
  statePage: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  stateIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  stateTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 28, marginTop: 18, textAlign: "center" },
  stateText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, marginTop: 8, maxWidth: 340, textAlign: "center" },
  stateButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: radii.medium, flexDirection: "row", gap: 8, marginTop: 22, paddingHorizontal: 20, paddingVertical: 13 },
  stateButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 12 },
});
