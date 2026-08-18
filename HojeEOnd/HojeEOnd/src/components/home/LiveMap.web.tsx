import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { venues } from "@/data/venues";
import { useLocationStore } from "@/store/location-store";

export function LiveMap() {
  const latitude = useLocationStore(
    (state) => state.latitude,
  );

  const longitude = useLocationStore(
    (state) => state.longitude,
  );

  const status = useLocationStore(
    (state) => state.status,
  );

  const hasLocation =
    latitude !== null &&
    longitude !== null;

  return (
    <View style={styles.container}>
      <View style={styles.mapArea}>
        <View style={styles.gridHorizontalOne} />
        <View style={styles.gridHorizontalTwo} />
        <View style={styles.gridVerticalOne} />
        <View style={styles.gridVerticalTwo} />

        <View style={styles.mapHeader}>
          <View>
            <Text style={styles.mapTitle}>
              Mapa ao vivo
            </Text>

            <Text style={styles.mapSubtitle}>
              Visualização Web
            </Text>
          </View>

          <View style={styles.webBadge}>
            <Text style={styles.webBadgeText}>
              WEB
            </Text>
          </View>
        </View>

        {hasLocation ? (
          <View style={styles.userMarker}>
            <View style={styles.userMarkerDot} />

            <Text style={styles.userMarkerText}>
              Você
            </Text>
          </View>
        ) : (
          <View style={styles.locationWarning}>
            <Text style={styles.locationWarningText}>
              {status === "requesting"
                ? "Obtendo sua localização..."
                : status === "denied"
                  ? "Permissão de localização não concedida."
                  : "Localização ainda não disponível."}
            </Text>
          </View>
        )}

        {venues.slice(0, 3).map(
          (venue, index) => (
            <Pressable
              key={venue.id}
              onPress={() =>
                router.push({
                  pathname: "/venue/[id]",
                  params: {
                    id: venue.id,
                  },
                })
              }
              style={({ pressed }) => [
                styles.marker,
                getMarkerPosition(index),
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.markerPin}>
                <Text style={styles.markerIcon}>
                  📍
                </Text>
              </View>

              <View style={styles.markerLabel}>
                <Text
                  style={styles.markerName}
                  numberOfLines={1}
                >
                  {venue.name}
                </Text>

                <Text style={styles.markerInfo}>
                  {venue.distance}
                </Text>
              </View>
            </Pressable>
          ),
        )}
      </View>

      <View style={styles.locationCard}>
        <Text style={styles.locationTitle}>
          Sua localização
        </Text>

        {hasLocation ? (
          <Text style={styles.coordinates}>
            {latitude.toFixed(5)},{" "}
            {longitude.toFixed(5)}
          </Text>
        ) : (
          <Text style={styles.coordinatesUnavailable}>
            Localização não disponível
          </Text>
        )}
      </View>

      <View style={styles.venuesHeader}>
        <Text style={styles.venuesTitle}>
          Locais no mapa
        </Text>

        <Text style={styles.venuesCount}>
          {venues.length}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          styles.venuesContent
        }
      >
        {venues.map((venue) => (
          <Pressable
            key={venue.id}
            onPress={() =>
              router.push({
                pathname: "/venue/[id]",
                params: {
                  id: venue.id,
                },
              })
            }
            style={({ pressed }) => [
              styles.venueCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.venueTopRow}>
              <View style={styles.venueIcon}>
                <Text style={styles.venueIconText}>
                  📍
                </Text>
              </View>

              <View
                style={[
                  styles.statusDot,
                  venue.status === "open"
                    ? styles.statusOpen
                    : styles.statusClosed,
                ]}
              />
            </View>

            <Text
              style={styles.venueName}
              numberOfLines={1}
            >
              {venue.name}
            </Text>

            <Text
              style={styles.venueCategory}
              numberOfLines={1}
            >
              {venue.category}
            </Text>

            <View style={styles.venueBottomRow}>
              <Text style={styles.venueDistance}>
                {venue.distance}
              </Text>

              <Text style={styles.venueOccupancy}>
                {venue.occupancy}% ocupação
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.webNotice}>
        No aplicativo Android/iOS, esta área usa o
        mapa nativo interativo.
      </Text>
    </View>
  );
}

function getMarkerPosition(
  index: number,
) {
  switch (index) {
    case 0:
      return styles.markerOne;

    case 1:
      return styles.markerTwo;

    default:
      return styles.markerThree;
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  mapArea: {
    height: 300,
    backgroundColor: "#151515",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#292929",
    position: "relative",
  },

  mapHeader: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  mapTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  mapSubtitle: {
    color: "#777777",
    fontSize: 11,
    marginTop: 3,
  },

  webBadge: {
    backgroundColor: "#2A2300",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  webBadgeText: {
    color: "#FFC400",
    fontSize: 9,
    fontWeight: "800",
  },

  gridHorizontalOne: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "35%",
    height: 1,
    backgroundColor: "#242424",
  },

  gridHorizontalTwo: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "70%",
    height: 1,
    backgroundColor: "#242424",
  },

  gridVerticalOne: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "33%",
    width: 1,
    backgroundColor: "#242424",
  },

  gridVerticalTwo: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "66%",
    width: 1,
    backgroundColor: "#242424",
  },

  userMarker: {
    position: "absolute",
    left: "45%",
    top: "47%",
    alignItems: "center",
    zIndex: 10,
  },

  userMarkerDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#2196F3",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },

  userMarkerText: {
    color: "#FFFFFF",
    backgroundColor: "#111111",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
  },

  locationWarning: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "#111111",
    padding: 10,
    borderRadius: 10,
    zIndex: 20,
  },

  locationWarningText: {
    color: "#AAAAAA",
    fontSize: 11,
    textAlign: "center",
  },

  marker: {
    position: "absolute",
    zIndex: 15,
    alignItems: "center",
  },

  markerOne: {
    left: "17%",
    top: "38%",
  },

  markerTwo: {
    right: "15%",
    top: "30%",
  },

  markerThree: {
    right: "27%",
    bottom: "18%",
  },

  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFC400",
    alignItems: "center",
    justifyContent: "center",
  },

  markerIcon: {
    fontSize: 17,
  },

  markerLabel: {
    backgroundColor: "#111111",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginTop: 4,
    maxWidth: 125,
  },

  markerName: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  markerInfo: {
    color: "#888888",
    fontSize: 9,
    marginTop: 2,
  },

  locationCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#292929",
  },

  locationTitle: {
    color: "#FFC400",
    fontSize: 12,
    fontWeight: "800",
  },

  coordinates: {
    color: "#FFFFFF",
    fontSize: 13,
    marginTop: 5,
  },

  coordinatesUnavailable: {
    color: "#777777",
    fontSize: 13,
    marginTop: 5,
  },

  venuesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },

  venuesTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  venuesCount: {
    color: "#000000",
    backgroundColor: "#FFC400",
    fontSize: 10,
    fontWeight: "800",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 8,
  },

  venuesContent: {
    paddingRight: 20,
  },

  venueCard: {
    width: 190,
    backgroundColor: "#1B1B1B",
    borderRadius: 16,
    padding: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#292929",
  },

  venueTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  venueIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
  },

  venueIconText: {
    fontSize: 16,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusOpen: {
    backgroundColor: "#4CAF50",
  },

  statusClosed: {
    backgroundColor: "#FF5555",
  },

  venueName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 11,
  },

  venueCategory: {
    color: "#888888",
    fontSize: 11,
    marginTop: 4,
  },

  venueBottomRow: {
    marginTop: 11,
  },

  venueDistance: {
    color: "#FFC400",
    fontSize: 11,
    fontWeight: "700",
  },

  venueOccupancy: {
    color: "#777777",
    fontSize: 10,
    marginTop: 3,
  },

  webNotice: {
    color: "#666666",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 12,
  },

  pressed: {
    opacity: 0.75,
  },
});