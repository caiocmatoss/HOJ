import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { getGroupMessages, type ApiGroupMessage } from "@/services/api";
import { useGroupQuery } from "@/services/api/resources/groups";
import { joinGroup, leaveGroup, onNewMessage, sendSocketMessage } from "@/services/socket";
import { useChatStore, type ChatMessage } from "@/store/chat-store";

import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";
import { MAIN_TAB_BAR_HEIGHT } from "../navigation/tabBarMetrics";

const CHAT_COMPOSER_TAB_GAP = 8;
import Svg, { Path } from "react-native-svg";

function normalizeMessage(message: ApiGroupMessage): ChatMessage {
  return {
    createdAt: message.createdAt,
    groupId: message.groupId,
    id: message.id,
    text: message.text,
    updatedAt: message.updatedAt,
    user: message.user
      ? {
          avatar: message.user.avatar ?? null,
          id: message.user.id,
          name: message.user.name,
          status: message.user.status ?? "OFFLINE",
        }
      : undefined,
    userId: message.userId,
  };
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
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
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

export default function GroupChatExperience() {
  const tabBarHeight = MAIN_TAB_BAR_HEIGHT;
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const groupId = Array.isArray(params.id) ? params.id[0] : params.id;

  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.accessToken);
  const groupQuery = useGroupQuery(groupId);
  const storedMessages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);


  const [text, setText] = useState("");
  const loadingGroup = groupQuery.isLoading;
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const processedMessageIds = useRef(new Set<string>());

  const group = groupQuery.data ?? null;
  const messages = useMemo(
    () => (groupId ? storedMessages[groupId] ?? [] : []),
    [groupId, storedMessages],
  );

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
  }, []);


  useEffect(() => {
    if (!groupId || !accessToken) {
      setLoadingMessages(false);
      return;
    }

    let cancelled = false;
    setLoadingMessages(true);
    setError(null);

    getGroupMessages(groupId)
      .then((response) => {
        if (cancelled) return;
        const normalized = response.map(normalizeMessage);
        normalized.forEach((message) => processedMessageIds.current.add(message.id));
        setMessages(groupId, normalized);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar as mensagens.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, groupId, setMessages]);

  useEffect(() => {
    if (!groupId || !accessToken) return;

    let active = true;
    let unsubscribe: (() => void) | null = null;

    const connect = async () => {
      setConnecting(true);
      try {
        unsubscribe = onNewMessage((message) => {
          if (!active || message.groupId !== groupId) return;
          if (processedMessageIds.current.has(message.id)) return;

          processedMessageIds.current.add(message.id);
          addMessage(groupId, normalizeMessage(message));
          scrollToBottom(true);
        });
        await joinGroup(groupId);
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
      leaveGroup(groupId);
      processedMessageIds.current.clear();
    };
  }, [accessToken, addMessage, groupId, scrollToBottom]);

  useEffect(() => {
    if (loadingMessages || messages.length === 0) return;
    const timer = setTimeout(() => scrollToBottom(false), 0);
    return () => clearTimeout(timer);
  }, [loadingMessages, messages.length, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !groupId || !user || sending) return;

    setSending(true);
    setError(null);
    try {
      const response = await sendSocketMessage(groupId, trimmed);
      const normalized = normalizeMessage(response);
      processedMessageIds.current.add(normalized.id);
      addMessage(groupId, normalized);
      setText("");
      scrollToBottom(true);
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Não foi possível enviar a mensagem.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => router.replace("/(main)/chat");

  if (!groupId || !user) {
    return <InvalidGroupChat onBack={handleBack} />;
  }

  if (loadingGroup && !group) {
    return <GroupChatLoading onBack={handleBack} />;
  }

  if (!group) {
    return <InvalidGroupChat message={error ?? undefined} onBack={handleBack} />;
  }

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
              accessibilityRole="button"
              onPress={handleBack}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.text} name="chevron-back" size={23} />
            </Pressable>

            <View style={styles.groupAvatar}>
              <Ionicons color={colors.brand} name="people" size={23} />
            </View>

            <View style={styles.headerCopy}>
              <Text numberOfLines={1} style={styles.headerName}>{group.name}</Text>
              <Text style={styles.headerStatus}>
                {connecting
                  ? "Conectando…"
                  : `${(group.members ?? []).length} ${(group.members ?? []).length === 1 ? "membro" : "membros"}`}
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Abrir detalhes do grupo"
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/(main)/group/[id]", params: { id: group.id } })
              }
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Ionicons color={colors.textSecondary} name="information-circle-outline" size={23} />
            </Pressable>
          </View>

          {error ? (
            <View accessibilityRole="alert" style={styles.errorBanner}>
              <Ionicons color={colors.danger} name="alert-circle-outline" size={18} />
              <Text numberOfLines={2} style={styles.errorBannerText}>{error}</Text>
              <Pressable accessibilityLabel="Fechar aviso" onPress={() => setError(null)}>
                <Ionicons color={colors.textMuted} name="close" size={18} />
              </Pressable>
            </View>
          ) : null}

          {loadingMessages ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.brand} size="small" />
              <Text style={styles.centerStateText}>Carregando mensagens…</Text>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={
                messages.length > 0 ? styles.messagesContent : styles.emptyMessagesContent
              }
              data={messages}
              keyExtractor={(item) => item.id}
              keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollToBottom(false)}
              ref={listRef}
              renderItem={({ item, index }) => {
                const isMine = item.userId === user.id;
                const previous = messages[index - 1];
                const next = messages[index + 1];
                const showDay =
                  !previous ||
                  new Date(previous.createdAt).toDateString() !==
                    new Date(item.createdAt).toDateString();
                const startsSequence = !previous || previous.userId !== item.userId || showDay;
                const continuesSequence = next?.userId === item.userId;
                const senderName = item.user?.name ?? "Participante";

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
                      {!isMine ? (
                        startsSequence ? (
                          <UserAvatar name={senderName} size={30} uri={item.user?.avatar} />
                        ) : (
                          <View style={styles.avatarSpacer} />
                        )
                      ) : null}

                      <View
                        style={[
                          styles.bubble,
                          isMine ? styles.myBubble : styles.otherBubble,
                          continuesSequence && styles.groupedBubble,
                        ]}
                      >
                        {!isMine && startsSequence ? (
                          <Text style={styles.senderName}>{senderName}</Text>
                        ) : null}
                        <Text style={[styles.messageText, isMine && styles.myMessageText]}>
                          {item.text}
                        </Text>
                        <View style={styles.messageMeta}>
                          <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
                            {formatMessageTime(item.createdAt)}
                          </Text>
                          {isMine ? (
                            <Ionicons color="#665312" name="checkmark-done" size={13} />
                          ) : null}
                        </View>
                      </View>
                    </View>
                  </>
                );
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyConversation}>
                  <View style={styles.emptyIcon}>
                    <Ionicons color={colors.brand} name="chatbubbles-outline" size={30} />
                  </View>
                  <Text style={styles.emptyTitle}>Comece a conversa</Text>
                  <Text style={styles.emptyText}>
                    Envie a primeira mensagem para o grupo {group.name}.
                  </Text>
                </View>
              }
            />
          )}

          <View style={[styles.composerArea, { paddingBottom: tabBarHeight + CHAT_COMPOSER_TAB_GAP }]}>
            <View style={styles.composer}>
              <TextInput
                accessibilityLabel="Mensagem para o grupo"
                editable={!sending}
                maxLength={2000}
                multiline
                onChangeText={setText}
                onSubmitEditing={() => {
                  if (Platform.OS === "web" && !text.includes("\n")) void handleSend();
                }}
                placeholder="Mensagem…"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
                value={text}
              />
              <Pressable
                accessibilityLabel="Enviar mensagem"
                accessibilityRole="button"
                disabled={!text.trim() || sending}
                onPress={() => void handleSend()}
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

