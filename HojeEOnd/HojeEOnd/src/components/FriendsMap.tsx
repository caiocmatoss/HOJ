import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { getNearbyFriends } from "@/services/api";

import { useLocationStore } from "@/store/location-store";
import { usePresenceStore } from "@/store/presence-store";

import {
  calculateDistance,
  formatDistance,
} from "@/utils/distance";

type NearbyFriend = Awaited<ReturnType<typeof getNearbyFriends>>["friends"][number];

type FriendMarker = {
  friend: NearbyFriend,
  distance: number;
  x: number;
  y: number;
  isOnline: boolean;
};

const MAP_SIZE = 280;

const MAP_PADDING = 42;

const MAX_RADIUS_METERS = 1200;

export function FriendsMap() {
  const [friends, setFriends] = useState<NearbyFriend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getNearbyFriends(10);
      setFriends(response.friends);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar os amigos próximos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);
  const latitude = useLocationStore(
    (state) => state.latitude,
  );

  const longitude = useLocationStore(
    (state) => state.longitude,
  );

  const friendLocations = usePresenceStore(
    (state) => state.friendLocations,
  );

  const presenceStatuses = usePresenceStore(
    (state) => state.statuses,
  );

  const hasUserLocation =
    latitude !== null &&
    longitude !== null;

  const friendsWithLocation =
    buildFriendMarkers(
      latitude,
      longitude,
      hasUserLocation,
      friendLocations,
      presenceStatuses,
      friends,
    );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            Amigos no mapa
          </Text>

          <Text style={styles.subtitle}>
            {hasUserLocation
              ? `${friendsWithLocation.length} amigo${
                  friendsWithLocation.length ===
                  1
                    ? ""
                    : "s"
                } localizado${
                  friendsWithLocation.length ===
                  1
                    ? ""
                    : "s"
                }`
              : "Visualização de proximidade"}
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            AO VIVO
          </Text>
        </View>
      </View>

      <View style={styles.mapArea}>
        <View
          style={styles.horizontalLineOne}
        />

        <View
          style={styles.horizontalLineTwo}
        />

        <View
          style={styles.verticalLineOne}
        />

        <View
          style={styles.verticalLineTwo}
        />

        <View
          style={styles.centerLineVertical}
        />

        <View
          style={styles.centerLineHorizontal}
        />

        {hasUserLocation ? (
          <View style={styles.userMarker}>
            <View style={styles.userDot} />

            <Text style={styles.userLabel}>
              Você
            </Text>
          </View>
        ) : (
          <View
            style={styles.locationMessage}
          >
            <Text
              style={
                styles.locationMessageText
              }
            >
              Aguardando sua localização...
            </Text>
          </View>
        )}

        {hasUserLocation &&
          friendsWithLocation.map(
            (marker) => (
              <FriendMarkerView
                key={marker.friend.id}
                marker={marker}
              />
            ),
          )}

        {loading && (
          <View style={styles.emptyMapState}>
            <Text style={styles.emptyMapTitle}>Carregando amigos próximos...</Text>
          </View>
        )}

        {error && !loading && ( 
          <View style={styles.emptyMapState}>
            <Text style={styles.emptyMapTitle}>Não foi possível carregar</Text>
            <Text style={styles.emptyMapText}>{error}</Text>
            <Pressable onPress={() => { void loadFriends(); }} style={styles.retryButton}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {!hasUserLocation && !loading && !error && (
          <View
            style={styles.emptyMapState}
          >
            <Text
              style={
                styles.emptyMapTitle
              }
            >
              Localização necessária
            </Text>

            <Text
              style={
                styles.emptyMapText
              }
            >
              Ative sua localização para
              visualizar seus amigos próximos
              no mapa.
            </Text>
          </View>
        )}
      </View>

      {hasUserLocation && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                styles.legendUser,
              ]}
            />

            <Text style={styles.legendText}>
              Você
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                styles.legendOnline,
              ]}
            />

            <Text style={styles.legendText}>
              Online
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                styles.legendOffline,
              ]}
            />

            <Text style={styles.legendText}>
              Offline
            </Text>
          </View>
        </View>
      )}

      {!hasUserLocation && (
        <Text style={styles.warning}>
          A localização é necessária para
          calcular a distÃ¢ncia dos seus amigos.
        </Text>
      )}
    </View>
  );
}

