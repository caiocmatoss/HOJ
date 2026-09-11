import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { UserAvatar } from "@/components/ui/UserAvatar";
import Svg, { Path } from "react-native-svg";
import {
  getDirectMessages,

  getGroupMessages,
  type ApiDirectMessage,

} from "@/services/api";
import { useFriendsQuery } from "@/services/api/resources/friends";
import { useGroupsQuery } from "@/services/api/resources/groups";
import {
  joinDirectConversation,
  joinGroup,
  leaveDirectConversation,
  leaveGroup,
  onNewDirectMessage,
  onNewMessage,
  type DirectServerMessage,
} from "@/services/socket";
import {
  useChatStore,
  type DirectChatMessage,
} from "@/store/chat-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";

type ConversationFilter = "all" | "direct" | "group";

type Conversation = {
  avatar?: string | null;
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  hasMessage: boolean;
  meta: string;
  name: string;
  online?: boolean;
  type: "direct" | "group";
};

function createDirectConversationId(userId: string, friendId: string) {
  return `direct-${[userId, friendId].sort().join("-")}`;
}

function getTimestamp(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatConversationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function mapDirectMessage(message: ApiDirectMessage | DirectServerMessage): DirectChatMessage {
  return { ...message };
}

export default function ChatInboxExperience() {
  const user = useUserStore((state) => state.user);
  const directMessages = useChatStore((state) => state.directMessages);
  const groupMessages = useChatStore((state) => state.messages);
  const setDirectMessages = useChatStore((state) => state.setDirectMessages);
  const addDirectMessage = useChatStore((state) => state.addDirectMessage);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const groupsQuery = useGroupsQuery({ page: 1, limit: 100 });
  const groups = groupsQuery.data?.items ?? [];
  const groupStoreLoading = groupsQuery.isLoading;
  const presenceStatuses = usePresenceStore((state) => state.statuses);

  const friendsQuery = useFriendsQuery({ page: 1, limit: 100 });
  const friends = friendsQuery.data?.items ?? [];
  const [loadingDirect, setLoadingDirect] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [reloadKey, setReloadKey] = useState(0);

  const loadDirectInbox = useCallback(async () => {
    if (!user) return;

    setLoadingDirect(true);
    setError(null);

    try {
      const realFriends = friendsQuery.data?.items ?? [];

      const histories = await Promise.allSettled(
        realFriends.map(async (friend) => ({
          friendId: friend.id,
          messages: await getDirectMessages(friend.id),
        })),
      );

      let failures = 0;
      histories.forEach((result) => {
        if (result.status === "rejected") {
          failures += 1;
          return;
        }

        setDirectMessages(
          createDirectConversationId(user.id, result.value.friendId),
          result.value.messages.map(mapDirectMessage),
        );
      });

      if (failures > 0) {
        setError("Algumas conversas não puderam ser atualizadas.");
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar suas conversas.",
      );
    } finally {
      setLoadingDirect(false);
    }
  }, [setDirectMessages, user, friendsQuery.data]);

  useEffect(() => {
    void loadDirectInbox();
  }, [loadDirectInbox, reloadKey]);

  useEffect(() => {
    if (groups.length === 0) return;
    let active = true;

    const loadHistories = async () => {
      setLoadingGroups(true);
      const histories = await Promise.allSettled(
        groups.map(async (group) => ({
          groupId: group.id,
          messages: await getGroupMessages(group.id),
        })),
      );

      if (!active) return;
      let failures = 0;
      histories.forEach((result) => {
        if (result.status === "rejected") {
          failures += 1;
          return;
        }
        setMessages(result.value.groupId, result.value.messages);
      });

      if (failures > 0) setError("Alguns grupos não puderam ser atualizados.");
      setLoadingGroups(false);
    };

    void loadHistories();
    return () => {
      active = false;
    };
  }, [groups, reloadKey, setMessages]);

  useEffect(() => {
    if (!user || friends.length === 0) return;
    let active = true;

    const unsubscribe = onNewDirectMessage((message) => {
      if (!active) return;
      const belongsToUser = message.senderId === user.id || message.receiverId === user.id;
      if (!belongsToUser) return;

      const otherId = message.senderId === user.id ? message.receiverId : message.senderId;
      addDirectMessage(createDirectConversationId(user.id, otherId), mapDirectMessage(message));
    });

    void Promise.allSettled(friends.map((friend) => joinDirectConversation(friend.id)));

    return () => {
      active = false;
      unsubscribe();
      friends.forEach((friend) => leaveDirectConversation(friend.id));
    };
  }, [addDirectMessage, friends, user]);

  useEffect(() => {
    if (groups.length === 0) return;
    const unsubscribe = onNewMessage((message) => addMessage(message.groupId, message));
    void Promise.allSettled(groups.map((group) => joinGroup(group.id)));

    return () => {
      unsubscribe();
      groups.forEach((group) => leaveGroup(group.id));
    };
  }, [addMessage, groups]);

  const conversations = useMemo<Conversation[]>(() => {
    if (!user) return [];

    const direct: Conversation[] = friends.flatMap((friend) => {
      const conversationId = createDirectConversationId(user.id, friend.id);
      const history = directMessages[conversationId] ?? [];
      const lastMessage = history[history.length - 1];
      if (!lastMessage) return [];

      const online = (presenceStatuses[friend.id] ?? friend.status) === "ONLINE";
      return [
        {
          avatar: friend.avatar,
          id: friend.id,
          lastMessage: lastMessage.text,
          lastMessageAt: lastMessage.createdAt,
          meta: online ? "Online" : "Offline",
          name: friend.name,
          online,
          type: "direct" as const,
          hasMessage: true,
        },
      ];
    });

    const group: Conversation[] = groups.flatMap((item) => {
      const history = groupMessages[item.id] ?? [];
      const lastMessage = history[history.length - 1];
      return [
        {
          id: item.id,
          lastMessage: lastMessage?.text ?? "Sem mensagens ainda",
          lastMessageAt: lastMessage?.createdAt ?? item.createdAt,
          hasMessage: Boolean(lastMessage),
          meta: `${(item.members ?? []).length} ${(item.members ?? []).length === 1 ? "membro" : "membros"}`,
          name: item.name,
          type: "group" as const,
        },
      ];
    });

    return [...direct, ...group].sort(
      (first, second) => getTimestamp(second.lastMessageAt) - getTimestamp(first.lastMessageAt),
    );
  }, [directMessages, friends, groupMessages, groups, presenceStatuses, user]);

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return conversations.filter((conversation) => {
      const matchesFilter = filter === "all" || conversation.type === filter;
      const matchesQuery =
        !normalized ||
        `${conversation.name} ${conversation.lastMessage}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [conversations, filter, query]);

  const loading = loadingDirect || loadingGroups || groupStoreLoading;
  const directCount = conversations.filter((item) => item.type === "direct").length;
  const groupCount = conversations.filter((item) => item.type === "group").length;

  const openConversation = (conversation: Conversation) => {
    router.push({
      pathname:
        conversation.type === "direct"
          ? "/(main)/chat/[id]"
          : "/(main)/group/chat/[id]",
      params: { id: conversation.id },
    });
  };

  return (
    <View style={styles.page}>
      <FlatList
        contentContainerStyle={
          filteredConversations.length > 0 ? styles.listContent : styles.emptyListContent
        }
        data={filteredConversations}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <View style={styles.headerSection}>
              <View style={styles.headerRow}>
                <Text style={styles.screenTitle}>Mensagens</Text>
                <Pressable
                  accessibilityLabel="Iniciar nova conversa"
                  onPress={() => router.push("/(main)/group/create")}
                  style={({ pressed }) => [styles.newChatButton, pressed && styles.pressed]}
                >
                  <Svg height={18} width={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 5v14M5 12h14" stroke={colors.brand} strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                </Pressable>
              </View>

              <View style={styles.searchShell}>
                <Ionicons color={colors.textMuted} name="search" size={18} />
                <TextInput
                  onChangeText={setQuery}
                  placeholder="Buscar conversa…"
                  placeholderTextColor={colors.textMuted}
                  style={styles.searchInput}
                  value={query}
                />
                {query ? (
                  <Pressable accessibilityLabel="Limpar busca" onPress={() => setQuery("")}>
                    <Ionicons color={colors.textMuted} name="close-circle" size={18} />
                  </Pressable>
                ) : null}
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable
                    onPress={() => {
                      setError(null);
                      setReloadKey((current) => current + 1);
                    }}
                  >
                    <Text style={styles.retryText}>Tentar novamente</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </ScreenContainer>
        }
        ListEmptyComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={colors.brand} size="small" />
                <Text style={styles.stateTitle}>Atualizando conversas</Text>
                <Text style={styles.stateText}>Buscando mensagens recentes e seus grupos.</Text>
              </View>
            ) : query || filter !== "all" ? (
              <EmptyInbox
                action="Limpar filtros"
                icon="search-outline"
                message="Tente outro nome, mensagem ou categoria."
                onPress={() => {
                  setQuery("");
                  setFilter("all");
                }}
                title="Nada por aqui"
              />
            ) : (
              <EmptyInbox
                action="Ver amigos"
                icon="chatbubbles-outline"
                message="Envie uma mensagem para um amigo ou entre no chat de um grupo."
                onPress={() => router.push("/(main)/friends")}
                title="Comece uma conversa"
              />
            )}
          </ScreenContainer>
        }
        renderItem={({ item }) => (
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <Pressable
              onPress={() => openConversation(item)}
              style={({ pressed }) => [styles.conversationCard, pressed && styles.cardPressed]}
            >
              {item.type === "direct" ? (
                <UserAvatar
                  name={item.name}
                  online={item.online}
                  showStatus
                  size={48}
                  uri={item.avatar}
                />
              ) : (
                  <View style={styles.groupAvatar}>
                  <Ionicons color={colors.brand} name="people-outline" size={20} />
                </View>
              )}

              <View style={styles.conversationCopy}>
                <View style={styles.conversationTopRow}>
                  <Text numberOfLines={1} style={styles.conversationName}>
                    {item.name}
                  </Text>
                  {item.hasMessage ? <Text style={styles.time}>{formatConversationTime(item.lastMessageAt)}</Text> : null}
                </View>
                <Text numberOfLines={1} style={styles.lastMessage}>
                  {item.lastMessage}
                </Text>
              </View>
            </Pressable>
          </ScreenContainer>
        )}
        showsVerticalScrollIndicator={false}
      />
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

function EmptyInbox({
  action,
  icon,
  message,
  onPress,
  title,
}: {
  action: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  message: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.stateIcon}>
        <Ionicons color={colors.brand} name={icon} size={30} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.emptyAction, pressed && styles.pressed]}
      >
        <Text style={styles.emptyActionText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  listContent: { paddingBottom: 116 },
  emptyListContent: { flexGrow: 1, paddingBottom: 116 },
  headerSection: { paddingBottom: 12, paddingTop: 16 },
  headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  screenTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 22, fontWeight: "700" },
  newChatButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  searchShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 16,
    marginHorizontal: 4,
    marginTop: 16,
    minHeight: 42,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    minHeight: 40,
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
    minHeight: 34,
    paddingHorizontal: 12,
  },
  filterChipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterLabel: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 11 },
  filterLabelSelected: { color: colors.background },
  filterCount: { alignItems: "center", backgroundColor: colors.elevated, borderRadius: 9, justifyContent: "center", minHeight: 18, minWidth: 18, paddingHorizontal: 4 },
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
  conversationCard: {
    alignItems: "center",
    borderBottomColor: "rgba(248,250,252,0.04)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 13,
    minHeight: 72,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  cardPressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.99 }] },
  groupAvatar: { alignItems: "center", backgroundColor: colors.brandSoft, borderColor: colors.brandBorder, borderRadius: 24, borderWidth: 1, height: 48, justifyContent: "center", width: 48 },
  conversationCopy: { flex: 1, minWidth: 0 },
  conversationTopRow: { alignItems: "center", flexDirection: "row", gap: 10, justifyContent: "space-between" },
  conversationName: { color: colors.text, flex: 1, fontFamily: fonts.semibold, fontSize: 15 },
  time: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11 },
  lastMessage: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, marginTop: 0 },
  metaRow: { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 6 },
  meta: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 9 },
  metaOnline: { color: colors.success },
  loadingState: { alignItems: "center", justifyContent: "center", minHeight: 310, paddingHorizontal: 20 },
  emptyState: { alignItems: "center", justifyContent: "center", minHeight: 330, paddingHorizontal: 24 },
  stateIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  stateTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 25, marginTop: 17, textAlign: "center" },
  stateText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 310, textAlign: "center" },
  emptyAction: { backgroundColor: colors.brand, borderRadius: radii.medium, marginTop: 19, paddingHorizontal: 20, paddingVertical: 12 },
  emptyActionText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
  pressed: { opacity: 0.72 },
});
