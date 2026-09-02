import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { colors, shadows } from "@/theme/tokens";

export function MapLocationButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel="Centralizar localização"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons color={colors.brand} name="locate" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: "rgba(21, 25, 29, 0.95)", borderColor: colors.borderStrong, borderRadius: 22, borderWidth: 1, height: 44, justifyContent: "center", width: 44, ...shadows.floating },
  pressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.95 }] },
});
