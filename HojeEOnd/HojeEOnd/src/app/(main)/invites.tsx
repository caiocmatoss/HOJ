import { router } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { groups } from "@/data/groups";
import { users } from "@/data/users";
import { useInviteStore } from "@/store/invite-store";

export default function InvitesScreen() {
  const allInvites = useInviteStore(
    (state) => state.invites,
  );

  const acceptInvite = useInviteStore(
    (state) => state.acceptInvite,
  );

  const rejectInvite = useInviteStore(
    (state) => state.rejectInvite,
  );

  const pendingInvites = useMemo(
    () =>
      allInvites.filter(
        (invite) =>
          invite.status === "pending",
      ),
    [allInvites],
  );

  const getSender = (userId: string) =>
    users.find(
      (user) => user.id === userId,
    );

  const getGroup = (groupId: string) =>
    groups.find(
      (group) => group.id === groupId,
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Convites
        </Text>

        <Text style={styles.subtitle}>
          {pendingInvites.length === 0
            ? "Nenhum convite pendente"
            : `${pendingInvites.length} convite${
                pendingInvites.length === 1
                  ? ""
                  : "s"
              } pendente${
                pendingInvites.length === 1
                  ? ""
                  : "s"
              }`}
        </Text>
      </View>

      {pendingInvites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            ✉️
          </Text>

          <Text style={styles.emptyTitle}>
            Nenhum convite
          </Text>

          <Text style={styles.emptyText}>
            Quando alguém convidar você para
            um grupo, o convite aparecerá aqui.
          </Text>

          <Pressable
            onPress={() =>
              router.push(
                "/(main)/groups",
              )
            }
            style={({ pressed }) => [
              styles.emptyButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.emptyButtonText}>
              Ver grupos
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={pendingInvites}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
          renderItem={({ item }) => {
            const sender = getSender(
              item.fromUserId,
            );

            const group = getGroup(
              item.groupId,
            );

            return (
              <View style={styles.card}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>
                    👥
                  </Text>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {sender?.name ?? "Alguém"}
                  </Text>

                  <Text style={styles.message}>
                    convidou você para o grupo
                  </Text>

                  <Text style={styles.groupName}>
                    {group?.name ?? "Grupo"}
                  </Text>

                  <Text style={styles.groupMeta}>
                    Convite para participar deste
                    grupo.
                  </Text>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.acceptButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() =>
                        acceptInvite(item.id)
                      }
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
                      style={({ pressed }) => [
                        styles.rejectButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() =>
                        rejectInvite(item.id)
                      }
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
        />
      )}
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
    paddingTop: 24,
    paddingBottom: 12,
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
    fontSize: 13,
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

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  emptyButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginTop: 20,
  },

  emptyButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});