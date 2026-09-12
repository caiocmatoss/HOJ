import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useFriendsQuery, type Friend } from "@/services/api/resources/friends";
import { useDeleteDirectMessageMutation, useDirectMessagesQuery, useDirectReadStateQuery, useEditDirectMessageMutation, useMarkChatReadMutation, useSendDirectMessageMutation, useSetDirectMessageReactionMutation, useRemoveDirectMessageReactionMutation, type DirectMessage, type ReactionType } from "@/services/api/resources/messages";
import { messageKeys } from "@/services/api/query-keys";
import {
  joinDirectConversation,
  leaveDirectConversation,
  onNewDirectMessage,
  onDirectRead,
  onDirectTyping,
  emitDirectTyping,
  onDirectMessageUpdated,
  onDirectMessageDeleted,
  onDirectMessageReaction,
} from "@/services/socket";
import type { DirectChatMessage } from "@/store/chat-store";
type LifecycleDirectChatMessage = DirectMessage & { editedAt?: string | null; deletedAt?: string | null };
import Svg, { Circle, Path } from "react-native-svg";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";
import { MAIN_TAB_BAR_HEIGHT } from "../navigation/tabBarMetrics";
import { confirmDelete } from "./confirmDelete";
import { MessageActionMenu, MessageContextActions } from "./MessageContextActions";

const CHAT_COMPOSER_TAB_GAP = 8;

function createDirectConversationId(userId: string, friendId: string) {
  return `direct-${[userId, friendId].sort().join("-")}`;
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const sameDate = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  if (sameDate(date, today)) return "Hoje";
  if (sameDate(date, yesterday)) return "Ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });
}
const reactionEmoji: Record<string, string> = { LIKE: "👍", LOVE: "❤️", LAUGH: "😂", WOW: "😮", SAD: "😢", FIRE: "🔥" };

function isMessageReadByPeer(message: DirectMessage, cursor?: { lastReadAt: string | null; lastReadMessageId: string | null }) {
  if (!cursor?.lastReadAt) return false;
  const messageTime = new Date(message.createdAt).getTime();
  const cursorTime = new Date(cursor.lastReadAt).getTime();
  return messageTime < cursorTime || (messageTime === cursorTime && Boolean(cursor.lastReadMessageId) && message.id <= cursor.lastReadMessageId!);
}

