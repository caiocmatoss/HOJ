import { useMemo } from "react";

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
  useLocalSearchParams,
} from "expo-router";

import { friends } from "@/data/friends";

import { EmptyState } from "@/components/ui/EmptyState";

import { useInviteStore } from "@/store/invite-store";
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

  const handleBackToGroups = () => {
    router.replace("/(main)/groups");
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

      return !alreadyInvited;
    });
  }, [
    invites,
    resolvedGroupId,
  ]);

  const handleInvite = (
    userId: string,
  ) => {
    if (
      !resolvedGroupId ||
      !user
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
      return;
    }

    sendInvite({
      id: `invite-${Date.now()}-${userId}`,
      groupId: resolvedGroupId,
      fromUserId: user.id,
      toUserId: userId,
      status: "pending",
    });
  };

  if (!resolvedGroupId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
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

          <Text style={styles.title}>
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
    <View style={styles.container}>
      <View style={styles.header}>
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

        <Text style={styles.title}>
          Convidar amigos
        </Text>

        <Text style={styles.subtitle}>
          Escolha quem você deseja
          convidar para o grupo.
        </Text>
      </View>

      <FlatList
        data={availableFriends}
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          availableFriends.length > 0
            ? styles.listContent
            : styles.emptyListContent
        }
        renderItem={({ item }) => {
          const isOnline =
            item.status === "online";

          return (
            <View style={styles.card}>
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
                  style={styles.name}
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
                onPress={() =>
                  handleInvite(item.id)
                }
                style={({ pressed }) => [
                  styles.inviteButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.inviteButtonText
                  }
                >
                  Convidar
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="✅"
            title="Todos convidados"
            message="Todos os amigos disponíveis já possuem convite pendente para este grupo."
            actionLabel="Voltar para grupos"
            onAction={
              handleBackToGroups
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },

  backButton: {
    alignSelf: "flex-start",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#292929",
  },

  avatarContainer: {
    width: 54,
    height: 54,
    position: "relative",
    marginRight: 13,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#333333",
  },

  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#1B1B1B",
  },

  onlineDot: {
    backgroundColor: "#4CAF50",
  },

  offlineDot: {
    backgroundColor: "#777777",
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
    backgroundColor: "#FFC400",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 10,
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