import {
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import MapView, {
  Marker,
} from "react-native-maps";

import {
  ApiVenue,
  getVenues,
} from "@/services/api";

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

  const [venues, setVenues] = useState<ApiVenue[]>(
    [],
  );

  useEffect(() => {
    let mounted = true;

    const loadVenues = async () => {
      try {
        const response = await getVenues();

        if (!mounted) {
          return;
        }

        setVenues(
          Array.isArray(response)
            ? response
            : [],
        );
      } catch {
        if (!mounted) {
          return;
        }

        setVenues([]);
      }
    };

    void loadVenues();

    return () => {
      mounted = false;
    };
  }, []);

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
        {venues.map((venue) => {
          const venueLatitude =
            Number(venue.latitude);

          const venueLongitude =
            Number(venue.longitude);

          if (
            !Number.isFinite(
              venueLatitude,
            ) ||
            !Number.isFinite(
              venueLongitude,
            )
          ) {
            return null;
          }

          return (
            <Marker
              key={venue.id}
              coordinate={{
                latitude:
                  venueLatitude,
                longitude:
                  venueLongitude,
              }}
              title={venue.name}
              description={`${venue.category} • ${
                venue.distance ||
                "Distância indisponível"
              }`}
            />
          );
        })}

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
          <Text
            style={styles.overlayText}
          >
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