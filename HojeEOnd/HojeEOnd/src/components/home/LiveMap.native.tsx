import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import MapView, {
  Marker,
} from "react-native-maps";

import { venues } from "@/data/venues";
import { useLocationStore } from "@/store/location-store";

export function LiveMap() {
  const latitude = useLocationStore(
    (state) => state.latitude,
  );

  const longitude = useLocationStore(
    (state) => state.longitude,
  );

  const hasUserLocation =
    latitude !== null &&
    longitude !== null;

  const initialLatitude =
    latitude ?? -23.5505;

  const initialLongitude =
    longitude ?? -46.6333;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={
          hasUserLocation
        }
        showsMyLocationButton
      >
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{
              latitude: venue.latitude,
              longitude: venue.longitude,
            }}
            title={venue.name}
            description={`${venue.category} • ${venue.distance}`}
          />
        ))}

        {hasUserLocation && (
          <Marker
            coordinate={{
              latitude,
              longitude,
            }}
            title="Você está aqui"
            pinColor="#FFC400"
          />
        )}
      </MapView>

      {!hasUserLocation && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            Aguardando sua localização...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1B1B1B",
  },

  map: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor:
      "rgba(9, 9, 9, 0.88)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  overlayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});