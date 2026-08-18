import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useCheckinStore } from "@/store/checkin-store";
import { useFavoriteStore } from "@/store/favorite-store";

interface VenueActionsProps {
  venueId: string;
}

export function VenueActions({
  venueId,
}: VenueActionsProps) {
  const isFavorite = useFavoriteStore(
    (state) => state.isFavorite(venueId),
  );

  const toggleFavorite = useFavoriteStore(
    (state) => state.toggleFavorite,
  );

  const currentVenue = useCheckinStore(
    (state) => state.currentVenue,
  );

  const checkin = useCheckinStore(
    (state) => state.checkin,
  );

  const checkout = useCheckinStore(
    (state) => state.checkout,
  );

  const isCheckedIn =
    currentVenue === venueId;

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => toggleFavorite(venueId)}
        style={({ pressed }) => [
          styles.actionButton,
          isFavorite && styles.favoriteActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="heart"
          size={22}
          color={
            isFavorite
              ? "#000000"
              : "#FFC400"
          }
        />

        <Text
          style={[
            styles.actionText,
            isFavorite && styles.favoriteText,
          ]}
        >
          {isFavorite
            ? "Favoritado"
            : "Favoritar"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          isCheckedIn
            ? checkout()
            : checkin(venueId)
        }
        style={({ pressed }) => [
          styles.actionButton,
          isCheckedIn &&
            styles.checkinActive,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name={
            isCheckedIn
              ? "location"
              : "location-outline"
          }
          size={22}
          color={
            isCheckedIn
              ? "#FFFFFF"
              : "#FFC400"
          }
        />

        <Text
          style={[
            styles.actionText,
            isCheckedIn &&
              styles.checkinText,
          ]}
        >
          {isCheckedIn
            ? "Você está aqui"
            : "Fazer check-in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFC400",
    backgroundColor: "#151515",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
  },

  favoriteActive: {
    backgroundColor: "#FFC400",
  },

  checkinActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  favoriteText: {
    color: "#000000",
  },

  checkinText: {
    color: "#FFFFFF",
  },

  pressed: {
    opacity: 0.8,
  },
});