import {
  useMemo,
  useState,
} from "react";

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

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { friends } from "@/data/friends";

export default function FriendsScreen() {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const filteredFriends =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return friends;
      }

      return friends.filter(
        (friend) =>
          friend.name
            .toLowerCase()
            .includes(query),
      );
    }, [searchQuery]);

  const onlineFriends =
    useMemo(
      () =>
        filteredFriends.filter(
          (friend) =>
            friend.status ===
            "online",
        ),
      [filteredFriends],
    );

  const offlineFriends =
    useMemo(
      () =>
        filteredFriends.filter(
          (friend) =>
            friend.status ===
            "offline",
        ),
      [filteredFriends],
    );

  const orderedFriends = [
    ...onlineFriends,
    ...offlineFriends,
  ];

  const hasSearch =
    searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={orderedFriends}
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          orderedFriends.length > 0
            ? styles.listContent
            : styles.emptyListContent
        }
        ListHeaderComponent={
          <ScreenContainer>
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

              <TextInput
                value={searchQuery}
                onChangeText={
                  setSearchQuery
                }
                placeholder="Buscar amigos..."
                placeholderTextColor="#777777"
                style={
                  styles.searchInput
                }
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {orderedFriends.length >
                0 && (
                <View
                  style={
                    styles.listHeader
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    {onlineFriends.length >
                    0
                      ? "Online agora"
                      : "Amigos"}
                  </Text>

                  {onlineFriends.length >
                    0 && (
                    <Text
                      style={
                        styles.sectionMeta
                      }
                    >
                      {
                        onlineFriends.length
                      }{" "}
                      {onlineFriends.length ===
                      1
                        ? "amigo online"
                        : "amigos online"}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </ScreenContainer>
        }
        renderItem={({ item }) => (
          <ScreenContainer>
            <Pressable
              style={({ pressed }) => [
                styles.card,

                pressed &&
                  styles.cardPressed,
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

                <Text
                  style={
                    styles.friendHint
                  }
                  numberOfLines={1}
                >
                  Toque para ver o perfil
                </Text>
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
                icon="👥"
                title="Nenhum amigo encontrado"
                message={
                  hasSearch
                    ? "Tente buscar por outro nome."
                    : "Quando você adicionar amigos, eles aparecerão aqui."
                }
                actionLabel={
                  hasSearch
                    ? "Limpar busca"
                    : undefined
                }
                onAction={
                  hasSearch
                    ? () =>
                        setSearchQuery(
                          "",
                        )
                    : undefined
                }
              />
            </View>
          </ScreenContainer>
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
    width: "100%",
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

  listHeader: {
    paddingTop: 12,
    paddingBottom: 4,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  sectionMeta: {
    color: "#666666",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },

  card: {
    width: "100%",
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
    transform: [
      {
        scale: 0.985,
      },
    ],
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
    minWidth: 0,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  status: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
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

  emptyWrapper: {
    width: "100%",
    paddingTop: 40,
  },
});