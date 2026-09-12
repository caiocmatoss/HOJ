import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
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
import { useFriendsQuery, type Friend } from "@/services/api/resources/friends";
import { useGroupMembersQuery, useGroupMutation, useGroupQuery } from "@/services/api/resources/groups";
import { useInviteMutation, useSentInvitesQuery } from "@/services/api/resources/invites";
import { useVenueQuery } from "@/services/api/resources/venues";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";
export default function GroupDetailExperience() {
  const params = useLocalSearchParams<{ id?: string | string[]; from?: string | string[] }>();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;
  const fromChat = (Array.isArray(params.from) ? params.from[0] : params.from) === "chat";

  const user = useUserStore((state) => state.user);
  const presenceStatuses = usePresenceStore((state) => state.statuses);
  const groupQuery = useGroupQuery(groupId);
  const membersQuery = useGroupMembersQuery(groupId, { page: 1, limit: 100 });
  const friendsQuery = useFriendsQuery({ page: 1, limit: 100 });
  const sentInvitesQuery = useSentInvitesQuery({ page: 1, limit: 100 });
  const venueQuery = useVenueQuery(groupQuery.data?.venueId);
  const inviteMutation = useInviteMutation("send");
  const leaveMutation = useGroupMutation("remove");
  const deleteMutation = useGroupMutation("delete");
  const group = groupQuery.data ?? null;
  const members = membersQuery.data?.items ?? group?.members ?? [];
  const friends = friendsQuery.data?.items ?? [];
  const sentInvites = sentInvitesQuery.data?.items ?? [];
  const venue = venueQuery.data ?? null;
  const [refreshingMembers, setRefreshingMembers] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [invitingFriendId, setInvitingFriendId] = useState<string | null>(null);
  const loading = groupQuery.isLoading;
  const error = groupQuery.error instanceof Error ? groupQuery.error.message : groupQuery.error ? "Não foi possível carregar este grupo." : null;
  const groupProcessing = leaveMutation.isPending || deleteMutation.isPending;
  const groupMemberIds = useMemo(() => new Set(members.map((member) => member.userId)), [members]);
  const pendingInvites = useMemo(() => sentInvites.filter((invite) => invite.status === "PENDING"), [sentInvites]);
  const availableFriends = useMemo(() => friends.filter((friend) => !groupMemberIds.has(friend.id) && !pendingInvites.some((invite) => invite.groupId === group?.id && invite.receiverId === friend.id)), [friends, groupMemberIds, pendingInvites, group?.id]);
  const memberUsers = useMemo(() => members.map((member) => member.user).filter(Boolean), [members]);
  const handleRefreshMembers = async () => {
    setRefreshingMembers(true); setActionError(null);
    try { await Promise.all([groupQuery.refetch(), membersQuery.refetch(), friendsQuery.refetch(), venueQuery.refetch()]); }
    catch { setActionError("Não foi possível atualizar os membros."); }
    finally { setRefreshingMembers(false); }
  };
  const handleInvite = async (friend: Friend) => {
    if (!group || invitingFriendId) return;
    setInvitingFriendId(friend.id); setActionError(null);
    try { await inviteMutation.mutateAsync({ groupId: group.id, receiverId: friend.id }); }
    catch { setActionError("Não foi possível enviar o convite."); }
    finally { setInvitingFriendId(null); }
  };
  const handleMembership = async (next: "join" | "leave") => {
    if (!group || !user || groupProcessing || next === "join") return;
    setActionError(null);
    try { await leaveMutation.mutateAsync({ groupId: group.id, userId: user.id }); await Promise.all([groupQuery.refetch(), membersQuery.refetch()]); }
    catch { setActionError("Não foi possível atualizar sua participação."); }
  };
  const handleDelete = async () => {
    if (!group || groupProcessing) return;
    setActionError(null);
    try { await deleteMutation.mutateAsync({ groupId: group.id }); router.replace("/(main)/chat"); }
    catch { setActionError("Não foi possível excluir o grupo."); }
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

  const currentUserIsMember = Boolean(user && members.some((member) => member.userId === user.id));
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
            onPress={() => fromChat && groupId ? router.replace({ pathname: "/(main)/group/chat/[id]", params: { id: groupId } }) : router.replace("/(main)/chat")}
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

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.groupMark}>
              <Ionicons color={colors.brand} name="people" size={23} />
            </View>
            <View style={styles.summaryCopy}>
              <Text numberOfLines={1} style={styles.title}>{group.name}</Text>
              <Text style={styles.summarySubtext}>Grupo de amigos</Text>
            </View>
          </View>
          <View style={styles.heroMeta}>
            <View style={styles.metaItem}>
              <Ionicons color={colors.textMuted} name="people-outline" size={15} />
              <Text style={styles.metaText}>{members.length} {members.length === 1 ? "membro" : "membros"}</Text>
            </View>
            {venue ? (
              <View style={styles.metaItem}>
                <Ionicons color={colors.textMuted} name="location-outline" size={15} />
                <Text numberOfLines={1} style={styles.metaText}>{venue.name}</Text>
              </View>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/(main)/group/chat/[id]", params: { id: group.id } })}
            style={({ pressed }) => [styles.chatButton, pressed && styles.primaryPressed]}
          >
            <Ionicons color={colors.background} name="chatbubbles-outline" size={18} />
            <Text style={styles.chatButtonText}>Abrir conversa</Text>
          </Pressable>
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
              <Text style={styles.cardEyebrow}>LOCAL DO GRUPO</Text>
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
            <Text style={styles.sectionSubtitle}>Adicione pessoas ao grupo</Text>
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
                false;
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
  scrollContent: { paddingBottom: 96, paddingTop: 12 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  topBarLabel: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 12 },
  iconButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  summaryCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, padding: 18 },
  heroGlow: { display: "none" },
  groupMark: { alignItems: "center", backgroundColor: colors.elevated, borderRadius: 24, height: 48, justifyContent: "center", width: 48 },
  eyebrow: { color: colors.brand, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 25, lineHeight: 30 },
  summaryRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  summaryCopy: { flex: 1, minWidth: 0 },
  summarySubtext: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 3 },
  heroMeta: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 16 },
  metaItem: { alignItems: "center", flexDirection: "row", gap: 6 },
  metaPill: { alignItems: "center", backgroundColor: colors.elevated, borderRadius: radii.pill, flexDirection: "row", gap: 6, maxWidth: 240, paddingHorizontal: 11, paddingVertical: 7 },
  metaText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 11 },
  primaryActions: { flexDirection: "row", gap: 9, marginTop: 16, width: "100%" },
  chatButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 18, minHeight: 50, width: "100%" },
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