function GroupChatLoading({ onBack }: { onBack: () => void }) {
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
            <Text style={styles.centerStateText}>Carregando conversa…</Text>
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
}

function InvalidGroupChat({
  message = "Esta conversa não está disponível ou você não possui acesso ao grupo.",
  onBack,
}: {
  message?: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.statePage}>
      <View style={styles.stateIcon}>
        <Ionicons color={colors.brand} name="chatbubbles-outline" size={30} />
      </View>
      <Text style={styles.stateTitle}>Conversa não encontrada</Text>
      <Text style={styles.stateText}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [styles.stateButton, pressed && styles.sendButtonPressed]}
      >
        <Ionicons color={colors.background} name="arrow-back" size={18} />
        <Text style={styles.stateButtonText}>Voltar para conversas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  chatContainer: { flex: 1, minHeight: 0, width: "100%" },
  chatShell: { backgroundColor: colors.background, flex: 1, minHeight: 0 },
  header: { alignItems: "center", backgroundColor: "rgba(21, 25, 29, 0.96)", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", minHeight: 72, paddingHorizontal: 10, paddingVertical: 10 },
  iconButton: { alignItems: "center", borderRadius: 22, height: 44, justifyContent: "center", marginRight: 4, width: 44 },
  groupAvatar: { alignItems: "center", backgroundColor: colors.brandSoft, borderColor: colors.brandBorder, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  headerCopy: { flex: 1, marginLeft: 11, minWidth: 0 },
  headerName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  headerStatus: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  errorBanner: { alignItems: "center", backgroundColor: colors.dangerSoft, borderBottomColor: "rgba(239, 125, 125, 0.18)", borderBottomWidth: 1, flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  errorBannerText: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 11, lineHeight: 15 },
  messagesContent: { paddingBottom: 18, paddingHorizontal: 14, paddingTop: 8 },
  emptyMessagesContent: { flexGrow: 1, justifyContent: "center", padding: 28 },
  dayRow: { alignItems: "center", flexDirection: "row", gap: 11, marginBottom: 16, marginTop: 14 },
  dayLine: { backgroundColor: colors.border, flex: 1, height: 1 },
  dayLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10 },
  messageRow: { alignItems: "flex-start", flexDirection: "row", gap: 7, marginBottom: 7, width: "100%" },
  myMessageRow: { justifyContent: "flex-end" },
  avatarSpacer: { height: 30, width: 30 },
  bubble: { borderRadius: 19, maxWidth: "78%", paddingBottom: 7, paddingHorizontal: 13, paddingTop: 8 },
  groupedBubble: { marginBottom: -3 },
  otherBubble: { backgroundColor: colors.elevated, borderColor: colors.border, borderWidth: 1 },
  myBubble: { backgroundColor: colors.brand },
  senderName: { color: colors.brand, fontFamily: fonts.bold, fontSize: 10, marginBottom: 3 },
  messageText: { color: colors.text, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  myMessageText: { color: colors.background },
  messageMeta: { alignItems: "center", alignSelf: "flex-end", flexDirection: "row", gap: 3, marginTop: 3 },
  messageTime: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 8 },
  myMessageTime: { color: "#665312" },
  emptyConversation: { alignItems: "center", paddingHorizontal: 18 },
  emptyIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  emptyTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 25, marginTop: 18 },
  emptyText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 300, textAlign: "center" },
  composerArea: { backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 1, paddingBottom: 0, paddingHorizontal: 12, paddingTop: 9 },
  composer: { alignItems: "flex-end", backgroundColor: colors.elevated, borderColor: colors.borderStrong, borderRadius: radii.large, borderWidth: 1, flexDirection: "row", minHeight: 50, paddingBottom: 5, paddingLeft: 14, paddingRight: 5, paddingTop: 5 },
  input: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 19, maxHeight: 110, minHeight: 39, paddingHorizontal: 0, paddingVertical: 9 },
  sendButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: 21, height: 42, justifyContent: "center", marginLeft: 8, width: 42 },
  sendButtonEmpty: { backgroundColor: colors.surface },
  sendButtonDisabled: { opacity: 1 },
  sendButtonPressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.95 }] },
  centerState: { alignItems: "center", flex: 1, justifyContent: "center" },
  centerStateText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11, marginTop: 10 },
  loadingAvatar: { backgroundColor: colors.elevated, borderRadius: 22, height: 44, width: 44 },
  loadingCopy: { flex: 1, gap: 7, marginLeft: 11 },
  loadingTitle: { backgroundColor: colors.elevated, borderRadius: 5, height: 12, width: 140 },
  loadingSubtitle: { backgroundColor: colors.elevated, borderRadius: 4, height: 8, width: 84 },
  pressed: { opacity: 0.72 },
  statePage: { alignItems: "center", backgroundColor: colors.background, flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  stateIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  stateTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 28, marginTop: 18, textAlign: "center" },
  stateText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19, marginTop: 8, maxWidth: 340, textAlign: "center" },
  stateButton: { alignItems: "center", backgroundColor: colors.brand, borderRadius: radii.medium, flexDirection: "row", gap: 8, marginTop: 22, paddingHorizontal: 20, paddingVertical: 13 },
  stateButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 12 },
});
