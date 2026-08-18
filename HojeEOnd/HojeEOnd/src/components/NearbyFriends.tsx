import { useMemo } from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { friends } from "@/data/friends";
import { locations } from "@/data/locations";

import { useLocationStore } from "@/store/location-store";

import {
  calculateDistance,
  formatDistance,
} from "@/utils/distance";

interface NearbyFriendsProps {
  limit?: number;
}

export default function NearbyFriends({
  limit = 5,
}: NearbyFriendsProps) {
  const latitude = useLocationStore(
    (state) => state.latitude,
  );

  const longitude = useLocationStore(
    (state) => state.longitude,
  );

  const hasUserLocation =
    latitude !== null &&
    longitude !== null;

  const nearbyFriends = useMemo(() => {
    const result = friends.map((friend) => {
      const friendLocation =
        locations.find(
          (location) =>
            location.userId === friend.id,
        );

      if (
        !hasUserLocation ||
        !friendLocation
      ) {
        return {
          ...friend,
          distanceMeters: null,
          displayDistance:
            "Distância indisponível",
        };
      }

      const distanceMeters =
        calculateDistance(
          latitude,
          longitude,
          friendLocation.latitude,
          friendLocation.longitude,
        );

      return {
        ...friend,
        distanceMeters,
        displayDistance:
          formatDistance(
            distanceMeters,
          ),
      };
    });

    return result
      .sort((a, b) => {
        if (
          a.distanceMeters === null &&
          b.distanceMeters === null
        ) {
          return 0;
        }

        if (
          a.distanceMeters === null
        ) {
          return 1;
        }

        if (
          b.distanceMeters === null
        ) {
          return -1;
        }

        return (
          a.distanceMeters -
          b.distanceMeters
        );
      })
      .slice(0, limit);
  }, [
    hasUserLocation,
    latitude,
    longitude,
    limit,
  ]);

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
        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            Amigos próximos
          </Text>

          <Text style={styles.subtitle}>
            {hasUserLocation
              ? "Ordenados pela distância"
              : "Aguardando sua localização"}
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
                style={styles.friendInfo}
              >
                <Text
                  style={styles.name}
                  numberOfLines={1}
                >
                  {friend.name}
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
                    ? "Online agora"
                    : "Offline"}
                </Text>

                <View
                  style={styles.distanceRow}
                >
                  <Text
                    style={
                      styles.locationIcon
                    }
                  >
                    📍
                  </Text>

                  <Text
                    style={
                      styles.distanceText
                    }
                  >
                    {friend.displayDistance}
                  </Text>
                </View>
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
    marginTop: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 14,
  },

  headerInfo: {
    flex: 1,
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
    transform: [
      {
        scale: 0.985,
      },
    ],
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

  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  locationIcon: {
    fontSize: 11,
    marginRight: 4,
  },

  distanceText: {
    color: "#FFC400",
    fontSize: 12,
    fontWeight: "700",
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