import { useMemo } from "react";

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { friends } from "@/data/friends";

import { useChatStore } from "@/store/chat-store";
import { useGroupStore } from "@/store/group-store";
import { useUserStore } from "@/store/user-store";

type DirectConversation = {
  type: "direct";
  id: string;
  title: string;
  avatar: string;
  status: "online" | "offline";
  lastMessage: string;
  lastMessageUser: string;
  lastMessageAt: string;
};

type GroupConversation = {
  type: "group";
  id: string;
  title: string;
  membersCount: number;
  lastMessage: string;
  lastMessageUser: string;
  lastMessageAt: string;
};

type ConversationItem =
  | DirectConversation
  | GroupConversation;

export default function ChatScreen() {
  const messages = useChatStore(
    (state) => state.messages,
  );

  const groups = useGroupStore(
    (state) => state.groups,
  );

  const user = useUserStore(
    (state) => state.user,
  );

  const conversations = useMemo<
    ConversationItem[]
  >(() => {
    if (!user) {
      return [];
    }

    const directConversations = friends
      .map((friend) => {
        const conversationId =
          createDirectConversationId(
            user.id,
            friend.id,
          );

        const directMessages = messages
          .filter(
            (message) =>
              message.groupId ===
              conversationId,
          )
          .sort(
            (a, b) =>
              getTimestamp(
                b.createdAt,
              ) -
              getTimestamp(
                a.createdAt,
              ),
          );

        const lastMessage =
          directMessages[0];

        if (!lastMessage) {
          return null;
        }

        const conversation: DirectConversation = {
          type: "direct",
          id: friend.id,
          title: friend.name,
          avatar: friend.avatar,
          status: friend.status,
          lastMessage:
            lastMessage.text,
          lastMessageUser:
            lastMessage.userId ===
            user.id
              ? "Você"
              : lastMessage.userName,
          lastMessageAt:
            lastMessage.createdAt,
        };

        return conversation;
      })
      .filter(
        (
          conversation,
        ): conversation is DirectConversation =>
          conversation !== null,
      );

    const groupConversations = groups
      .map((group) => {
        const groupMessages = messages
          .filter(
            (message) =>
              message.groupId ===
              group.id,
          )
          .sort(
            (a, b) =>
              getTimestamp(
                b.createdAt,
              ) -
              getTimestamp(
                a.createdAt,
              ),
          );

        const lastMessage =
          groupMessages[0];

        if (!lastMessage) {
          return null;
        }

        const conversation: GroupConversation = {
          type: "group",
          id: group.id,
          title: group.name,
          membersCount:
            group.members.length,
          lastMessage:
            lastMessage.text,
          lastMessageUser:
            lastMessage.userId ===
            user.id
              ? "Você"
              : lastMessage.userName,
          lastMessageAt:
            lastMessage.createdAt,
        };

        return conversation;
      })
      .filter(
        (
          conversation,
        ): conversation is GroupConversation =>
          conversation !== null,
      );

    return [
      ...directConversations,
      ...groupConversations,
    ].sort(
      (a, b) =>
        getTimestamp(
          b.lastMessageAt,
        ) -
        getTimestamp(
          a.lastMessageAt,
        ),
    );
  }, [
    messages,
    groups,
    user,
  ]);

  const openConversation = (
    item: ConversationItem,
  ) => {
    if (item.type === "direct") {
      router.push({
        pathname:
          "/(main)/chat/[id]",
        params: {
          id: item.id,
        },
      });

      return;
    }

    router.push({
      pathname:
        "/(main)/group/chat/[id]",
      params: {
        id: item.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) =>
          `${item.type}-${item.id}`
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          conversations.length > 0
            ? styles.listContent
            : styles.emptyListContent
        }
        ListHeaderComponent={
          <ScreenContainer>
            <View style={styles.header}>
              <Text style={styles.title}>
                Conversas
              </Text>

              <Text style={styles.subtitle}>
                {conversations.length === 0
                  ? "Nenhuma conversa"
                  : `${conversations.length} ${
                      conversations.length ===
                      1
                        ? "conversa"
                        : "conversas"
                    }`}
              </Text>
            </View>
          </ScreenContainer>
        }
        renderItem={({ item }) => (
          <ScreenContainer>
            <Pressable
              onPress={() =>
                openConversation(item)
              }
              style={({ pressed }) => [
                styles.card,
                pressed &&
                  styles.cardPressed,
              ]}
            >
              {item.type ===
              "direct" ? (
                <View
                  style={
                    styles.avatarContainer
                  }
                >
                  <Image
                    source={{
                      uri: item.avatar,
                    }}
                    style={styles.avatar}
                  />

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
              ) : (
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
              )}

              <View style={styles.content}>
                <View
                  style={
                    styles.topRow
                  }
                >
                  <Text
                    style={styles.name}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={styles.time}
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
                  numberOfLines={1}
                >
                  {item.lastMessageUser}:{" "}
                  {item.lastMessage}
                </Text>

                {item.type ===
                "direct" ? (
                  <Text
                    style={[
                      styles.meta,

                      item.status ===
                        "online" &&
                        styles.onlineText,
                    ]}
                  >
                    {item.status ===
                    "online"
                      ? "Online"
                      : "Offline"}
                  </Text>
                ) : (
                  <Text
                    style={styles.meta}
                  >
                    {item.membersCount}{" "}
                    {item.membersCount ===
                    1
                      ? "membro"
                      : "membros"}
                  </Text>
                )}
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </Pressable>
          </ScreenContainer>
        )}
        ListEmptyComponent={
          <ScreenContainer>
            <View
              style={
                styles.emptyWrapper
              }
            >
              <EmptyState
                icon="💬"
                title="Nenhuma conversa ainda"
                message="Envie uma mensagem para um amigo ou converse em um grupo para que a conversa apareça aqui."
                actionLabel="Ver amigos"
                onAction={() =>
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

function formatConversationTime(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const now = new Date();

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
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

  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#292929",
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
    backgroundColor: "#333333",
  },

  statusDot: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#1B1B1B",
  },

  onlineDot: {
    backgroundColor: "#4CAF50",
  },

  offlineDot: {
    backgroundColor: "#777777",
  },

  groupAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
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