function FriendMarkerView({
  marker,
}: {
  marker: FriendMarker;
}) {
  const isOnline =
    marker.isOnline;

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname:
            "/(main)/friend/[id]",
          params: {
            id: marker.friend.id,
          },
        })
      }
      style={({ pressed }) => [
        styles.friendMarker,
        {
          left: marker.x,
          top: marker.y,
        },
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.markerDot,
          isOnline
            ? styles.onlineMarker
            : styles.offlineMarker,
        ]}
      />

      <View style={styles.label}>
        <Text
          style={styles.friendName}
          numberOfLines={1}
        >
          {marker.friend.name}
        </Text>

        <Text style={styles.distance}>
          {formatDistance(
            marker.distance,
          )}
        </Text>

        <Text
          style={[
            styles.friendStatus,
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
    </Pressable>
  );
}

function buildFriendMarkers(
  userLatitude: number | null,
  userLongitude: number | null,
  hasUserLocation: boolean,
  friendLocations: Record<string, { userId: string; latitude: number; longitude: number; updatedAt: string }>,
  presenceStatuses: Record<string, "ONLINE" | "OFFLINE">,
  friends: NearbyFriend[],
): FriendMarker[] {
  if (!hasUserLocation || userLatitude === null || userLongitude === null) {
    return [];
  }

  const markers = friends
    .map((friend) => {
      const realtime = friendLocations[friend.id];
      const friendLatitude = realtime?.latitude ?? friend.latitude;
      const friendLongitude = realtime?.longitude ?? friend.longitude;
      const distance = realtime
        ? calculateDistance(userLatitude, userLongitude, friendLatitude, friendLongitude)
        : friend.distanceMeters;
      const position = calculateRelativePosition(userLatitude, userLongitude, friendLatitude, friendLongitude, distance);
      return {
        friend,
        distance,
        x: position.x,
        y: position.y,
        isOnline: (presenceStatuses[friend.id] ?? friend.status) === "ONLINE",
      };
    });

  return resolveOverlappingMarkers(markers);
}

function calculateRelativePosition(
  userLatitude: number,
  userLongitude: number,
  friendLatitude: number,
  friendLongitude: number,
  distance: number,
) {
  /*
   * Aproximação local:
   *
   * 1 grau de latitude ≈ 111,32 km.
   *
   * A longitude varia de acordo
   * com a latitude atual.
   */
  const latitudeDelta =
    friendLatitude -
    userLatitude;

  const longitudeDelta =
    friendLongitude -
    userLongitude;

  const metersPerLatitude =
    111320;

  const metersPerLongitude =
    111320 *
    Math.cos(
      (userLatitude *
        Math.PI) /
        180,
    );

  const northMeters =
    latitudeDelta *
    metersPerLatitude;

  const eastMeters =
    longitudeDelta *
    metersPerLongitude;

  let x =
    MAP_SIZE / 2 +
    (eastMeters /
      MAX_RADIUS_METERS) *
      (MAP_SIZE / 2 -
        MAP_PADDING);

  let y =
    MAP_SIZE / 2 -
    (northMeters /
      MAX_RADIUS_METERS) *
      (MAP_SIZE / 2 -
        MAP_PADDING);

  /*
   * Amigos que estejam além do
   * raio visual máximo são mantidos
   * na borda do mapa, preservando
   * a direção aproximada.
   */
  if (
    distance >
    MAX_RADIUS_METERS
  ) {
    const scale =
      MAX_RADIUS_METERS /
      distance;

    x =
      MAP_SIZE / 2 +
      ((eastMeters * scale) /
        MAX_RADIUS_METERS) *
        (MAP_SIZE / 2 -
          MAP_PADDING);

    y =
      MAP_SIZE / 2 -
      ((northMeters * scale) /
        MAX_RADIUS_METERS) *
        (MAP_SIZE / 2 -
          MAP_PADDING);
  }

  x = clamp(
    x,
    MAP_PADDING,
    MAP_SIZE - MAP_PADDING,
  );

  y = clamp(
    y,
    MAP_PADDING,
    MAP_SIZE - MAP_PADDING,
  );

  return {
    x,
    y,
  };
}

