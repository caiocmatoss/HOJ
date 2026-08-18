import { useMemo, useState } from "react";

import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { friends } from "@/data/friends";

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] =
    useState("");

  const filteredFriends = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return friends;
    }

    return friends.filter((friend) =>
      friend.name
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  const onlineFriends = useMemo(
    () =>
      filteredFriends.filter(
        (friend) =>
          friend.status === "online",
      ),
    [filteredFriends],
  );

  const offlineFriends = useMemo(
    () =>
      filteredFriends.filter(
        (friend) =>
          friend.status === "offline",
      ),
    [filteredFriends],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Amigos
        </Text>

        <Text style={styles.subtitle}>
          {friends.length}{" "}
          {friends.length === 1
            ? "amigo"
            : "amigos"}{" "}
          conectados à sua rede
        </Text>
      </View>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar amigos..."
        placeholderTextColor="#777777"
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {filteredFriends.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            👥
          </Text>

          <Text style={styles.emptyTitle}>
            Nenhum amigo encontrado
          </Text>

          <Text style={styles.emptyText}>
            Tente buscar por outro nome.
          </Text>

          {searchQuery.length > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                setSearchQuery("")
              }
            >
              <Text
                style={styles.clearButtonText}
              >
                Limpar busca
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={[
            ...onlineFriends,
            ...offlineFriends,
          ]}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.listContent
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname:
                    "/(main)/friend/[id]",
                  params: {
                    id: item.id,
                  },
                })
              }
            >
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

              <View
                style={styles.friendInfo}
              >
                <Text
                  style={styles.name}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>

                <View
                  style={styles.statusRow}
                >
                  <Text
                    style={[
                      styles.status,
                      item.status ===
                        "online"
                        ? styles.onlineText
                        : styles.offlineText,
                    ]}
                  >
                    {item.status ===
                    "online"
                      ? "Online"
                      : "Offline"}
                  </Text>
                </View>

                <Text
                  style={styles.friendHint}
                  numberOfLines={1}
                >
                  Toque para ver o perfil
                </Text>
              </View>

              <Text
                style={styles.arrow}
              >
                ›
              </Text>
            </Pressable>
          )}
          ListHeaderComponent={
            filteredFriends.length > 0 ? (
              <View style={styles.listHeader}>
                {onlineFriends.length >
                  0 && (
                  <Text
                    style={styles.sectionTitle}
                  >
                    Online agora
                  </Text>
                )}

                {onlineFriends.length ===
                  0 &&
                  offlineFriends.length >
                    0 && (
                    <Text
                      style={styles.sectionTitle}
                    >
                      Amigos
                    </Text>
                  )}
              </View>
            ) : null
          }
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
    paddingBottom: 8,
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

  searchInput: {
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 8,
    backgroundColor: "#1B1B1B",
    color: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#292929",
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },

  listHeader: {
    paddingTop: 10,
    paddingBottom: 4,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#292929",
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  avatarContainer: {
    position: "relative",
    width: 60,
    height: 60,
    marginRight: 14,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333333",
  },

  statusDot: {
    position: "absolute",
    right: 0,
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
    backgroundColor: "#666666",
  },

  friendInfo: {
    flex: 1,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  status: {
    fontSize: 13,
    fontWeight: "700",
  },

  onlineText: {
    color: "#4CAF50",
  },

  offlineText: {
    color: "#888888",
  },

  friendHint: {
    color: "#666666",
    fontSize: 12,
    marginTop: 5,
  },

  arrow: {
    color: "#FFC400",
    fontSize: 30,
    fontWeight: "300",
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
    marginBottom: 12,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  clearButton: {
    backgroundColor: "#FFC400",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 18,
  },

  clearButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});