import {
  useMemo,
  useState,
} from "react";

import {
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

import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { friends } from "@/data/friends";

import { useChatStore } from "@/store/chat-store";
import { useUserStore } from "@/store/user-store";

export default function DirectChatScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const friendId =
    Array.isArray(id)
      ? id[0]
      : id;

  const user = useUserStore(
    (state) => state.user,
  );

  const messages = useChatStore(
    (state) => state.messages,
  );

  const sendMessage = useChatStore(
    (state) => state.sendMessage,
  );

  const [
    text,
    setText,
  ] = useState("");

  const friend = useMemo(() => {
    if (!friendId) {
      return undefined;
    }

    return friends.find(
      (item) =>
        item.id === friendId,
    );
  }, [friendId]);

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

  const directMessages =
    useMemo(() => {
      if (!conversationId) {
        return [];
      }

      return messages
        .filter(
          (message) =>
            message.groupId ===
            conversationId,
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
    }, [
      conversationId,
      messages,
    ]);

  const handleBack = () => {
    router.replace(
      "/(main)/chat",
    );
  };

  const handleSend = () => {
    const trimmedText =
      text.trim();

    if (
      !trimmedText ||
      !user ||
      !friend ||
      !conversationId
    ) {
      return;
    }

    sendMessage({
      id: `direct-message-${Date.now()}`,
      groupId:
        conversationId,
      userId: user.id,
      userName: user.name,
      text: trimmedText,
      createdAt:
        new Date().toISOString(),
    });

    setText("");
  };

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
              Conversa não encontrada
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              Não foi possível carregar esta
              conversa.
            </Text>

            <Pressable
              onPress={handleBack}
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
    friend.status === "online";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={90}
    >
      <ScreenContainer
        maxWidth={820}
      >
        <View
          style={
            styles.chatContainer
          }
        >
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
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
                ←
              </Text>
            </Pressable>

            <View
              style={
                styles.avatarContainer
              }
            >
              <Image
                source={{
                  uri: friend.avatar,
                }}
                style={styles.avatar}
              />

              <View
                style={[
                  styles.statusDot,

                  isOnline
                    ? styles.onlineDot
                    : styles.offlineDot,
                ]}
              />
            </View>

            <View
              style={
                styles.headerInfo
              }
            >
              <Text
                style={
                  styles.friendName
                }
                numberOfLines={1}
              >
                {friend.name}
              </Text>

              <Text
                style={[
                  styles.friendStatus,

                  isOnline
                    ? styles.onlineText
                    : styles.offlineText,
                ]}
              >
                {isOnline
                  ? "Online"
                  : "Offline"}
              </Text>
            </View>
          </View>

          {directMessages.length ===
          0 ? (
            <View
              style={
                styles.emptyContainer
              }
            >
              <View
                style={
                  styles.emptyIconContainer
                }
              >
                <Text
                  style={
                    styles.emptyIcon
                  }
                >
                  💬
                </Text>
              </View>

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
                Envie uma mensagem para{" "}
                {friend.name}.
              </Text>
            </View>
          ) : (
            <FlatList
              data={
                directMessages
              }
              keyExtractor={(
                item,
              ) => item.id}
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.messagesContent
              }
              renderItem={({
                item,
              }) => {
                const isOwnMessage =
                  item.userId ===
                  user.id;

                return (
                  <View
                    style={[
                      styles.messageRow,

                      isOwnMessage
                        ? styles.ownMessageRow
                        : styles.otherMessageRow,
                    ]}
                  >
                    <View
                      style={[
                        styles.messageBubble,

                        isOwnMessage
                          ? styles.ownMessageBubble
                          : styles.otherMessageBubble,
                      ]}
                    >
                      {!isOwnMessage && (
                        <Text
                          style={
                            styles.messageUser
                          }
                        >
                          {item.userName}
                        </Text>
                      )}

                      <Text
                        style={[
                          styles.messageText,

                          isOwnMessage &&
                            styles.ownMessageText,
                        ]}
                      >
                        {item.text}
                      </Text>

                      <Text
                        style={[
                          styles.messageTime,

                          isOwnMessage &&
                            styles.ownMessageTime,
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
            />
          )}

          <View
            style={
              styles.inputArea
            }
          >
            <TextInput
              value={text}
              onChangeText={
                setText
              }
              placeholder={`Mensagem para ${friend.name}...`}
              placeholderTextColor="#777777"
              style={styles.input}
              multiline
              maxLength={1000}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (
                  Platform.OS ===
                  "web"
                ) {
                  handleSend();
                }
              }}
            />

            <Pressable
              disabled={
                !text.trim()
              }
              onPress={
                handleSend
              }
              style={({ pressed }) => [
                styles.sendButton,

                !text.trim() &&
                  styles.sendButtonDisabled,

                pressed &&
                  text.trim().length >
                    0 &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.sendButtonText
                }
              >
                Enviar
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </KeyboardAvoidingView>
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

function formatMessageTime(
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

  return date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  chatContainer: {
    flex: 1,
    width: "100%",
    minHeight: 0,
  },

  header: {
    height: 78,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
    paddingHorizontal: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1B1B1B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backButtonText: {
    color: "#FFC400",
    fontSize: 25,
    fontWeight: "700",
    lineHeight: 27,
  },

  avatarContainer: {
    width: 48,
    height: 48,
    position: "relative",
    marginRight: 12,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333333",
  },

  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#111111",
  },

  onlineDot: {
    backgroundColor: "#4CAF50",
  },

  offlineDot: {
    backgroundColor: "#777777",
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  friendName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  friendStatus: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },

  onlineText: {
    color: "#4CAF50",
  },

  offlineText: {
    color: "#888888",
  },

  messagesContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 12,
  },

  messageRow: {
    width: "100%",
    marginBottom: 10,
  },

  ownMessageRow: {
    alignItems: "flex-end",
  },

  otherMessageRow: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  ownMessageBubble: {
    backgroundColor: "#FFC400",
    borderBottomRightRadius: 5,
  },

  otherMessageBubble: {
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#292929",
    borderBottomLeftRadius: 5,
  },

  messageUser: {
    color: "#FFC400",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },

  messageText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
  },

  ownMessageText: {
    color: "#000000",
  },

  messageTime: {
    color: "#777777",
    fontSize: 9,
    textAlign: "right",
    marginTop: 5,
  },

  ownMessageTime: {
    color: "#5F5200",
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#111111",
    borderTopWidth: 1,
    borderTopColor: "#292929",
    gap: 10,
  },

  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 48,
    backgroundColor: "#1B1B1B",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#292929",
    color: "#FFFFFF",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  sendButton: {
    minHeight: 48,
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonDisabled: {
    opacity: 0.35,
  },

  sendButtonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    fontSize: 34,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 16,
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 7,
  },

  errorScreen: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
  },

  errorContainer: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 24,
    alignItems: "center",
  },

  errorIcon: {
    fontSize: 42,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14,
  },

  errorText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  errorButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginTop: 20,
  },

  errorButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});