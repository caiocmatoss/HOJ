import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { friends } from "@/data/friends";

interface NearbyFriendsProps {
  limit?: number;
}

export default function NearbyFriends({
  limit = 5,
}: NearbyFriendsProps) {
  const nearbyFriends = friends.slice(
    0,
    limit,
  );

  if (nearbyFriends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>
          👥
        </Text>

        <Text style={styles.emptyTitle}>
          Nenhum amigo próximo
        </Text>

        <Text style={styles.emptyText}>
          Quando seus amigos estiverem disponíveis,
          eles aparecerão aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>
            Amigos próximos
          </Text>

          <Text style={styles.subtitle}>
            Veja quem está online
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push("/(main)/friends")
          }
          style={({ pressed }) => [
            styles.seeAllButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.seeAllText}>
            Ver todos
          </Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {nearbyFriends.map((friend) => {
          const isOnline =
            friend.status === "online";

          return (
            <Pressable
              key={friend.id}
              onPress={() =>
                router.push({
                  pathname:
                    "/(main)/friend/[id]",
                  params: {
                    id: friend.id,
                  },
                })
              }
              style={({ pressed }) => [
                styles.friendCard,
                pressed &&
                  styles.friendCardPressed,
              ]}
            >
              <View
                style={styles.avatarContainer}
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
                style={styles.friendInfo}
              >
                <Text
                  style={styles.name}
                  numberOfLines={1}
                >
                  {friend.name}
                </Text>

                <View
                  style={styles.statusRow}
                >
                  <Text
                    style={[
                      styles.status,
                      isOnline
                        ? styles.onlineText
                        : styles.offlineText,
                    ]}
                  >
                    {isOnline
                      ? "Online agora"
                      : "Offline"}
                  </Text>
                </View>

                <Text
                  style={styles.locationText}
                  numberOfLines={1}
                >
                  📍 Próximo de você
                </Text>
              </View>

              <Text style={styles.arrow}>
                ›
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
  },

  subtitle: {
    color: "#888888",
    fontSize: 13,
    marginTop: 4,
  },

  seeAllButton: {
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  seeAllText: {
    color: "#FFC400",
    fontSize: 12,
    fontWeight: "800",
  },

  list: {
    gap: 10,
  },

  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#292929",
  },

  friendCardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  avatarContainer: {
    width: 56,
    height: 56,
    marginRight: 13,
    position: "relative",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#333333",
  },

  statusDot: {
    position: "absolute",
    right: 0,
    bottom: 0,
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

  friendInfo: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  statusRow: {
    marginTop: 4,
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

  locationText: {
    color: "#666666",
    fontSize: 12,
    marginTop: 4,
  },

  arrow: {
    color: "#FFC400",
    fontSize: 28,
    marginLeft: 10,
  },

  emptyContainer: {
    backgroundColor: "#151515",
    borderRadius: 18,
    padding: 22,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#292929",
  },

  emptyIcon: {
    fontSize: 38,
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  emptyText: {
    color: "#888888",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
  },

  pressed: {
    opacity: 0.8,
  },
});