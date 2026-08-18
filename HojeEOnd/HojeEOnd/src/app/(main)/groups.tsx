import { useMemo } from "react";

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  useGroupStore,
} from "@/store/group-store";

import {
  venues,
} from "@/data/venues";

export default function GroupsScreen() {
  const groups = useGroupStore(
    (state) => state.groups,
  );

  const groupsWithVenue = useMemo(
    () =>
      groups.map((group) => {
        const venue = venues.find(
          (item) =>
            item.id === group.venueId,
        );

        return {
          ...group,
          venueName:
            venue?.name ??
            "Local não informado",
        };
      }),
    [groups],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Grupos
        </Text>

        <Text style={styles.subtitle}>
          {groups.length === 1
            ? "1 grupo"
            : `${groups.length} grupos`}
        </Text>
      </View>

      {groupsWithVenue.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            👥
          </Text>

          <Text style={styles.emptyTitle}>
            Nenhum grupo
          </Text>

          <Text style={styles.emptyText}>
            Crie um grupo para organizar
            sua próxima saída.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.pressed,
            ]}
            onPress={() =>
              router.push(
                "/(main)/group/create",
              )
            }
          >
            <Text
              style={styles.createButtonText}
            >
              Criar grupo
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={groupsWithVenue}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    "/(main)/group/[id]",
                  params: {
                    id: item.id,
                  },
                })
              }
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                  👥
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text
                  style={styles.groupName}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <Text
                  style={styles.venueName}
                  numberOfLines={1}
                >
                  📍 {item.venueName}
                </Text>

                <Text style={styles.members}>
                  {item.members.length}{" "}
                  {item.members.length === 1
                    ? "membro"
                    : "membros"}
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </Pressable>
          )}
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
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#292929",
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  icon: {
    fontSize: 26,
  },

  cardContent: {
    flex: 1,
    minWidth: 0,
  },

  groupName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  venueName: {
    color: "#FFC400",
    fontSize: 13,
    marginTop: 5,
  },

  members: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
  },

  arrow: {
    color: "#FFC400",
    fontSize: 30,
    marginLeft: 10,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    fontSize: 46,
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
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
  },

  createButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
    marginTop: 20,
  },

  createButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});