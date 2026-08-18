import { useCheckinStore } from "@/store/checkin-store";
import { useFavoriteStore } from "@/store/favorite-store";
import { AntDesign, Entypo } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from "react-native";

interface VenueActionsProps {
  venueId: string;
  isFavorite: boolean;
  currentVenueId: string | null;
}

export function VenueActions({ 
  venueId, 
  isFavorite, 
  currentVenueId 
}: VenueActionsProps) {
  const { addFavorite, removeFavorite } = useFavoriteStore();
  const { checkin, checkout } = useCheckinStore();

  const handleFavoritePress = () => {
    if (isFavorite) {
      removeFavorite(venueId);
    } else {
      addFavorite(venueId);
    }
  };

  const handleCheckinPress = () => {
    if (currentVenueId === venueId) {
      checkout();
    } else {
      checkin(venueId);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={handleFavoritePress}
        style={styles.actionButton}
      >
        <AntDesign 
          name="heart" 
          size={24} 
          color={isFavorite ? "#FF4D4D" : "#FFF"} 
        />
        <Text style={styles.actionText}>
          {isFavorite ? "Favorito" : "Favoritar"}
        </Text>
      </Pressable>

      <Pressable 
        onPress={handleCheckinPress}
        style={[
          styles.actionButton, 
          currentVenueId === venueId && styles.checkedInButton
        ]}
      >
        <Entypo 
          name="location-pin" 
          size={24} 
          color={currentVenueId === venueId ? "#4CAF50" : "#FFF"} 
        />
        <Text style={[
          styles.actionText, 
          currentVenueId === venueId && styles.checkedInText
        ]}>
          {currentVenueId === venueId ? "Você está aqui" : "Check-in"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#2D2D2D',
    minWidth: 120,
  },
  checkedInButton: {
    backgroundColor: '#4CAF50',
  },
  actionText: {
    color: '#FFF',
    marginTop: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  checkedInText: {
    color: '#000',
  },
});