function resolveOverlappingMarkers(
  markers: FriendMarker[],
) {
  const result =
    markers.map(
      (marker) => ({
        ...marker,
      }),
    );

  const minimumDistance = 54;

  for (
    let i = 0;
    i < result.length;
    i++
  ) {
    for (
      let j = 0;
      j < i;
      j++
    ) {
      const current =
        result[i];

      const previous =
        result[j];

      const dx =
        current.x -
        previous.x;

      const dy =
        current.y -
        previous.y;

      const distance =
        Math.sqrt(
          dx * dx +
            dy * dy,
        );

      if (
        distance <
        minimumDistance
      ) {
        const angle =
          (i * 137.5 * Math.PI) /
          180;

        const offset =
          minimumDistance -
          distance +
          8;

        current.x +=
          Math.cos(angle) *
          offset;

        current.y +=
          Math.sin(angle) *
          offset;

        current.x = clamp(
          current.x,
          MAP_PADDING,
          MAP_SIZE -
            MAP_PADDING,
        );

        current.y = clamp(
          current.y,
          MAP_PADDING,
          MAP_SIZE -
            MAP_PADDING,
        );
      }
    }
  }

  return result;
}

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.max(
    min,
    Math.min(max, value),
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  subtitle: {
    color: "#777777",
    fontSize: 11,
    marginTop: 3,
  },

  badge: {
    backgroundColor: "#17351D",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginLeft: 10,
  },

  badgeText: {
    color: "#4CAF50",
    fontSize: 9,
    fontWeight: "800",
  },

  mapArea: {
    height: MAP_SIZE,
    backgroundColor: "#151515",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#292929",
    position: "relative",
  },

  horizontalLineOne: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "35%",
    height: 1,
    backgroundColor: "#242424",
  },

  horizontalLineTwo: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "70%",
    height: 1,
    backgroundColor: "#242424",
  },

  verticalLineOne: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33%",
    width: 1,
    backgroundColor: "#242424",
  },

  verticalLineTwo: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "66%",
    width: 1,
    backgroundColor: "#242424",
  },

  centerLineVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "50%",
    width: 1,
    backgroundColor: "#202020",
  },

  centerLineHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "#202020",
  },

  userMarker: {
    position: "absolute",
    left:
      MAP_SIZE / 2 - 20,
    top:
      MAP_SIZE / 2 - 10,
    alignItems: "center",
    zIndex: 20,
  },

  userDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2196F3",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },

  userLabel: {
    color: "#FFFFFF",
    backgroundColor: "#111111",
    fontSize: 10,
    fontWeight: "700",
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },

  friendMarker: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
    transform: [
      {
        translateX: -36,
      },
      {
        translateY: -10,
      },
    ],
  },

  markerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },

  onlineMarker: {
    backgroundColor: "#4CAF50",
  },

  offlineMarker: {
    backgroundColor: "#777777",
  },

  label: {
    minWidth: 72,
    maxWidth: 120,
    backgroundColor: "#111111",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 4,
    alignItems: "center",
  },

  friendName: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  distance: {
    color: "#FFC400",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },

  friendStatus: {
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },

  onlineText: {
    color: "#4CAF50",
  },

  offlineText: {
    color: "#777777",
  },

  locationMessage: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    backgroundColor: "#111111",
    borderRadius: 10,
    padding: 10,
  },

  locationMessageText: {
    color: "#AAAAAA",
    fontSize: 11,
    textAlign: "center",
  },

  emptyMapState: {
    position: "absolute",
    left: 25,
    right: 25,
    bottom: 20,
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },

  emptyMapTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyMapText: {
    color: "#888888",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },

  legend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 10,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  legendUser: {
    backgroundColor: "#2196F3",
  },

  legendOnline: {
    backgroundColor: "#4CAF50",
  },

  legendOffline: {
    backgroundColor: "#777777",
  },

  legendText: {
    color: "#888888",
    fontSize: 10,
  },

  warning: {
    color: "#888888",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 10,
  },

  retryButton: {
    marginTop: 10,
    backgroundColor: "#FFC400",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  retryText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
  },
});
