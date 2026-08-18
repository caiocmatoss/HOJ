import {
  useMemo,
  useState,
} from "react";

import {
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

import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { users } from "@/data/users";

import { useChatStore } from "@/store/chat-store";
import { useGroupStore } from "@/store/group-store";
import { useUserStore } from "@/store/user-store";

export default function GroupChatScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const groupId =
    Array.isArray(id)
      ? id[0]
      : id;

  const user = useUserStore(
    (state) => state.user,
  );

  const groups = useGroupStore(
    (state) => state.groups,
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
    useMemo(() => {
      if (!groupId) {
        return [];
      }

      return messages
        .filter(
          (message) =>
            message.groupId ===
            groupId,
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
      groupId,
      messages,
    ]);

  const handleBackToChats = () => {
    router.replace(
      "/(main)/chat",
    );
  };

  if (
    !groupId ||
    !group
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
              Não foi possível carregar esta conversa.
            </Text>

            <Pressable
              onPress={
                handleBackToChats
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
                Voltar para conversas
              </Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const handleSend = () => {
    const trimmedText =
      text.trim();

    if (
      !trimmedText ||
      !user
    ) {
      return;
    }

    sendMessage({
      id: `message-${Date.now()}`,
      groupId: group.id,
      userId: user.id,
      userName: user.name,
      text: trimmedText,
      createdAt:
        new Date().toISOString(),
    });

    setText("");
  };

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
              onPress={
                handleBackToChats
              }
              style={({ pressed }) => [
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
                ←
              </Text>
            </Pressable>

            <View
              style={
                styles.groupIconContainer
              }
            >
              <Text
                style={
                  styles.groupIcon
                }
              >
                👥
              </Text>
            </View>

            <View
              style={
                styles.headerInfo
              }
            >
              <Text
                style={
                  styles.groupName
                }
                numberOfLines={1}
              >
                {group.name}
              </Text>

              <Text
                style={
                  styles.groupMeta
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

          {groupMessages.length ===
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
                Envie a primeira mensagem
                para o grupo.
              </Text>
            </View>
          ) : (
            <FlatList
              data={
                groupMessages
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
                  user?.id;

                const member =
                  users.find(
                    (candidate) =>
                      candidate.id ===
                      item.userId,
                  );

                const displayName =
                  isOwnMessage
                    ? "Você"
                    : member?.name ??
                      item.userName;

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
                      <Text
                        style={[
                          styles.messageUser,

                          isOwnMessage &&
                            styles.ownMessageUser,
                        ]}
                      >
                        {displayName}
                      </Text>

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
              placeholder="Mensagem para o grupo..."
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

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1B1B1B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerBackText: {
    color: "#FFC400",
    fontSize: 25,
    fontWeight: "700",
    lineHeight: 27,
  },

  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  groupIcon: {
    fontSize: 22,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  groupName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  groupMeta: {
    color: "#888888",
    fontSize: 11,
    marginTop: 3,
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

  ownMessageUser: {
    color: "#5F5200",
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

  backButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginTop: 20,
  },

  backButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});