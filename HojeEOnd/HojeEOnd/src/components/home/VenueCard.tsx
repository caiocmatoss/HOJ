import { router } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { OccupancyBadge } from "./OccupancyBadge";

interface VenueCardProps {
  id: string;
  name: string;
  category: string;
  distance: string;
  occupancy: number;
  status: "open" | "closed";
  image?: string;
}

export function VenueCard({
  id,
  name,
  category,
  distance,
  occupancy,
  status,
  image,
}: VenueCardProps) {
  const handlePress = () => {
    router.push(`/venue/${id}`);
  };

  const occupancyStatus =
    occupancy > 80
      ? "Cheio"
      : occupancy > 50
        ? "Moderado"
        : "Livre";

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.imageContainer}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imageFallback} />
        )}
      </View>

      <Text
        style={styles.title}
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text
        style={styles.info}
        numberOfLines={1}
      >
        {category} • {distance}
      </Text>

      <View style={styles.bottomRow}>
        <OccupancyBadge
          status={occupancyStatus}
        />

        <Text
          style={[
            styles.status,
            status === "closed" && styles.closed,
          ]}
        >
          {status === "open"
            ? "Aberto agora"
            : "Fechado"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    padding: 14,
    marginRight: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#252525",
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },

  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#333333",
    borderRadius: 16,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imageFallback: {
    flex: 1,
    backgroundColor: "#333333",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },

  info: {
    color: "#AAAAAA",
    fontSize: 13,
    marginTop: 7,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 12,
  },

  status: {
    flex: 1,
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },

  closed: {
    color: "#F44336",
  },
});