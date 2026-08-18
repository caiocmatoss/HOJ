import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

import { OccupancyBadge } from "./OccupancyBadge";

interface EventProps {
  id: string;
  title: string;
  image: string;
  venueName: string;
  time: string;
  category: string;
  price?: number;
  attendees: number;
  isLive: boolean;
}

export function EventCard({
  id,
  title,
  image,
  venueName,
  time,
  category,
  price,
  attendees,
  isLive,
}: EventProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() =>
        router.push({
          pathname: "/event/[id]",
          params: { id },
        })
      }
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>

      <Text style={styles.info} numberOfLines={1}>
        📍 {venueName} • {time}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>

        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        )}

        {price !== undefined && price > 0 ? (
          <Text style={styles.price}>
            R$ {price.toFixed(2).replace(".", ",")}
          </Text>
        ) : (
          <Text style={styles.free}>GRATUITO</Text>
        )}
      </View>

      <View style={styles.attendeesRow}>
        <Text style={styles.attendees}>
          {attendees.toLocaleString("pt-BR")} pessoas
        </Text>

        <OccupancyBadge
          status={
            attendees > 1000
              ? "Cheio"
              : attendees > 500
                ? "Moderado"
                : "Livre"
          }
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    padding: 16,
    marginRight: 16,
    marginBottom: 8,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  imageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: "#333333",
    borderRadius: 16,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 15,
  },

  info: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 8,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },

  category: {
    flex: 1,
    color: "#FFC400",
    fontSize: 14,
    fontWeight: "700",
  },

  liveBadge: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  liveText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  price: {
    color: "#FFC400",
    fontSize: 16,
    fontWeight: "700",
  },

  free: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "700",
  },

  attendeesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  attendees: {
    color: "#AAAAAA",
    fontSize: 14,
  },
});