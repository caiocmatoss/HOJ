import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { events } from "@/data/events";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const event = events.find((item) => item.id === id);

  if (!event) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>Evento não encontrado</Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {event.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>AO VIVO</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{event.category}</Text>

        <Text style={styles.title}>{event.title}</Text>

        <Text style={styles.venue}>📍 {event.venueName}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>📅 {event.date}</Text>
          <Text style={styles.infoText}>🕐 {event.time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>📍 {event.distance}</Text>
          <Text style={styles.infoText}>
            👥 {event.attendees.toLocaleString("pt-BR")} pessoas
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Ingresso</Text>
          <Text style={styles.price}>
            {event.price !== undefined && event.price > 0
              ? `R$ ${event.price.toFixed(2).replace(".", ",")}`
              : "Gratuito"}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Sobre o evento</Text>

        <Text style={styles.description}>{event.description}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() =>
            router.push({
              pathname: "/venue/[id]",
              params: { id: event.venueId },
            })
          }
        >
          <Text style={styles.primaryButtonText}>Ver local</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  contentContainer: {
    paddingBottom: 32,
  },

  imageContainer: {
    width: "100%",
    height: 260,
    backgroundColor: "#1B1B1B",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  liveBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  content: {
    padding: 20,
  },

  category: {
    color: "#FFC400",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 14,
  },

  venue: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },

  infoText: {
    flex: 1,
    color: "#AAAAAA",
    fontSize: 14,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1B1B1B",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 24,
  },

  priceLabel: {
    color: "#AAAAAA",
    fontSize: 14,
  },

  price: {
    color: "#FFC400",
    fontSize: 20,
    fontWeight: "800",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },

  description: {
    color: "#C7C7C7",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  notFoundContainer: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  notFoundTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  backButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },

  backButtonText: {
    color: "#000000",
    fontWeight: "800",
  },
});