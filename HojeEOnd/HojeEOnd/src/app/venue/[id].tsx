import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { venues } from "@/data/venues";
import { useCheckinStore } from "@/store/checkin-store";
import { useFavoriteStore } from "@/store/favorite-store";

export default function VenueDetailsScreen() {
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const {
    isFavorite,
    addFavorite,
    removeFavorite,
  } = useFavoriteStore();

  const {
    currentVenue,
    checkin,
    checkout,
  } = useCheckinStore();

  const venueId = Array.isArray(id)
    ? id[0]
    : id;

  if (!venueId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Local não encontrado
        </Text>

        <Pressable
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  const venue = venues.find(
    (item) => item.id === venueId,
  );

  if (!venue) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Local não encontrado
        </Text>

        <Pressable
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorButtonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  const favorite = isFavorite(venueId);

  const isCurrentlyCheckedIn =
    currentVenue === venueId;

  const isOpen =
    venue.status === "open";

  const handleFavorite = () => {
    if (favorite) {
      removeFavorite(venueId);
    } else {
      addFavorite(venueId);
    }
  };

  const handleCheckin = () => {
    if (isCurrentlyCheckedIn) {
      checkout();
      return;
    }

    checkin(venueId);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={({ pressed }) => [
          styles.backButtonTop,
          pressed && styles.pressed,
        ]}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonTopText}>
          ← Voltar
        </Text>
      </Pressable>

      <Image
        source={{ uri: venue.image }}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <View style={styles.headerRow}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>
            {venue.name}
          </Text>

          <Text style={styles.category}>
            {venue.category}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isOpen
              ? styles.statusOpen
              : styles.statusClosed,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isOpen
                ? styles.statusOpenText
                : styles.statusClosedText,
            ]}
          >
            {isOpen
              ? "Aberto"
              : "Fechado"}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          onPress={handleFavorite}
          style={({ pressed }) => [
            styles.actionButton,
            favorite &&
              styles.favoriteActive,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.actionIcon,
              favorite &&
                styles.favoriteIconActive,
            ]}
          >
            {favorite ? "♥" : "♡"}
          </Text>

          <Text
            style={[
              styles.actionText,
              favorite &&
                styles.favoriteTextActive,
            ]}
          >
            {favorite
              ? "Favoritado"
              : "Favoritar"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCheckin}
          style={({ pressed }) => [
            styles.actionButton,
            isCurrentlyCheckedIn &&
              styles.checkinActive,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionIcon}>
            📍
          </Text>

          <Text
            style={[
              styles.actionText,
              isCurrentlyCheckedIn &&
                styles.checkinTextActive,
            ]}
          >
            {isCurrentlyCheckedIn
              ? "Você está aqui"
              : "Check-in"}
          </Text>
        </Pressable>
      </View>

      {isCurrentlyCheckedIn && (
        <View style={styles.checkedInBanner}>
          <Text style={styles.checkedInBannerText}>
            ✓ Você está fazendo check-in neste local
          </Text>
        </View>
      )}

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {venue.occupancy}
          </Text>

          <Text style={styles.statLabel}>
            Ocupação
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {venue.distance}
          </Text>

          <Text style={styles.statLabel}>
            Distância
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {venue.people}
          </Text>

          <Text style={styles.statLabel}>
            Pessoas
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          Informações
        </Text>

        <InfoRow
          icon="⭐"
          label="Nota"
          value={String(venue.rating)}
        />

        <InfoRow
          icon="📍"
          label="Endereço"
          value={venue.address}
        />

        <InfoRow
          icon="🚪"
          label="Status"
          value={
            isOpen ? "Aberto" : "Fechado"
          }
        />

        <InfoRow
          icon="🎧"
          label="DJ"
          value={venue.dj}
        />

        <InfoRow
          icon="🎵"
          label="Playlist"
          value={venue.playlist}
        />

        <InfoRow
          icon="🎁"
          label="Promoção"
          value={venue.promotion}
        />
      </View>

      <View style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>
          Sobre o local
        </Text>

        <Text style={styles.description}>
          {venue.description}
        </Text>
      </View>

      {venue.gallery.length > 0 && (
        <View style={styles.gallerySection}>
          <Text style={styles.sectionTitle}>
            Galeria
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.galleryContent
            }
          >
            {venue.gallery.map(
              (photo, index) => (
                <Image
                  key={`${venue.id}-${index}`}
                  source={{ uri: photo }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ),
            )}
          </ScrollView>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.groupButton,
          pressed && styles.pressed,
        ]}
        onPress={() =>
          router.push("/(main)/groups")
        }
      >
        <Text style={styles.groupButtonText}>
          🎉 Criar grupo neste local
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Voltar
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabel}>
        <Text style={styles.infoIcon}>
          {icon}
        </Text>

        <Text style={styles.infoLabelText}>
          {label}
        </Text>
      </View>

      <Text
        style={styles.infoValue}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  backButtonTop: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  backButtonTopText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  heroImage: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    backgroundColor: "#1B1B1B",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },

  headerInfo: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  category: {
    color: "#FFC400",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },

  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusOpen: {
    backgroundColor: "#17351D",
  },

  statusClosed: {
    backgroundColor: "#351414",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  statusOpenText: {
    color: "#4CAF50",
  },

  statusClosedText: {
    color: "#FF6B6B",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  actionButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFC400",
    backgroundColor: "#151515",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  favoriteActive: {
    backgroundColor: "#FFC400",
  },

  checkinActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  actionIcon: {
    color: "#FFC400",
    fontSize: 22,
    marginBottom: 3,
  },

  favoriteIconActive: {
    color: "#000000",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  favoriteTextActive: {
    color: "#000000",
  },

  checkinTextActive: {
    color: "#FFFFFF",
  },

  checkedInBanner: {
    backgroundColor: "#17351D",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
  },

  checkedInBannerText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    paddingVertical: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#FFC400",
    fontSize: 17,
    fontWeight: "800",
  },

  statLabel: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#333333",
  },

  infoCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 105,
  },

  infoIcon: {
    fontSize: 16,
  },

  infoLabelText: {
    color: "#999999",
    fontSize: 14,
    fontWeight: "600",
  },

  infoValue: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
  },

  descriptionCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  description: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 24,
  },

  gallerySection: {
    marginTop: 22,
  },

  galleryContent: {
    paddingRight: 20,
  },

  galleryImage: {
    width: 230,
    height: 160,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: "#1B1B1B",
  },

  groupButton: {
    backgroundColor: "#FFC400",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },

  groupButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  backButton: {
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.8,
  },

  errorContainer: {
    flex: 1,
    backgroundColor: "#090909",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },

  errorButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },

  errorButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },
});