export default function DirectChatExperience() {
  const tabBarHeight = MAIN_TAB_BAR_HEIGHT;
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const friendId = Array.isArray(id) ? id[0] : id;

  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.accessToken);
  const presenceStatuses = usePresenceStore((state) => state.statuses);

  const friendsQuery = useFriendsQuery({ page: 1, limit: 100 });
  const friend = friendsQuery.data?.items.find((item) => item.id === friendId) ?? null;
  const [text, setText] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesQuery = useDirectMessagesQuery(friendId, { page: 1, limit: 100 });
  const readStateQuery = useDirectReadStateQuery(friendId);
  const sendMutation = useSendDirectMessageMutation();
  const editMutation = useEditDirectMessageMutation();
  const deleteMutation = useDeleteDirectMessageMutation();
  const setReactionMutation = useSetDirectMessageReactionMutation();
  const removeReactionMutation = useRemoveDirectMessageReactionMutation();
  const markReadMutation = useMarkChatReadMutation();
  const queryClient = useQueryClient();
  const sending = sendMutation.isPending;
  const listRef = useRef<FlatList<LifecycleDirectChatMessage>>(null);
  const markedReadId = useRef<string | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remoteTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOriginalText, setEditingOriginalText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [activeContextMessageId, setActiveContextMessageId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 24, y: 180 });

  const conversationId = useMemo(() => {
    if (!user || !friendId) return null;
    return createDirectConversationId(user.id, friendId);
  }, [friendId, user]);

  const messages = (messagesQuery.data?.items ?? []) as LifecycleDirectChatMessage[];
  const closeContextMenu = () => { setActiveContextMessageId(null); setContextMenuPosition({ x: 24, y: 180 }); };
  const openContextMenu = (messageId: string, position: { x: number; y: number }) => { setActiveContextMessageId(messageId); setContextMenuPosition(position); };
  const selectEditMessage = () => { const message = messages.find((item) => item.id === activeContextMessageId); closeContextMenu(); if (message && !message.deletedAt) { setReplyingToId(null); setEditingId(message.id); setEditingOriginalText(message.text ?? ""); setText(message.text ?? ""); } };
  const selectReplyMessage = () => { const message = messages.find((item) => item.id === activeContextMessageId); closeContextMenu(); if (message && !message.deletedAt) { setEditingId(null); setEditingOriginalText(""); setReplyingToId(message.id); } };
  const selectReaction = (type: ReactionType) => { const message = messages.find((item) => item.id === activeContextMessageId); closeContextMenu(); if (!message || message.deletedAt) return; void (message.myReaction === type ? removeReactionMutation.mutateAsync({ messageId: message.id }) : setReactionMutation.mutateAsync({ messageId: message.id, type })); };

  useEffect(() => {
    const last = messagesQuery.data?.items.at(-1);
    if (friendId && last && markedReadId.current !== last.id) { markedReadId.current = last.id; markReadMutation.mutate({ threadType: "DIRECT", threadKey: friendId, messageId: last.id }); }
  }, [friendId, markReadMutation, messagesQuery.data]);

  useEffect(() => () => { if (typingTimer.current) clearTimeout(typingTimer.current); if (remoteTypingTimer.current) clearTimeout(remoteTypingTimer.current); closeContextMenu(); setEditingId(null); setEditingOriginalText(""); if (friendId) emitDirectTyping(friendId, false); }, [friendId]);

  useEffect(() => {
    if (!friendId || !user) return;
    const unsubscribe = onDirectTyping((data) => {
      if (data.userId !== friendId) return;
      if (remoteTypingTimer.current) clearTimeout(remoteTypingTimer.current);
      setRemoteTyping(data.isTyping);
      if (data.isTyping) remoteTypingTimer.current = setTimeout(() => setRemoteTyping(false), 4000);
    });
    return unsubscribe;
  }, [friendId, user]);

  useEffect(() => {
    if (!friendId || !user) return;
    const unsubscribe = onDirectRead((data) => {
      if (data.userId !== friendId || data.peerUserId !== user.id) return;
      queryClient.setQueryData(messageKeys.directReadState(friendId), (current: any) => current ? { ...current, peer: { lastReadAt: data.lastReadAt, lastReadMessageId: data.lastReadMessageId } } : current);
    });
    return unsubscribe;
  }, [friendId, queryClient, user]);

  useEffect(() => {
    if (messagesQuery.error) {
      setError(messagesQuery.error instanceof Error ? messagesQuery.error.message : "Não foi possível carregar a conversa.");
    }
  }, [messagesQuery.error]);

  useEffect(() => {
    if (false) {
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      setError(null);

      try {
        const realFriend = friendsQuery.data?.items.find((item) => item.id === friendId) ?? null;
        if (cancelled) return;
        if (!realFriend) return;

      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar a conversa.",
          );
        }
      } finally {
      }
    };

    void loadConversation();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user || !friendId || !conversationId || !accessToken) return;

    let active = true;
    let unsubscribe: (() => void) | null = null;
    let unsubscribeUpdated: (() => void) | null = null;
    let unsubscribeDeleted: (() => void) | null = null;
    let unsubscribeReaction: (() => void) | null = null;

    const connect = async () => {
      setConnecting(true);

      try {
        unsubscribe = onNewDirectMessage((message) => {
          if (!active) return;

          const belongsToConversation =
            (message.senderId === user.id && message.receiverId === friendId) ||
            (message.senderId === friendId && message.receiverId === user.id);

          if (belongsToConversation) {
            queryClient.setQueryData(messageKeys.direct(friendId, { page: 1, limit: 100 }), (current: any) => {
              if (!current) return current;
              const items = [...current.items.filter((item: DirectMessage) => item.id !== message.id), message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
              return { ...current, items };
            });
          }
        });
        unsubscribeUpdated = onDirectMessageUpdated((message) => { if ((message.senderId === user.id && message.receiverId === friendId) || (message.senderId === friendId && message.receiverId === user.id)) queryClient.setQueryData(messageKeys.direct(friendId, { page: 1, limit: 100 }), (current: any) => current ? { ...current, items: current.items.map((item: DirectMessage) => item.id === message.id ? message : item.replyTo?.id === message.id ? { ...item, replyTo: { ...item.replyTo, text: message.text, deletedAt: message.deletedAt ?? null } } : item) } : current); });
        unsubscribeDeleted = onDirectMessageDeleted((message) => { if ((message.senderId === user.id && message.receiverId === friendId) || (message.senderId === friendId && message.receiverId === user.id)) { queryClient.setQueryData(messageKeys.direct(friendId, { page: 1, limit: 100 }), (current: any) => current ? { ...current, items: current.items.map((item: DirectMessage) => item.id === message.id ? message : item.replyTo?.id === message.id ? { ...item, replyTo: { ...item.replyTo, text: null, deletedAt: message.deletedAt ?? new Date().toISOString() } } : item) } : current); if (editingId === message.id) { setEditingId(null); setEditingOriginalText(""); setText(""); } if (replyingToId === message.id) setReplyingToId(null); if (activeContextMessageId === message.id) closeContextMenu(); } });
        unsubscribeReaction = onDirectMessageReaction((event) => queryClient.setQueryData(messageKeys.direct(friendId, { page: 1, limit: 100 }), (current: any) => current ? { ...current, items: current.items.map((item: DirectMessage) => item.id === event.messageId ? { ...item, reactions: event.reactions, ...(event.actorUserId === user.id ? { myReaction: event.reaction } : {}) } : item) } : current));

        await joinDirectConversation(friendId);
      } catch (socketError) {
        if (active) {
          setError(
            socketError instanceof Error
              ? socketError.message
              : "Não foi possível conectar ao chat em tempo real.",
          );
        }
      } finally {
        if (active) setConnecting(false);
      }
    };

    void connect();
    return () => {
      active = false;
      unsubscribe?.();
      unsubscribeUpdated?.();
      unsubscribeDeleted?.();
      unsubscribeReaction?.();
      leaveDirectConversation(friendId);
    };
  }, [accessToken, conversationId, editingId, friendId, queryClient, replyingToId, user]);

  useEffect(() => {
    if (messages.length === 0) return;
    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: false });
    }, 0);
    return () => clearTimeout(timeout);
  }, [messages.length]);

  const handleBack = () => router.replace("/(main)/chat");

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || !user || !friend || !friendId || !conversationId || sending) {
      return;
    }

    setError(null);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    emitDirectTyping(friendId, false);

    try {
      const message = await sendMutation.mutateAsync({ userId: friendId, text: trimmedText, replyToId: replyingToId ?? undefined });
      queryClient.setQueryData(messageKeys.direct(friendId, { page: 1, limit: 100 }), (current: any) => {
        if (!current) return current;
        const items = [...current.items.filter((item: DirectMessage) => item.id !== message.id), message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        return { ...current, items };
      });
      setText("");
      setReplyingToId(null);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Não foi possível enviar a mensagem.",
      );
    } finally {
    }
  };

  const handleEdit = async () => { if (!editingId || !text.trim()) return; await editMutation.mutateAsync({ messageId: editingId, text: text.trim() }); setEditingId(null); setEditingOriginalText(""); setText(""); };
  const handleDelete = (messageId: string) => { confirmDelete(() => { if (editingId === messageId) { setEditingId(null); setEditingOriginalText(""); setText(""); } void deleteMutation.mutateAsync({ messageId }); }); };

  const handleTextChange = (value: string) => {
    setText(value);
    if (!friendId || editingId) return;
    if (typingTimer.current) clearTimeout(typingTimer.current);
    if (!value.trim()) { emitDirectTyping(friendId, false); return; }
    emitDirectTyping(friendId, true);
    typingTimer.current = setTimeout(() => emitDirectTyping(friendId, false), 1800);
  };

  if (!friendId || !user || !conversationId) {
    return <InvalidConversation onBack={handleBack} />;
  }

  if (messagesQuery.isLoading && !friend) {
    return <ConversationLoading onBack={handleBack} />;
  }

  if (!friend) {
    return <InvalidConversation message={error ?? undefined} onBack={handleBack} />;
  }

  const isOnline = (presenceStatuses[friend.id] ?? friend.status) === "ONLINE";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 86 : 0}
      style={styles.page}
    >
      <View style={styles.chatContainer}>
        <View style={styles.chatShell}>
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Voltar para conversas"
              onPress={handleBack}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
                  <Ionicons color={colors.brand} name="chevron-back" size={23} />
            </Pressable>

            <UserAvatar
              name={friend.name}
              online={isOnline}
              showStatus
              size={44}
              uri={friend.avatar}
            />

            <View style={styles.headerCopy}>
              <Text numberOfLines={1} style={styles.headerName}>
                {friend.name}
              </Text>
              <View style={styles.statusRow}>
                <Text style={[styles.headerStatus, isOnline && styles.headerOnline]}>
                  {connecting ? "Conectando..." : isOnline ? "Online agora" : "Offline"}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Abrir perfil do amigo"
              onPress={() =>
                router.push({ pathname: "/(main)/friend/[id]", params: { id: friend.id } })
              }
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Svg height={20} width={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={5} r={1.5} fill={colors.textMuted} />
                <Circle cx={12} cy={12} r={1.5} fill={colors.textMuted} />
                <Circle cx={12} cy={19} r={1.5} fill={colors.textMuted} />
              </Svg>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
              <Text numberOfLines={2} style={styles.errorBannerText}>
                {error}
              </Text>
              <Pressable accessibilityLabel="Fechar aviso" onPress={() => setError(null)}>
                <Ionicons color={colors.textMuted} name="close" size={18} />
              </Pressable>
            </View>
          ) : null}

          <FlatList
            contentContainerStyle={
              messages.length > 0 ? styles.messagesContent : styles.emptyMessagesContent
            }
            data={messages}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ref={listRef}
            renderItem={({ item, index }) => {
              const isMine = item.senderId === user.id;
              const previous = messages[index - 1];
              const showDay =
                !previous ||
                new Date(previous.createdAt).toDateString() !==
                  new Date(item.createdAt).toDateString();
              const next = messages[index + 1];
              const sameSenderNext = next?.senderId === item.senderId;

              return (
                <>
                  {showDay ? (
                    <View style={styles.dayRow}>
                      <View style={styles.dayLine} />
                      <Text style={styles.dayLabel}>{formatDayLabel(item.createdAt)}</Text>
                      <View style={styles.dayLine} />
                    </View>
                  ) : null}

                  <View style={[styles.messageRow, isMine && styles.myMessageRow]}>
                    <MessageContextActions enabled={!item.deletedAt} own={isMine} onOpen={(position) => openContextMenu(item.id, position)}>
                    <View
                      style={[
                        styles.bubble,
                        isMine ? styles.myBubble : styles.otherBubble,
                        sameSenderNext && styles.groupedBubble,
                      ]}
                    >
                      {item.replyTo ? <View style={styles.replyQuote}><Text style={styles.replyQuoteAuthor}>{item.replyTo.authorName ?? "Mensagem"}</Text><Text numberOfLines={2} style={styles.replyQuoteText}>{item.replyTo.text ?? "Mensagem excluída"}</Text></View> : null}
                      <Text style={[styles.messageText, isMine && styles.myMessageText, item.deletedAt && styles.deletedMessageText]}>
                        {item.deletedAt ? "Mensagem excluída" : item.text}
                      </Text>
                      <View style={styles.messageMeta}>
                        <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
                          {formatMessageTime(item.createdAt)}
                        </Text>
                        {isMine ? (
                          <Text style={styles.readStatus}>{isMessageReadByPeer(item, readStateQuery.data?.peer) ? "Lida" : "Enviada"}</Text>
                        ) : null}
                      </View>
                      {item.editedAt && !item.deletedAt ? <Text style={styles.editedLabel}>Editada</Text> : null}
                      {!item.deletedAt && item.reactions?.length ? <View style={styles.reactionRow}>{item.reactions.map((reaction) => <Text key={reaction.type} style={styles.reactionPill}>{reactionEmoji[reaction.type]} {reaction.count}</Text>)}</View> : null}
                    </View>
                    </MessageContextActions>
                  </View>
                </>
              );
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyConversation}>
                <View style={styles.emptyAvatarRing}>
                  <UserAvatar name={friend.name} size={66} uri={friend.avatar} />
                </View>
                <Text style={styles.emptyTitle}>Comece por aqui</Text>
                <Text style={styles.emptyText}>
                  Diga oi para {friend.name}. Esta é uma conversa privada entre vocês.
                </Text>
              </View>
            }
          />

          {activeContextMessageId ? <MessageActionMenu position={contextMenuPosition} own={Boolean(messages.find((item) => item.id === activeContextMessageId)?.senderId === user?.id)} myReaction={messages.find((item) => item.id === activeContextMessageId)?.myReaction} onReaction={selectReaction} onReply={selectReplyMessage} onEdit={selectEditMessage} onDelete={() => { const id = activeContextMessageId; closeContextMenu(); if (id) handleDelete(id); }} onCancel={closeContextMenu} /> : null}
          <View style={[styles.composerArea, { paddingBottom: tabBarHeight + CHAT_COMPOSER_TAB_GAP }]}>
            {editingId ? <View style={styles.editBar}><View style={styles.editBarCopy}><Text style={styles.editBarTitle}>Editando mensagem</Text><Text numberOfLines={1} style={styles.editBarText}>{editingOriginalText}</Text></View><Pressable accessibilityLabel="Cancelar edição" onPress={() => { setEditingId(null); setEditingOriginalText(""); setText(""); }}><Text style={styles.editBarCancel}>Cancelar</Text></Pressable></View> : null}
            {replyingToId ? <View style={styles.editBar}><View style={styles.editBarCopy}><Text style={styles.editBarTitle}>Respondendo a {messages.find((item) => item.id === replyingToId)?.sender?.name ?? friend.name}</Text><Text numberOfLines={1} style={styles.editBarText}>{messages.find((item) => item.id === replyingToId)?.text ?? "Mensagem excluída"}</Text></View><Pressable accessibilityLabel="Cancelar resposta" onPress={() => setReplyingToId(null)}><Text style={styles.editBarCancel}>Cancelar</Text></Pressable></View> : null}
            {remoteTyping && !editingId ? <Text style={styles.typingIndicator}>{friend.name} está digitando...</Text> : null}
            <View style={styles.composer}>
              <TextInput
                editable={!sending}
                maxLength={2000}
                multiline
                onChangeText={handleTextChange}
                onBlur={() => { if (friendId && !editingId) emitDirectTyping(friendId, false); }}
                onSubmitEditing={() => {
                  if (Platform.OS === "web" && !text.includes("\n")) void handleSend();
                }}
                placeholder="Mensagem…"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={text}
              />
              <Pressable
                accessibilityLabel={editingId ? "Salvar edição" : "Enviar mensagem"}
                disabled={!text.trim() || sending}
                onPress={() => void (editingId ? handleEdit() : handleSend())}
                style={({ pressed }) => [
                  styles.sendButton,
                  !text.trim() && styles.sendButtonEmpty,
                  (!text.trim() || sending) && styles.sendButtonDisabled,
                  pressed && text.trim() && !sending && styles.sendButtonPressed,
                ]}
              >
                {sending ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Svg height={18} width={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke={text.trim() ? colors.background : colors.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function ConversationLoading({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.page}>
      <ScreenContainer maxWidth={760} paddingHorizontal={0}>
        <View style={styles.chatShell}>
          <View style={styles.header}>
            <Pressable onPress={onBack} style={styles.iconButton}>
              <Ionicons color={colors.text} name="chevron-back" size={23} />
            </Pressable>
            <View style={styles.loadingAvatar} />
            <View style={styles.loadingCopy}>
              <View style={styles.loadingTitle} />
              <View style={styles.loadingSubtitle} />
            </View>
          </View>
          <View style={styles.centerState}>
            <ActivityIndicator color={colors.brand} size="small" />
            <Text style={styles.centerStateText}>Carregando conversa...</Text>
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
}

function InvalidConversation({
  message = "Esta conversa não está disponível ou o usuário não faz parte dos seus amigos.",
  onBack,
}: {
  message?: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.page}>
      <ScreenContainer maxWidth={720}>
        <View style={styles.invalidState}>
          <View style={styles.invalidIcon}>
            <Ionicons color={colors.brand} name="chatbubble-ellipses-outline" size={30} />
          </View>
          <Text style={styles.invalidTitle}>Conversa não encontrada</Text>
          <Text style={styles.invalidText}>{message}</Text>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backToListButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.background} name="arrow-back" size={18} />
            <Text style={styles.backToListText}>Voltar para conversas</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  chatContainer: { flex: 1, minHeight: 0, width: "100%" },
  chatShell: { backgroundColor: colors.background, flex: 1, minHeight: 0 },
  header: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 14,
  },
  iconButton: { alignItems: "center", borderRadius: 22, height: 44, justifyContent: "center", marginRight: 4, width: 44 },
  headerCopy: { flex: 1, marginLeft: 11, minWidth: 0 },
  headerName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  statusRow: { alignItems: "center", flexDirection: "row", marginTop: 3 },
  headerStatus: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10 },
  headerOnline: { color: colors.success },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderBottomColor: "rgba(239, 125, 125, 0.18)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorBannerText: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 11, lineHeight: 15 },
  messagesContent: { paddingBottom: 18, paddingHorizontal: 20, paddingTop: 16 },
  emptyMessagesContent: { flexGrow: 1, justifyContent: "center", padding: 28 },
  dayRow: { alignItems: "center", flexDirection: "row", gap: 11, marginBottom: 16, marginTop: 14 },
  dayLine: { backgroundColor: colors.border, flex: 1, height: 1 },
  dayLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10 },
  messageRow: { alignItems: "flex-start", marginBottom: 7, width: "100%" },
  myMessageRow: { alignItems: "flex-end" },
  bubble: { borderRadius: 18, flexShrink: 0, maxWidth: "100%", paddingBottom: 7, paddingHorizontal: 14, paddingTop: 10 },
  groupedBubble: { marginBottom: -3 },
  otherBubble: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderBottomLeftRadius: 4 },
  myBubble: { backgroundColor: colors.brand, borderBottomRightRadius: 4 },
  messageText: { color: colors.text, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  myMessageText: { color: colors.background },
  messageMeta: { alignItems: "center", alignSelf: "flex-end", flexDirection: "row", gap: 3, marginTop: 3 },
  messageTime: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10 },
  readStatus: { color: "#665312", fontFamily: fonts.regular, fontSize: 9 },
  myMessageTime: { color: "#665312" },
  deletedMessageText: { color: colors.textMuted, fontStyle: "italic" },
  editedLabel: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 9, marginTop: 2 },
  replyQuote: { borderLeftColor: colors.textMuted, borderLeftWidth: 2, marginBottom: 6, paddingLeft: 7 },
  replyQuoteAuthor: { color: colors.textMuted, fontSize: 10, fontWeight: "600" },
  replyQuoteText: { color: colors.textMuted, fontSize: 10 },
  reactionRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 3 },
  reactionPill: { color: colors.textMuted, fontSize: 11 },
  messageActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 9 },
  emptyConversation: { alignItems: "center", paddingHorizontal: 18 },
  emptyAvatarRing: { borderColor: colors.brandBorder, borderRadius: 40, borderWidth: 1, padding: 5 },
  emptyTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 25, marginTop: 18 },
  emptyText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 300, textAlign: "center" },
  composerArea: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, paddingBottom: 0, paddingHorizontal: 16, paddingTop: 10 },
  editBar: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flexDirection: "row", marginBottom: 8, paddingHorizontal: 12, paddingVertical: 7 },
  editBarCopy: { flex: 1, minWidth: 0 },
  editBarTitle: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 10 },
  editBarText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 2 },
  editBarCancel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10, marginLeft: 10 },
  typingIndicator: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginBottom: 5, marginLeft: 5 },
  composer: { alignItems: "flex-end", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 20, borderWidth: 1, flexDirection: "row", minHeight: 50, paddingBottom: 5, paddingLeft: 16, paddingRight: 5, paddingTop: 5 },
  input: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 19, maxHeight: 110, minHeight: 39, paddingHorizontal: 0, paddingVertical: 9 },
  sendButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: 21, height: 42, justifyContent: "center", marginLeft: 8, width: 42 },
  sendButtonEmpty: { backgroundColor: colors.surface },
  sendButtonDisabled: { opacity: 1 },
  sendButtonPressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.95 }] },
  loadingAvatar: { backgroundColor: colors.elevated, borderRadius: 22, height: 44, width: 44 },
  loadingCopy: { flex: 1, gap: 7, marginLeft: 11 },
  loadingTitle: { backgroundColor: colors.elevated, borderRadius: 5, height: 12, width: 128 },
  loadingSubtitle: { backgroundColor: colors.elevated, borderRadius: 4, height: 8, width: 76 },
  centerState: { alignItems: "center", flex: 1, justifyContent: "center" },
  centerStateText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11, marginTop: 10 },
  invalidState: { alignItems: "center", justifyContent: "center", minHeight: 560, paddingHorizontal: 20 },
  invalidIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  invalidTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 28, marginTop: 18, textAlign: "center" },
  invalidText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, marginTop: 8, maxWidth: 330, textAlign: "center" },
  backToListButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: radii.medium, flexDirection: "row", gap: 8, marginTop: 22, paddingHorizontal: 20, paddingVertical: 13 },
  backToListText: { color: colors.background, fontFamily: fonts.bold, fontSize: 12 },
  pressed: { opacity: 0.72 },
});
