import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  EmptyState,
} from "@/components/ui/EmptyState";

import {
  ScreenContainer,
} from "@/components/ui/ScreenContainer";

import {
  getDirectMessages,
  getFriends,
  type ApiDirectMessage,
  type ApiFriend,
} from "@/services/api";

import {
  useChatStore,
} from "@/store/chat-store";

import {
  useGroupStore,
} from "@/store/group-store";

import {
  useUserStore,
} from "@/store/user-store";

import {
  usePresenceStore,
} from "@/store/presence-store";



import {
  onNewDirectMessage,
  type DirectServerMessage,
} from "@/services/socket";

import type {
  ChatMessage,
  DirectChatMessage,
} from "@/store/chat-store";


function getTimestamp(
  value?: string,
) {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}

function createDirectConversationId(
  userId: string,
  friendId: string,
) {
  const ids = [
    userId,
    friendId,
  ].sort();

  return `direct-${ids[0]}-${ids[1]}`;
}

function formatConversationTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const sameDay =
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
    },
  );
}

function mapDirectMessageToChatMessage(
  message: ApiDirectMessage | DirectServerMessage,
): DirectChatMessage {
  return {
    ...message,
  };
}
export default function ChatScreen() {
  const user =
    useUserStore(
      (state) =>
        state.user,
    );

  const messages =
    useChatStore(
      (state) =>
        state.messages,
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

  const groups =
    useGroupStore(
      (state) =>
        state.groups,
    );
  const presenceStatuses =
    usePresenceStore(
      (state) =>
        state.statuses,
    );

  const [
    friends,
    setFriends,
  ] = useState<ApiFriend[]>([]);

  const [
    loadingDirectConversations,
    setLoadingDirectConversations,
  ] = useState(false);

  const [
    directConversationError,
    setDirectConversationError,
  ] = useState<string | null>(
    null,
  );

  /*
   * Carrega as mensagens privadas
   * existentes no backend.
   *
   * Cada amigo possui uma conversa
   * própria identificada pelo ID
   * determinístico:
   *
   * direct-userA-userB
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const loadDirectConversations =
      async () => {
        setLoadingDirectConversations(
          true,
        );

        setDirectConversationError(
          null,
        );

        try {
          const realFriends =
            await getFriends();

          if (cancelled) {
            return;
          }

          setFriends(realFriends);

          const results =
            await Promise.all(
              realFriends.map(
                async (friend) => {
                  try {
                    const history =
                      await getDirectMessages(
                        friend.id,
                      );

                    return {
                      friendId:
                        friend.id,
                      history,
                    };
                  } catch (error) {
                    console.error(
                      "[Chat] erro ao carregar conversa:",
                      {
                        friendId:
                          friend.id,
                        error,
                      },
                    );

                    return null;
                  }
                },
              ),
            );

          if (cancelled) {
            return;
          }

          let failedConversations =
            0;

          for (const result of results) {
            if (!result) {
              failedConversations += 1;
              continue;
            }

            const conversationId =
              createDirectConversationId(
                user.id,
                result.friendId,
              );

            const mappedMessages =
              result.history.map(
                (message) =>
                  mapDirectMessageToChatMessage(
                    message,
                  ),
              );

            if (
              mappedMessages.length >
              0
            ) {
              setDirectMessages(
                conversationId,
                mappedMessages,
              );
            }
          }

          if (
            failedConversations >
            0
          ) {
            setDirectConversationError(
              "Não foi possível carregar uma ou mais conversas.",
            );
          }
        } catch (error) {
          if (cancelled) {
            return;
          }

          console.error(
            "[Chat] erro ao carregar conversas privadas:",
            error,
          );

          setDirectConversationError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as conversas.",
          );
        } finally {
          if (!cancelled) {
            setLoadingDirectConversations(
              false,
            );
          }
        }
      };

    void loadDirectConversations();

    return () => {
      cancelled = true;
    };
  }, [
    setDirectMessages,
    user,
  ]);
  /*
   * Recebe novas mensagens privadas
   * enquanto a tela Conversas está aberta.
   *
   * Isso permite atualizar a última
   * mensagem imediatamente.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe =
      onNewDirectMessage(
        (
          message: DirectServerMessage,
        ) => {
          const belongsToUser =
            message.senderId ===
              user.id ||
            message.receiverId ===
              user.id;

          if (!belongsToUser) {
            return;
          }

          const otherUserId =
            message.senderId ===
            user.id
              ? message.receiverId
              : message.senderId;

          const conversationId =
            createDirectConversationId(
              user.id,
              otherUserId,
            );

          const chatMessage =
            mapDirectMessageToChatMessage(message);

          addDirectMessage(
            conversationId,
            chatMessage,
          );
        },
      );

    return unsubscribe;
  }, [
    addDirectMessage,
    user,
  ]);

  /*
   * O store possui:
   *
   * messages: Record<string, ChatMessage[]>
   *
   * Portanto transformamos o objeto
   * em um array somente para montar
   * a lista de conversas.
   */
  const allGroupMessages =
    useMemo<ChatMessage[]>(() => {
      return Object.values(
        messages,
      ).flat();
    }, [messages]);

  const allDirectMessages =
    useMemo<DirectChatMessage[]>(() => {
      return Object.values(
        directMessages,
      ).flat();
    }, [directMessages]);
  /*
   * Conversas diretas.
   */
  const directConversations =
    useMemo(() => {
      if (!user) {
        return [];
      }

      const conversations =
        friends
          .map((friend) => {
            const conversationId =
              createDirectConversationId(
                user.id,
                friend.id,
              );

            const conversationMessages =
              allDirectMessages
                .filter(
                  (message) =>
                    (message.senderId === user.id && message.receiverId === friend.id) ||
                    (message.senderId === friend.id && message.receiverId === user.id),
                )
                .sort(
                  (a, b) =>
                    getTimestamp(
                      a.createdAt,
                    ) -
                    getTimestamp(
                      b.createdAt,
                    ),
                );

            const lastMessage =
              conversationMessages[
                conversationMessages.length - 1
              ];

            /*
             * Só mostramos uma conversa
             * direta se já existir mensagem.
             */
            if (!lastMessage) {
              return null;
            }

            const friendStatus = presenceStatuses[friend.id] ?? friend.status;

            return {
              type: "direct" as const,

              id: friend.id,

              conversationId,

              name: friend.name,

              avatar:
                friend.avatar,

              status:
                friendStatus === "ONLINE"
                  ? "online"
                  : "offline",

              lastMessage:
                lastMessage.text,

              lastMessageAt:
                lastMessage.createdAt,

              meta:
                friendStatus === "ONLINE"
                  ? "Online"
                  : "Offline",
            };
          })
          .filter(
            (
              item,
            ): item is NonNullable<
              typeof item
            > =>
              item !== null,
          );

      return conversations.sort(
        (a, b) =>
          getTimestamp(
            b.lastMessageAt,
          ) -
          getTimestamp(
            a.lastMessageAt,
          ),
      );
    }, [
      allDirectMessages,
      presenceStatuses,
      user,
    ]);

  /*
   * Conversas de grupo.
   */
  const groupConversations =
    useMemo(() => {
      return groups
        .map((group) => {
          const conversationMessages =
            allGroupMessages
              .filter(
                (message) =>
                  message.groupId ===
                  group.id,
              )
              .sort(
                (a, b) =>
                  getTimestamp(
                    a.createdAt,
                  ) -
                  getTimestamp(
                    b.createdAt,
                  ),
              );

          const lastMessage =
            conversationMessages[
              conversationMessages.length - 1
            ];

          if (!lastMessage) {
            return null;
          }

          return {
            type: "group" as const,

            id: group.id,

            conversationId:
              group.id,

            name: group.name,

            lastMessage:
              lastMessage.text,

            lastMessageAt:
              lastMessage.createdAt,

            meta: `${group.members.length} ${
              group.members.length ===
              1
                ? "membro"
                : "membros"
            }`,
          };
        })
        .filter(
          (
            item,
          ): item is NonNullable<
            typeof item
          > =>
            item !== null,
        );
    }, [
      allGroupMessages,
      groups,
    ]);

  const conversations =
    useMemo(() => {
      const combined = [
        ...directConversations,
        ...groupConversations,
      ];

      return combined.sort(
        (a, b) =>
          getTimestamp(
            b.lastMessageAt,
          ) -
          getTimestamp(
            a.lastMessageAt,
          ),
      );
    }, [
      directConversations,
      groupConversations,
    ]);

  const openDirectChat = (
    friendId: string,
  ) => {
    router.push({
      pathname:
        "/(main)/chat/[id]",

      params: {
        id: friendId,
      },
    });
  };

  const openGroupChat = (
    groupId: string,
  ) => {
    router.push({
      pathname:
        "/(main)/group/chat/[id]",

      params: {
        id: groupId,
      },
    });
  };

  return (
    <View
      style={
        styles.container
      }
    >
      <FlatList
        data={
          conversations
        }

        keyExtractor={(
          item,
        ) =>
          `${item.type}-${item.id}`
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          conversations.length >
          0
            ? styles.listContent
            : styles.emptyListContent
        }

        ListHeaderComponent={
          <ScreenContainer>
            <View
              style={
                styles.header
              }
            >
              <Text
                style={
                  styles.title
                }
              >
                Conversas
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                {loadingDirectConversations
                  ? "Carregando conversas..."
                  : conversations.length ===
                    0
                  ? "Nenhuma conversa ainda"
                  : `${conversations.length} ${
                      conversations.length ===
                      1
                        ? "conversa"
                        : "conversas"
                    }`}
              </Text>

              {directConversationError ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {directConversationError}
                </Text>
              ) : null}
            </View>
          </ScreenContainer>
        }

        renderItem={({
          item,
        }) => {
          if (
            item.type ===
            "direct"
          ) {
            return (
              <ScreenContainer>
                <Pressable
                  onPress={() =>
                    openDirectChat(
                      item.id,
                    )
                  }

                  style={({
                    pressed,
                  }) => [
                    styles.card,

                    pressed &&
                      styles.cardPressed,
                  ]}
                >
                  <View
                    style={
                      styles.avatarContainer
                    }
                  >
                    {item.avatar ? (
                      <Image
                        source={{
                          uri:
                            item.avatar,
                        }}

                        style={
                          styles.avatar
                        }
                      />
                    ) : (
                      <View
                        style={
                          styles.avatarPlaceholder
                        }
                      >
                        <Text
                          style={
                            styles.avatarPlaceholderText
                          }
                        >
                          {item.name
                            .charAt(
                              0,
                            )
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.statusDot,

                        item.status ===
                        "online"
                          ? styles.onlineDot
                          : styles.offlineDot,
                      ]}
                    />
                  </View>

                  <View
                    style={
                      styles.content
                    }
                  >
                    <View
                      style={
                        styles.topRow
                      }
                    >
                      <Text
                        style={
                          styles.name
                        }

                        numberOfLines={
                          1
                        }
                      >
                        {
                          item.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.time
                        }
                      >
                        {formatConversationTime(
                          item.lastMessageAt,
                        )}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.lastMessage
                      }

                      numberOfLines={
                        1
                      }
                    >
                      {
                        item.lastMessage
                      }
                    </Text>

                    <Text
                      style={[
                        styles.meta,

                        item.status ===
                        "online"
                          ? styles.onlineText
                          : undefined,
                      ]}
                    >
                      {
                        item.meta
                      }
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.arrow
                    }
                  >
                    ›
                  </Text>
                </Pressable>
              </ScreenContainer>
            );
          }

          return (
            <ScreenContainer>
              <Pressable
                onPress={() =>
                  openGroupChat(
                    item.id,
                  )
                }

                style={({
                  pressed,
                }) => [
                  styles.card,

                  pressed &&
                    styles.cardPressed,
                ]}
              >
                <View
                  style={
                    styles.groupAvatar
                  }
                >
                  <Text
                    style={
                      styles.groupAvatarText
                    }
                  >
                    👥
                  </Text>
                </View>

                <View
                  style={
                    styles.content
                  }
                >
                  <View
                    style={
                      styles.topRow
                    }
                  >
                    <Text
                      style={
                        styles.name
                      }

                      numberOfLines={
                        1
                      }
                    >
                      {
                        item.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.time
                      }
                    >
                      {formatConversationTime(
                        item.lastMessageAt,
                      )}
                    </Text>
                  </View>

                  <Text
                    style={
                      styles.lastMessage
                    }

                    numberOfLines={
                      1
                    }
                  >
                    {
                      item.lastMessage
                    }
                  </Text>

                  <Text
                    style={
                      styles.meta
                    }
                  >
                    {
                      item.meta
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.arrow
                  }
                >
                  ›
                </Text>
              </Pressable>
            </ScreenContainer>
          );
        }}

        ListEmptyComponent={
          <ScreenContainer>
            <View
              style={
                styles.emptyWrapper
              }
            >
              <EmptyState
                icon="💬"

                title={
                  loadingDirectConversations
                    ? "Carregando conversas..."
                    : "Nenhuma conversa"
                }

                message={
                  loadingDirectConversations
                    ? "Buscando suas conversas salvas."
                    : "Envie uma mensagem para um amigo ou converse em um grupo para que a conversa apareça aqui."
                }

                actionLabel={
                  loadingDirectConversations
                    ? undefined
                    : "Ver amigos"
                }

                onAction={
                  loadingDirectConversations
                    ? undefined
                    : () =>
                        router.push(
                          "/(main)/friends",
                        )
                }
              />
            </View>
          </ScreenContainer>
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#090909",
    },

    listContent: {
      paddingTop: 24,
      paddingBottom: 120,
    },

    emptyListContent: {
      flexGrow: 1,
      paddingTop: 24,
      paddingBottom: 120,
    },

    header: {
      width: "100%",
      paddingBottom: 14,
    },

    title: {
      color: "#FFC400",
      fontSize: 30,
      fontWeight: "800",
    },

    subtitle: {
      color: "#888888",
      fontSize: 14,
      marginTop: 5,
    },

    errorText: {
      color: "#FF7777",
      fontSize: 12,
      marginTop: 8,
    },

    card: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#1B1B1B",
      borderRadius: 18,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor:
        "#292929",
    },

    cardPressed: {
      opacity: 0.82,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    avatarContainer: {
      width: 58,
      height: 58,
      position: "relative",
      marginRight: 14,
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        "#333333",
    },

    avatarPlaceholder: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        "#2A2300",
      alignItems: "center",
      justifyContent:
        "center",
    },

    avatarPlaceholderText: {
      color: "#FFC400",
      fontSize: 22,
      fontWeight: "800",
    },

    statusDot: {
      position: "absolute",
      right: 1,
      bottom: 1,
      width: 15,
      height: 15,
      borderRadius: 8,
      borderWidth: 2,
      borderColor:
        "#1B1B1B",
    },

    onlineDot: {
      backgroundColor:
        "#4CAF50",
    },

    offlineDot: {
      backgroundColor:
        "#777777",
    },

    groupAvatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        "#2A2300",
      alignItems: "center",
      justifyContent:
        "center",
      marginRight: 14,
    },

    groupAvatarText: {
      fontSize: 27,
    },

    content: {
      flex: 1,
      minWidth: 0,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: 10,
    },

    name: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
    },

    time: {
      color: "#777777",
      fontSize: 11,
    },

    lastMessage: {
      color: "#AAAAAA",
      fontSize: 13,
      marginTop: 5,
    },

    meta: {
      color: "#777777",
      fontSize: 11,
      marginTop: 6,
    },

    onlineText: {
      color: "#4CAF50",
    },

    arrow: {
      color: "#FFC400",
      fontSize: 30,
      marginLeft: 10,
    },

    emptyWrapper: {
      width: "100%",
      paddingTop: 40,
    },
  });