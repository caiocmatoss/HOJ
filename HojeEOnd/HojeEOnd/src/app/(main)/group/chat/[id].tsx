import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { getGroupMessages, type ApiGroupMessage } from "@/services/api";

import {
  joinGroup,
  leaveGroup,
  onNewMessage,
  sendSocketMessage,
} from "@/services/socket";

import {
  useChatStore,
  type ChatMessage,
} from "@/store/chat-store";

import { useGroupStore } from "@/store/group-store";

import { useUserStore } from "@/store/user-store";

function normalizeMessage(
  message: ApiGroupMessage,
): ChatMessage {
  return {
    id: message.id,
    groupId: message.groupId,
    userId: message.userId,
    text: message.text,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,

    user: message.user
      ? {
          id: message.user.id,
          name: message.user.name,
          avatar:
            message.user.avatar ??
            null,
          status:
            message.user.status ??
            "OFFLINE",
        }
      : undefined,
  };
}

function getTimestamp(
  value?: string,
): number {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
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

export default function GroupChatScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const groupId =
    Array.isArray(id)
      ? id[0]
      : id;

  const user =
    useUserStore(
      (state) =>
        state.user,
    );

  const groups =
    useGroupStore(
      (state) =>
        state.groups,
    );

  const messages =
    useChatStore(
      (state) =>
        state.messages,
    );

  const setMessages =
    useChatStore(
      (state) =>
        state.setMessages,
    );

  const addMessage =
    useChatStore(
      (state) =>
        state.addMessage,
    );

  const [text, setText] =
    useState("");

  const [
    loadingMessages,
    setLoadingMessages,
  ] = useState(true);

  const [sending, setSending] =
    useState(false);

  const [chatError, setChatError] =
    useState<
      string | null
    >(null);

  const listRef =
    useRef<
      FlatList<ChatMessage>
    >(null);

  /*
   * Guarda o ID da última mensagem
   * processada pela tela.
   *
   * Além da deduplicação no Zustand,
   * isso evita processamento duplicado
   * do mesmo evento pelo componente.
   */
  const processedMessageIds =
    useRef(
      new Set<string>(),
    );

  const group = useMemo(() => {
    if (!groupId) {
      return undefined;
    }

    return groups.find(
      (item) =>
        item.id === groupId,
    );
  }, [
    groupId,
    groups,
  ]);

  const groupMessages =
    useMemo<ChatMessage[]>(() => {
      if (!groupId) {
        return [];
      }

      const currentMessages =
        messages[groupId] ??
        [];

      return [
        ...currentMessages,
      ].sort(
        (a, b) =>
          getTimestamp(
            a.createdAt,
          ) -
          getTimestamp(
            b.createdAt,
          ),
      );
    }, [
      groupId,
      messages,
    ]);

  const scrollToBottom =
    useCallback(
      (animated = true) => {
        requestAnimationFrame(
          () => {
            listRef.current?.scrollToEnd(
              {
                animated,
              },
            );
          },
        );
      },
      [],
    );

  /*
   * Carrega o histórico via REST.
   */
  useEffect(() => {
    if (!groupId) {
      return;
    }

    let cancelled = false;

    const loadMessages =
      async () => {
        try {
          setLoadingMessages(
            true,
          );

          setChatError(null);

          const response = await getGroupMessages(groupId);

          if (cancelled) {
            return;
          }

          const normalized =
            response.map(
              normalizeMessage,
            );

          /*
           * Marca as mensagens do histórico
           * como já conhecidas.
           *
           * Assim, se o Socket enviar
           * uma delas novamente, ela não
           * será processada como nova.
           */
          for (const message of normalized) {
            processedMessageIds.current.add(
              message.id,
            );
          }

          setMessages(
            groupId,
            normalized,
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "[GroupChat] Erro ao carregar mensagens:",
            error,
          );

          setChatError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as mensagens.",
          );
        } finally {
          if (!cancelled) {
            setLoadingMessages(
              false,
            );
          }
        }
      };

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [
    groupId,
    setMessages,
  ]);

  /*
   * Socket.IO.
   *
   * Existe exatamente um listener
   * ativo para esta tela.
   */
  useEffect(() => {
    if (!groupId) {
      return;
    }

    let active = true;
    let removeListener:
      | (() => void)
      | null = null;

    const setupSocket =
      async () => {
        try {
          /*
           * Primeiro registra o listener.
           */
          removeListener =
            onNewMessage(
              (
                message,
              ) => {
                if (!active) {
                  return;
                }

                if (
                  message.groupId !==
                  groupId
                ) {
                  return;
                }

                /*
                 * Ignora o mesmo ID caso o
                 * Socket.IO entregue o evento
                 * mais de uma vez.
                 */
                if (
                  processedMessageIds.current.has(
                    message.id,
                  )
                ) {
                  console.log(
                    "[GroupChat] message:new duplicada ignorada:",
                    message.id,
                  );

                  return;
                }

                processedMessageIds.current.add(
                  message.id,
                );

                console.log(
                  "[GroupChat] message:new recebido pela tela:",
                  message,
                );

                const normalized =
                  normalizeMessage(
                    message,
                  );

                addMessage(
                  groupId,
                  normalized,
                );

                scrollToBottom(
                  true,
                );
              },
            );

          /*
           * Depois entra na sala.
           */
          await joinGroup(
            groupId,
          );
        } catch (error) {
          console.error(
            "[GroupChat] Erro Socket.IO:",
            error,
          );

          if (active) {
            setChatError(
              error instanceof
                Error
                ? error.message
                : "Não foi possível conectar ao chat em tempo real.",
            );
          }
        }
      };

    void setupSocket();

    return () => {
      active = false;

      /*
       * Remove primeiro o listener.
       */
      if (removeListener) {
        removeListener();
        removeListener = null;
      }

      /*
       * Depois sai da sala.
       */
      leaveGroup(
        groupId,
      );

      /*
       * Limpa os IDs processados desta
       * instância da tela.
       */
      processedMessageIds.current.clear();
    };
  }, [
    groupId,
    addMessage,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (
      !loadingMessages &&
      groupMessages.length > 0
    ) {
      scrollToBottom(false);
    }
  }, [
    loadingMessages,
    groupMessages.length,
    scrollToBottom,
  ]);

  const handleBack = () => {
    router.replace(
      "/(main)/chat",
    );
  };

  const handleSend =
    async () => {
      const trimmedText =
        text.trim();

      if (
        !trimmedText ||
        !groupId ||
        !user ||
        sending
      ) {
        return;
      }

      try {
        setSending(true);

        setChatError(null);

        const sentMessage =
          await sendSocketMessage(
            groupId,
            trimmedText,
          );

        const normalized =
          normalizeMessage(
            sentMessage,
          );

        /*
         * A confirmação message:sent
         * possui o mesmo ID que message:new.
         *
         * Marcamos o ID antes de adicionar
         * para impedir qualquer duplicação.
         */
        processedMessageIds.current.add(
          normalized.id,
        );

        addMessage(
          groupId,
          normalized,
        );

        setText("");

        scrollToBottom(true);
      } catch (error) {
        console.error(
          "[GroupChat] Erro ao enviar mensagem:",
          error,
        );

        setChatError(
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a mensagem.",
        );
      } finally {
        setSending(false);
      }
    };

  if (!groupId) {
    return (
      <View
        style={
          styles.errorScreen
        }
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
            👥
          </Text>

          <Text
            style={
              styles.errorTitle
            }
          >
            Grupo não informado
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            Não foi possível
            identificar o grupo.
          </Text>

          <Pressable
            onPress={
              handleBack
            }
            style={
              styles.backButton
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              Voltar para conversas
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!group) {
    return (
      <View
        style={
          styles.errorScreen
        }
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
            👥
          </Text>

          <Text
            style={
              styles.errorTitle
            }
          >
            Grupo não encontrado
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            Não foi possível
            carregar esta
            conversa.
          </Text>

          <Pressable
            onPress={
              handleBack
            }
            style={
              styles.backButton
            }
          >
            <Text
              style={
                styles.backButtonText
              }
            >
              Voltar para conversas
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderMessage =
    ({
      item,
    }: {
      item: ChatMessage;
    }) => {
      const isMine =
        item.userId ===
        user?.id;

      const messageUser =
        item.user?.name ??
        "Usuário";

      return (
        <View
          style={[
            styles.messageRow,
            isMine
              ? styles.messageRowMine
              : styles.messageRowOther,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isMine
                ? styles.messageBubbleMine
                : styles.messageBubbleOther,
            ]}
          >
            {!isMine && (
              <Text
                style={
                  styles.messageUser
                }
              >
                {messageUser}
              </Text>
            )}

            <Text
              style={[
                styles.messageText,
                isMine
                  ? styles.messageTextMine
                  : styles.messageTextOther,
              ]}
            >
              {item.text}
            </Text>

            <Text
              style={[
                styles.messageTime,
                isMine
                  ? styles.messageTimeMine
                  : styles.messageTimeOther,
              ]}
            >
              {formatMessageTime(
                item.createdAt,
              )}
            </Text>
          </View>
        </View>
      );
    };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : Platform.OS === "android"
          ? "height"
          : undefined
      }
      keyboardVerticalOffset={80}
    >
      <View
        style={
          styles.screenContent
        }
      >
        <View
          style={
            styles.chatWrapper
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
              style={({
                pressed,
              }) => [
                styles.headerBackButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.headerBackText
                }
              >
                ‹
              </Text>
            </Pressable>

            <View
              style={
                styles.headerAvatar
              }
            >
              <Text
                style={
                  styles.headerAvatarText
                }
              >
                👥
              </Text>
            </View>

            <View
              style={
                styles.headerContent
              }
            >
              <Text
                style={
                  styles.headerTitle
                }
                numberOfLines={1}
              >
                {group.name}
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                {group.members.length}{" "}
                {group.members.length ===
                1
                  ? "membro"
                  : "membros"}
              </Text>
            </View>
          </View>

          {chatError ? (
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
                {chatError}
              </Text>
            </View>
          ) : null}

          <View
            style={
              styles.messagesArea
            }
          >
            {loadingMessages ? (
              <View
                style={
                  styles.loadingContainer
                }
              >
                <ActivityIndicator
                  size="large"
                  color="#FFC400"
                />

                <Text
                  style={
                    styles.loadingText
                  }
                >
                  Carregando mensagens...
                </Text>
              </View>
            ) : (
              <FlatList
                ref={listRef}
                style={
                  styles.messagesList
                }
                data={
                  groupMessages
                }
                keyExtractor={(
                  item,
                ) =>
                  item.id
                }
                renderItem={
                  renderMessage
                }
                showsVerticalScrollIndicator={
                  true
                }
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={
                  Platform.OS ===
                  "ios"
                    ? "interactive"
                    : "on-drag"
                }
                contentContainerStyle={[
                  styles.messagesContent,

                  groupMessages.length ===
                    0
                    ? styles.emptyMessagesContent
                    : null,
                ]}
                ListEmptyComponent={
                  <View
                    style={
                      styles.emptyMessages
                    }
                  >
                    <Text
                      style={
                        styles.emptyMessagesIcon
                      }
                    >
                      💬
                    </Text>

                    <Text
                      style={
                        styles.emptyMessagesTitle
                      }
                    >
                      Nenhuma mensagem ainda
                    </Text>

                    <Text
                      style={
                        styles.emptyMessagesText
                      }
                    >
                      Envie a primeira
                      mensagem do grupo.
                    </Text>
                  </View>
                }
              />
            )}
          </View>

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
              multiline
              maxLength={2000}
              editable={!sending}
              style={
                styles.input
              }
              textAlignVertical="top"
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                void handleSend();
              }}
            />

            <Pressable
              onPress={() => {
                void handleSend();
              }}
              disabled={
                !text.trim() ||
                sending
              }
              style={({
                pressed,
              }) => [
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor:
        "#090909",
    },

    screenContent: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      paddingBottom: 82,
    },

    chatWrapper: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      maxWidth: 820,
      alignSelf: "center",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#1B1B1B",
      borderBottomWidth: 1,
      borderBottomColor:
        "#292929",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 16,
      flexShrink: 0,
      marginHorizontal: 8,
    },

    headerBackButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#252525",
      marginRight: 10,
    },

    headerBackText: {
      color: "#FFC400",
      fontSize: 32,
      lineHeight: 34,
    },

    headerAvatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "#2A2300",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    headerAvatarText: {
      fontSize: 23,
    },

    headerContent: {
      flex: 1,
      minWidth: 0,
    },

    headerTitle: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight:
        "800",
    },

    headerSubtitle: {
      color: "#888888",
      fontSize: 12,
      marginTop: 3,
    },

    messagesArea: {
      flex: 1,
      minHeight: 0,
      width: "100%",
    },

    messagesList: {
      flex: 1,
      minHeight: 0,
      width: "100%",
    },

    messagesContent: {
      paddingHorizontal: 14,
      paddingTop: 16,
      paddingBottom: 18,
    },

    emptyMessagesContent: {
      flexGrow: 1,
      justifyContent:
        "center",
    },

    messageRow: {
      width: "100%",
      flexDirection:
        "row",
      marginBottom: 10,
      paddingHorizontal: 8,
    },

    messageRowOther: {
      justifyContent:
        "flex-start",
    },

    messageRowMine: {
      justifyContent:
        "flex-end",
    },

    messageBubble: {
      maxWidth: "82%",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
    },

    messageBubbleOther: {
      backgroundColor:
        "#1B1B1B",
      borderColor:
        "#292929",
    },

    messageBubbleMine: {
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
      fontSize: 14,
      lineHeight: 20,
    },

    messageTextOther: {
      color: "#FFFFFF",
    },

    messageTextMine: {
      color: "#000000",
    },

    messageTime: {
      fontSize: 10,
      marginTop: 5,
      alignSelf:
        "flex-end",
    },

    messageTimeOther: {
      color: "#777777",
    },

    messageTimeMine: {
      color: "#4A4200",
    },

    inputContainer: {
      flexDirection:
        "row",
      alignItems:
        "flex-end",
      backgroundColor:
        "#1B1B1B",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#292929",
      padding: 8,
      marginHorizontal: 8,
      marginTop: 8,
      marginBottom: 8,
      minHeight: 60,
      flexShrink: 0,
      zIndex: 10,
    },

    input: {
      flex: 1,
      minHeight: 44,
      maxHeight: 120,
      color: "#FFFFFF",
      fontSize: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      outlineStyle:
        "none" as any,
    },

    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor:
        "#FFC400",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginLeft: 8,
      flexShrink: 0,
    },

    sendButtonDisabled: {
      opacity: 0.45,
    },

    sendButtonText: {
      color: "#000000",
      fontSize: 20,
      fontWeight:
        "800",
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
      fontSize: 14,
      marginTop: 12,
    },

    emptyMessages: {
      flex: 1,
      minHeight: 250,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    emptyMessagesIcon: {
      fontSize: 42,
    },

    emptyMessagesTitle: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight:
        "800",
      marginTop: 12,
    },

    emptyMessagesText: {
      color: "#888888",
      fontSize: 13,
      textAlign:
        "center",
      marginTop: 6,
    },

    errorBanner: {
      backgroundColor:
        "#351919",
      borderWidth: 1,
      borderColor:
        "#5C2424",
      borderRadius: 12,
      padding: 10,
      marginHorizontal: 8,
      marginTop: 10,
      flexShrink: 0,
    },

    errorBannerText: {
      color: "#FF8A8A",
      fontSize: 12,
      textAlign:
        "center",
    },

    errorScreen: {
      flex: 1,
      backgroundColor:
        "#090909",
    },

    errorContainer: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
    },

    errorIcon: {
      fontSize: 50,
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
      textAlign:
        "center",
      marginTop: 8,
    },

    backButton: {
      backgroundColor:
        "#FFC400",
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 14,
      marginTop: 22,
    },

    backButtonText: {
      color: "#000000",
      fontSize: 14,
      fontWeight:
        "800",
    },

    pressed: {
      opacity: 0.8,
    },
  });