import { useMemo } from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { EmptyState } from "@/components/ui/EmptyState";

import { users } from "@/data/users";

import { useGroupStore } from "@/store/group-store";
import { useInviteStore } from "@/store/invite-store";
import { useUserStore } from "@/store/user-store";

export default function InvitesScreen() {
  const user = useUserStore(
    (state) => state.user,
  );

  const groups = useGroupStore(
    (state) => state.groups,
  );

  const allInvites = useInviteStore(
    (state) => state.invites,
  );

  const acceptInvite = useInviteStore(
    (state) => state.acceptInvite,
  );

  const rejectInvite = useInviteStore(
    (state) => state.rejectInvite,
  );

  const pendingInvites =
    useMemo(() => {
      if (!user) {
        return [];
      }

      return allInvites.filter(
        (invite) =>
          invite.status ===
            "pending" &&
          invite.toUserId ===
            user.id,
      );
    }, [
      allInvites,
      user,
    ]);

  const getSender = (
    userId: string,
  ) =>
    users.find(
      (item) =>
        item.id === userId,
    );

  const getGroup = (
    groupId: string,
  ) =>
    groups.find(
      (group) =>
        group.id === groupId,
    );

  const handleBackToGroups = () => {
    router.replace(
      "/(main)/groups",
    );
  };

  const handleAccept = (
    inviteId: string,
  ) => {
    acceptInvite(inviteId);
  };

  const handleReject = (
    inviteId: string,
  ) => {
    rejectInvite(inviteId);
  };

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
          Convites
        </Text>

        <Text style={styles.subtitle}>
          {pendingInvites.length ===
          0
            ? "Nenhum convite pendente"
            : `${pendingInvites.length} ${
                pendingInvites.length ===
                1
                  ? "convite pendente"
                  : "convites pendentes"
              }`}
        </Text>
      </View>

      <FlatList
        data={pendingInvites}
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          pendingInvites.length > 0
            ? styles.listContent
            : styles.emptyListContent
        }
        renderItem={({ item }) => {
          const sender =
            getSender(
              item.fromUserId,
            );

          const group =
            getGroup(
              item.groupId,
            );

          return (
            <View style={styles.card}>
              <View
                style={
                  styles.iconContainer
                }
              >
                <Text style={styles.icon}>
                  👥
                </Text>
              </View>

              <View
                style={
                  styles.cardContent
                }
              >
                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  {sender?.name ??
                    "Alguém"}
                </Text>

                <Text
                  style={
                    styles.message
                  }
                >
                  convidou você para o
                  grupo
                </Text>

                <Text
                  style={
                    styles.groupName
                  }
                >
                  {group?.name ??
                    "Grupo"}
                </Text>

                {group ? (
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
                ) : (
                  <Text
                    style={
                      styles.groupUnavailable
                    }
                  >
                    Este grupo não está
                    mais disponível.
                  </Text>
                )}

                <View
                  style={
                    styles.actionRow
                  }
                >
                  <Pressable
                    disabled={!group}
                    onPress={() =>
                      handleAccept(
                        item.id,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.acceptButton,

                      !group &&
                        styles.disabledButton,

                      pressed &&
                        Boolean(group) &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={
                        styles.acceptText
                      }
                    >
                      Aceitar
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      handleReject(
                        item.id,
                      )
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.rejectButton,

                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={
                        styles.rejectText
                      }
                    >
                      Recusar
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="✉️"
            title="Nenhum convite"
            message="Quando alguém convidar você para um grupo, o convite aparecerá aqui."
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
    paddingBottom: 12,
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
    marginTop: 5,
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
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#292929",
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  icon: {
    fontSize: 25,
  },

  cardContent: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  message: {
    color: "#999999",
    fontSize: 13,
    marginTop: 3,
  },

  groupName: {
    color: "#FFC400",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },

  groupMeta: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 5,
  },

  groupUnavailable: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 5,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  acceptButton: {
    flex: 1,
    backgroundColor: "#FFC400",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  acceptText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  rejectButton: {
    flex: 1,
    backgroundColor: "#151515",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },

  rejectText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.4,
  },

  pressed: {
    opacity: 0.8,
  },
});