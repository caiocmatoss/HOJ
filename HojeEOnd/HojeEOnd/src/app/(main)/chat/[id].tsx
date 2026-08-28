import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  useChatStore,
  type DirectChatMessage,
} from "@/store/chat-store";

import { ScreenContainer } from "@/components/ui/ScreenContainer";

import {
  getDirectMessages,
  getFriends,
  type ApiFriend,
} from "@/services/api";

import { useUserStore } from "@/store/user-store";

import { usePresenceStore } from "@/store/presence-store";

import {
  joinDirectConversation,
  leaveDirectConversation,
  onNewDirectMessage,
  sendDirectSocketMessage,
} from "@/services/socket";

function createDirectConversationId(
  userId: string,
  friendId: string,
): string {
  const ids = [
    userId,
    friendId,
  ].sort();

  return `direct-${ids[0]}-${ids[1]}`;
}

function formatMessageTime(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default function DirectChatScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const friendId =
    Array.isArray(id)
      ? id[0]
      : id;

  const user =
    useUserStore(
      (state) =>
        state.user,
    );

  const accessToken =
    useUserStore(
      (state) =>
        state.accessToken,
    );

  const directMessages =
    useChatStore(
      (state) =>
        state.directMessages,
    );

  const setDirectMessages =
    useChatStore(
      (state) =>
        state.setDirectMessages,
    );

  const addDirectMessage =
    useChatStore(
      (state) =>
        state.addDirectMessage,
    );

  const [
    text,
    setText,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    connecting,
    setConnecting,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [friend, setFriend] = useState<ApiFriend | null>(null);

  const presenceStatuses = usePresenceStore((state) => state.statuses);

  const conversationId =
    useMemo(() => {
      if (
        !user ||
        !friendId
      ) {
        return null;
      }

      return createDirectConversationId(
        user.id,
        friendId,
      );
    }, [
      friendId,
      user,
    ]);

  const messages =
    conversationId
      ? directMessages[
          conversationId
        ] ?? []
      : [];

  /*
   * =========================================================
   * HISTÓRICO DA CONVERSA PRIVADA
   * =========================================================
   *
   * Backend:
   *
   * GET /direct-messages/:userId
   *
   * O frontend anteriormente estava usando:
   *
   * GET /users/:userId/messages
   *
   * que não corresponde ao DirectMessagesController.
   */

  useEffect(() => {
    if (!user || !friendId || !conversationId || !accessToken) {
      setFriend(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      setLoading(true);
      setError(null);
      setFriend(null);

      try {
        const realFriends = await getFriends();
        const realFriend = realFriends.find((item) => item.id === friendId);

        if (cancelled) {
          return;
        }

        if (!realFriend) {
          setFriend(null);
          return;
        }

        setFriend(realFriend);
        const response = await getDirectMessages(friendId);

        if (cancelled) {
          return;
        }

        setDirectMessages(conversationId, response);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        console.error("[Chat] erro ao carregar conversa privada:", requestError);
        setError(requestError instanceof Error ? requestError.message : "Não foi possível carregar a conversa.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadConversation();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    conversationId,
    friendId,
    setDirectMessages,
    user,
  ]);

  /*
   * =========================================================
   * SOCKET.IO — CONVERSA PRIVADA
   * =========================================================
   *
   * IMPORTANTE:
   *
   * O listener é registrado antes de entrar no room.
   *
   * Isso evita a possibilidade de uma mensagem chegar
   * entre o join e o registro do listener.
   */

  useEffect(() => {
    if (
      !user ||
      !friendId ||
      !conversationId ||
      !accessToken ||
      loading
    ) {
      return;
    }

    let active = true;

    let unsubscribe:
      | (() => void)
      | null = null;

    const handleNewMessage =
      (
        message: DirectChatMessage,
      ) => {
        if (!active) {
          return;
        }

        const belongsToConversation =
          (
            message.senderId ===
              user.id &&
            message.receiverId ===
              friendId
          ) ||
          (
            message.senderId ===
              friendId &&
            message.receiverId ===
              user.id
          );

        if (
          !belongsToConversation
        ) {
          return;
        }

        console.log(
          "[Chat] direct:message:new:",
          message,
        );

        addDirectMessage(
          conversationId,
          message,
        );
      };

    const connect =
      async () => {
        setConnecting(true);

        try {
          /*
           * Primeiro registra o listener.
           */
          unsubscribe =
            onNewDirectMessage(
              handleNewMessage,
            );

          if (!active) {
            return;
          }

          /*
           * Depois entra no room privado.
           */
          await joinDirectConversation(
            friendId,
          );

          if (!active) {
            return;
          }

          console.log(
            "[Chat] conversa privada conectada:",
            friendId,
          );
        } catch (
          socketError
        ) {
          if (!active) {
            return;
          }

          console.error(
            "[Chat] erro ao conectar conversa privada:",
            socketError,
          );

          setError(
            socketError instanceof Error
              ? socketError.message
              : "Não foi possível conectar ao chat.",
          );
        } finally {
          if (active) {
            setConnecting(false);
          }
        }
      };

    void connect();

    return () => {
      active = false;

      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      leaveDirectConversation(
        friendId,
      );
    };
  }, [
    accessToken,
    conversationId,
    friendId,
    user,
    addDirectMessage,
  ]);

  /*
   * =========================================================
   * VOLTAR
   * =========================================================
   */

  const handleBack = () => {
    router.replace(
      "/(main)/chat",
    );
  };

  /*
   * =========================================================
   * ENVIAR MENSAGEM
   * =========================================================
   */

  const handleSend = async () => {
    const trimmedText =
      text.trim();

    if (
      !trimmedText ||
      !user ||
      !friend ||
      !friendId ||
      !conversationId ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const message =
        await sendDirectSocketMessage(
          friendId,
          trimmedText,
        );

      /*
       * A mensagem enviada pelo servidor
       * é adicionada imediatamente.
       *
       * Caso direct:message:new também
       * seja recebido, o Zustand usa o ID
       * da mensagem para impedir duplicação.
       */
      addDirectMessage(
        conversationId,
        message,
      );

      setText("");

      console.log(
        "[Chat] mensagem privada enviada:",
        message,
      );
    } catch (
      sendError
    ) {
      console.error(
        "[Chat] erro ao enviar mensagem privada:",
        sendError,
      );

      setError(
        sendError instanceof Error
          ? sendError.message
          : "Não foi possível enviar a mensagem.",
      );
    } finally {
      setSending(false);
    }
  };

  /*
   * =========================================================
   * CONVERSA INVÁLIDA
   * =========================================================
   */

  if (
    !friendId ||
    !friend ||
    !user ||
    !conversationId
  ) {
    return (
      <View
        style={
          styles.errorScreen
        }
      >
        <ScreenContainer
          maxWidth={760}
        >
          <View
            style={
              styles.errorContainer
            }
          >
            <Text
              style={
                styles.errorIcon
              }
            >
              💬
            </Text>

            <Text
              style={
                styles.errorTitle
              }
            >
              Amigo não encontrado
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              Não foi possível carregar esta conversa.
            </Text>

            <Pressable
              onPress={
                handleBack
              }
              style={({ pressed }) => [
                styles.errorButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.errorButtonText
                }
              >
                Voltar para conversas
              </Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const isOnline =
    (presenceStatuses[friend.id] ?? friend.status) ===
    "ONLINE";

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        90
      }
    >
      <ScreenContainer
        maxWidth={820}
      >
        <View
          style={
            styles.chatContainer
          }
        >
          <View
            style={
              styles.header
            }
          >
            <Pressable
              onPress={
                handleBack
              }
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                ‹
              </Text>
            </Pressable>

            {friend.avatar ? (
              <Image
                source={{
                  uri:
                    friend.avatar,
                }}
                style={
                  styles.headerAvatar
                }
              />
            ) : (
              <View
                style={
                  styles.headerAvatarPlaceholder
                }
              >
                <Text
                  style={
                    styles.headerAvatarText
                  }
                >
                  {friend.name
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>
            )}

            <View
              style={
                styles.headerInfo
              }
            >
              <Text
                style={
                  styles.headerName
                }
                numberOfLines={
                  1
                }
              >
                {friend.name}
              </Text>

              <Text
                style={[
                  styles.headerStatus,
                  isOnline &&
                    styles.onlineText,
                ]}
              >
                {isOnline
                  ? "Online"
                  : "Offline"}
              </Text>
            </View>

            {connecting ? (
              <ActivityIndicator
                size="small"
                color="#FFC400"
              />
            ) : null}
          </View>

          {error ? (
            <View
              style={
                styles.errorBanner
              }
            >
              <Text
                style={
                  styles.errorBannerText
                }
              >
                {error}
              </Text>
            </View>
          ) : null}

          {loading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <ActivityIndicator
                size="small"
                color="#FFC400"
              />

              <Text
                style={
                  styles.loadingText
                }
              >
                Carregando conversa...
              </Text>
            </View>
          ) : (
            <FlatList
              data={
                messages
              }
              keyExtractor={(
                item,
              ) =>
                item.id
              }
              contentContainerStyle={
                messages.length >
                0
                  ? styles.messagesContent
                  : styles.emptyMessages
              }
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
              renderItem={({
                item,
              }) => {
                const isMine =
                  item.senderId ===
                  user.id;

                return (
                  <View
                    style={[
                      styles.messageRow,
                      isMine &&
                        styles.myMessageRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,
                        isMine
                          ? styles.myBubble
                          : styles.otherBubble,
                      ]}
                    >
                      {!isMine &&
                      item.sender ? (
                        <Text
                          style={
                            styles.messageUser
                          }
                        >
                          {
                            item
                              .sender
                              .name
                          }
                        </Text>
                      ) : null}

                      <Text
                        style={[
                          styles.messageText,
                          isMine &&
                            styles.myMessageText,
                        ]}
                      >
                        {item.text}
                      </Text>

                      <Text
                        style={[
                          styles.messageTime,
                          isMine &&
                            styles.myMessageTime,
                        ]}
                      >
                        {formatMessageTime(
                          item.createdAt,
                        )}
                      </Text>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View
                  style={
                    styles.emptyConversation
                  }
                >
                  <Text
                    style={
                      styles.emptyIcon
                    }
                  >
                    💬
                  </Text>

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    Comece a conversa
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    Envie a primeira mensagem para{" "}
                    {friend.name}.
                  </Text>
                </View>
              }
            />
          )}

          <View
            style={
              styles.inputContainer
            }
          >
            <TextInput
              value={text}
              onChangeText={
                setText
              }
              placeholder="Digite uma mensagem..."
              placeholderTextColor="#777777"
              style={
                styles.input
              }
              multiline
              maxLength={2000}
              editable={
                !sending
              }
              onSubmitEditing={() => {
                if (
                  Platform.OS ===
                  "web"
                ) {
                  void handleSend();
                }
              }}
            />

            <Pressable
              disabled={
                !text.trim() ||
                sending
              }
              onPress={() => {
                void handleSend();
              }}
              style={({ pressed }) => [
                styles.sendButton,

                (!text.trim() ||
                  sending) &&
                  styles.sendButtonDisabled,

                pressed &&
                  text.trim() &&
                  !sending &&
                  styles.pressed,
              ]}
            >
              {sending ? (
                <ActivityIndicator
                  size="small"
                  color="#000000"
                />
              ) : (
                <Text
                  style={
                    styles.sendButtonText
                  }
                >
                  ➤
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#090909",
    },

    chatContainer: {
      flex: 1,
      minHeight: 0,
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor:
        "#292929",
    },

    backButton: {
      width: 42,
      height: 42,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 8,
    },

    backButtonText: {
      color: "#FFC400",
      fontSize: 36,
      lineHeight: 38,
    },

    headerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        "#333333",
    },

    headerAvatarPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        "#2A2300",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerAvatarText: {
      color: "#FFC400",
      fontSize: 18,
      fontWeight:
        "800",
    },

    headerInfo: {
      flex: 1,
      marginLeft: 12,
    },

    headerName: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight:
        "800",
    },

    headerStatus: {
      color: "#777777",
      fontSize: 12,
      marginTop: 3,
    },

    onlineText: {
      color: "#4CAF50",
    },

    loadingContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      color: "#888888",
      fontSize: 13,
      marginTop: 10,
    },

    messagesContent: {
      paddingVertical: 18,
    },

    emptyMessages: {
      flexGrow: 1,
      justifyContent:
        "center",
      paddingVertical: 30,
    },

    emptyConversation: {
      alignItems:
        "center",
      paddingHorizontal: 20,
    },

    emptyIcon: {
      fontSize: 42,
    },

    emptyTitle: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight:
        "800",
      marginTop: 12,
    },

    emptyText: {
      color: "#888888",
      fontSize: 14,
      textAlign:
        "center",
      marginTop: 6,
    },

    messageRow: {
      width: "100%",
      alignItems:
        "flex-start",
      marginBottom: 10,
    },

    myMessageRow: {
      alignItems:
        "flex-end",
    },

    messageBubble: {
      maxWidth: "78%",
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
    },

    otherBubble: {
      backgroundColor:
        "#1B1B1B",
      borderColor:
        "#292929",
    },

    myBubble: {
      backgroundColor:
        "#FFC400",
      borderColor:
        "#FFC400",
    },

    messageUser: {
      color: "#FFC400",
      fontSize: 12,
      fontWeight:
        "800",
      marginBottom: 4,
    },

    messageText: {
      color: "#FFFFFF",
      fontSize: 15,
      lineHeight: 21,
    },

    myMessageText: {
      color: "#000000",
    },

    messageTime: {
      color: "#777777",
      fontSize: 10,
      marginTop: 4,
      alignSelf:
        "flex-end",
    },

    myMessageTime: {
      color: "#594800",
    },

    inputContainer: {
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor:
        "#292929",
      gap: 10,
    },

    input: {
      flex: 1,
      minHeight: 46,
      maxHeight: 120,
      backgroundColor:
        "#1B1B1B",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#333333",
      color: "#FFFFFF",
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 15,
    },

    sendButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "#FFC400",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    sendButtonDisabled: {
      opacity: 0.35,
    },

    sendButtonText: {
      color: "#000000",
      fontSize: 20,
      fontWeight:
        "800",
    },

    errorBanner: {
      backgroundColor:
        "#2A1700",
      borderWidth: 1,
      borderColor:
        "#5A3500",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginTop: 10,
    },

    errorBannerText: {
      color: "#FFC400",
      fontSize: 12,
    },

    errorScreen: {
      flex: 1,
      backgroundColor:
        "#090909",
    },

    errorContainer: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingTop: 80,
    },

    errorIcon: {
      fontSize: 48,
    },

    errorTitle: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight:
        "800",
      marginTop: 16,
      textAlign:
        "center",
    },

    errorText: {
      color: "#888888",
      fontSize: 14,
      marginTop: 8,
      textAlign:
        "center",
    },

    errorButton: {
      backgroundColor:
        "#FFC400",
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 13,
      marginTop: 22,
    },

    errorButtonText: {
      color: "#000000",
      fontSize: 14,
      fontWeight:
        "800",
    },

    pressed: {
      opacity: 0.8,
    },
  });
