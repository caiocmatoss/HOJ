import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  getFriends,
  type ApiFriend,
} from "@/services/api";

import { EmptyState } from "@/components/ui/EmptyState";

import { useInviteStore } from "@/store/invite-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";

export default function GroupInviteScreen() {
  const { groupId } =
    useLocalSearchParams<{
      groupId?: string | string[];
    }>();

  const resolvedGroupId =
    Array.isArray(groupId)
      ? groupId[0]
      : groupId;

  const invites = useInviteStore(
    (state) => state.invites,
  );

  const sendInvite = useInviteStore(
    (state) => state.sendInvite,
  );

  const user = useUserStore(
    (state) => state.user,
  );

  const presenceStatuses = usePresenceStore(
    (state) => state.statuses,
  );

  const [friends, setFriends] = useState<ApiFriend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    setLoadingFriends(true);
    setFriendsError(null);

    try {
      const result = await getFriends();
      setFriends(result);
    } catch (error) {
      setFriendsError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar seus amigos.",
      );
    } finally {
      setLoadingFriends(false);
    }
  }, []);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  const [sendingUserId, setSendingUserId] =
    useState<string | null>(null);

  const [sentUserIds, setSentUserIds] =
    useState<string[]>([]);

  const handleBackToGroups = () => {
    router.replace(
      "/(main)/groups",
    );
  };

  const availableFriends = useMemo(() => {
    if (!resolvedGroupId) {
      return friends;
    }

    return friends.filter((friend) => {
      const alreadyInvited =
        invites.some(
          (invite) =>
            invite.groupId ===
              resolvedGroupId &&
            invite.toUserId ===
              friend.id &&
            invite.status ===
              "pending",
        );

      const alreadySent =
        sentUserIds.includes(
          friend.id,
        );

      const isCurrentUser =
        user?.id === friend.id;

      return (
        !alreadyInvited &&
        !alreadySent &&
        !isCurrentUser
      );
    });
  }, [
    friends,
    invites,
    presenceStatuses,
    resolvedGroupId,
    sentUserIds,
    user?.id,
  ]);

  const handleInvite = async (
    userId: string,
  ) => {
    if (
      !resolvedGroupId ||
      !user
    ) {
      return;
    }

    if (
      sendingUserId !== null
    ) {
      return;
    }

    const existingInvite =
      invites.find(
        (invite) =>
          invite.groupId ===
            resolvedGroupId &&
          invite.toUserId ===
            userId &&
          invite.status ===
            "pending",
      );

    if (existingInvite) {
      Alert.alert(
        "Convite pendente",
        "Este amigo já possui um convite pendente para este grupo.",
      );

      return;
    }

    setSendingUserId(userId);

    try {
      await sendInvite({
        id: `invite-${Date.now()}-${userId}`,
        groupId:
          resolvedGroupId,
        fromUserId:
          user.id,
        toUserId:
          userId,
        status: "pending",
      });

      setSentUserIds(
        (current) =>
          current.includes(userId)
            ? current
            : [
                ...current,
                userId,
              ],
      );

      Alert.alert(
        "Convite enviado",
        "O convite foi enviado com sucesso.",
      );
    } catch (error) {
      const message =
        error instanceof
        Error
          ? error.message
          : "Não foi possível enviar o convite.";

      Alert.alert(
        "Não foi possível enviar",
        message,
      );
    } finally {
      setSendingUserId(null);
    }
  };

  if (!resolvedGroupId) {
    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.header
          }
        >
          <Pressable
            onPress={
              handleBackToGroups
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
              ← Voltar
            </Text>
          </Pressable>

          <Text
            style={
              styles.title
            }
          >
            Convidar amigos
          </Text>
        </View>

        <EmptyState
          icon="⚠️"
          title="Grupo não informado"
          message="Abra um grupo e tente novamente para enviar convites."
          actionLabel="Voltar para grupos"
          onAction={
            handleBackToGroups
          }
        />
      </View>
    );
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <View
        style={
          styles.header
        }
      >
        <Pressable
          onPress={
            handleBackToGroups
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
            ← Voltar
          </Text>
        </Pressable>

        <Text
          style={
            styles.title
          }
        >
          Convidar amigos
        </Text>

        <Text
          style={
            styles.subtitle
          }
        >
          Escolha quem você deseja
          convidar para o grupo.
        </Text>
      </View>

      <FlatList
        data={
          availableFriends
        }
        keyExtractor={(
          item,
        ) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          availableFriends.length >
          0
            ? styles.listContent
            : styles.emptyListContent
        }
        renderItem={({
          item,
        }) => {
          const isOnline =
            (presenceStatuses[item.id] ?? item.status) ===
            "ONLINE";

          const isSending =
            sendingUserId ===
            item.id;

          return (
            <View
              style={
                styles.card
              }
            >
              <View
                style={
                  styles.avatarContainer
                }
              >
                {item.avatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarPlaceholderText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}

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
                  styles.friendInfo
                }
              >
                <Text
                  style={
                    styles.name
                  }
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <Text
                  style={[
                    styles.status,
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

              <Pressable
                disabled={
                  sendingUserId !==
                  null
                }
                onPress={() =>
                  handleInvite(
                    item.id,
                  )
                }
                style={({ pressed }) => [
                  styles.inviteButton,

                  sendingUserId !==
                    null &&
                    styles.inviteButtonDisabled,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.inviteButtonText
                  }
                >
                  {isSending
                    ? "Enviando..."
                    : "Convidar"}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          loadingFriends ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFC400" />
              <Text style={styles.loadingText}>Carregando amigos...</Text>
            </View>
          ) : friendsError ? (
            <EmptyState
              icon="⚠️"
              title="Não foi possível carregar"
              message={friendsError}
              actionLabel="Tentar novamente"
              onAction={() => { void loadFriends(); }}
            />
          ) : (
            <EmptyState
              icon="✅"
              title="Todos convidados"
              message="Todos os amigos disponíveis já possuem convite pendente para este grupo."
              actionLabel="Voltar para grupos"
              onAction={handleBackToGroups}
            />
          )
        }      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#090909",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },

  backButton: {
    alignSelf:
      "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  title: {
    color: "#FFC400",
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },

  emptyListContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  card: {
    flexDirection:
      "row",
    alignItems:
      "center",
    backgroundColor:
      "#1B1B1B",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor:
      "#292929",
  },

  avatarContainer: {
    width: 54,
    height: 54,
    position:
      "relative",
    marginRight: 13,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor:
      "#333333",
  },

  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPlaceholderText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 120,
  },

  loadingText: {
    color: "#888888",
    marginTop: 10,
  },

    statusDot: {
    position:
      "absolute",
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
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

  friendInfo: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  status: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  onlineText: {
    color: "#4CAF50",
  },

  offlineText: {
    color: "#888888",
  },

  inviteButton: {
    backgroundColor:
      "#FFC400",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 10,
  },

  inviteButtonDisabled: {
    opacity: 0.55,
  },

  inviteButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});
