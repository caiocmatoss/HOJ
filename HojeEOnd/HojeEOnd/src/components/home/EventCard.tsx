import { router } from "expo-router";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { OccupancyBadge } from "./OccupancyBadge";

interface EventCardProps {
  id: string;
  title: string;
  image: string | null;
  venueName: string;
  time: string;
  category: string;
  price?: number | string | null;
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
}: EventCardProps) {
  const handlePress = () => {
    console.log("[EventCard] Abrindo evento:", id);

    router.push(`/event/${id}`);
  };

  const numericPrice =
    price !== undefined &&
    price !== null
      ? Number(price)
      : 0;

  const hasPrice =
    Number.isFinite(numericPrice) &&
    numericPrice > 0;

  const occupancy =
    attendees > 1000
      ? "Cheio"
      : attendees > 500
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
          <View style={styles.imageFallback}>
            <Text style={styles.fallbackText}>
              HOJÉ OND
            </Text>
          </View>
        )}

        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>
              AO VIVO
            </Text>
          </View>
        )}
      </View>

      <Text
        style={styles.title}
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text
        style={styles.info}
        numberOfLines={1}
      >
        📍 {venueName} • {time}
      </Text>

      <View style={styles.metaRow}>
        <Text
          style={styles.category}
          numberOfLines={1}
        >
          {category}
        </Text>

        {hasPrice ? (
          <Text style={styles.price}>
            R$ {numericPrice.toFixed(2).replace(".", ",")}
          </Text>
        ) : (
          <Text style={styles.free}>
            GRATUITO
          </Text>
        )}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.attendees}>
          {attendees.toLocaleString("pt-BR")} pessoas
        </Text>

        <OccupancyBadge
          status={occupancy}
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
    borderWidth: 1,
    borderColor: "#252525",
  },

  cardPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  imageContainer: {
    width: "100%",
    height: 155,
    backgroundColor: "#333333",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  imageFallback: {
    flex: 1,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
  },

  fallbackText: {
    color: "#FFC400",
    fontSize: 18,
    fontWeight: "900",
  },

  liveBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  liveText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 14,
  },

  info: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 8,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 12,
  },

  category: {
    flex: 1,
    color: "#FFC400",
    fontSize: 13,
    fontWeight: "700",
  },

  price: {
    color: "#FFC400",
    fontSize: 15,
    fontWeight: "800",
  },

  free: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "800",
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  attendees: {
    color: "#AAAAAA",
    fontSize: 13,
  },
});