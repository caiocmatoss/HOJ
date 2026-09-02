import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, radii, shadows } from "@/theme/tokens";

export function SearchThisAreaButton({
  loading = false,
  onPress,
}: {
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Buscar nesta área"
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, loading && styles.disabled, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={colors.brand} size="small" />
      ) : (
        <>
          <Ionicons color={colors.brand} name="search" size={16} />
          <Text style={styles.text}>Buscar nesta área</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", alignSelf: "center", backgroundColor: "rgba(21, 25, 29, 0.94)", borderColor: colors.brandBorder, borderRadius: radii.pill, borderWidth: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 38, paddingHorizontal: 18, ...shadows.floating },
  text: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 13 },
  disabled: { opacity: 0.55 },
  pressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.98 }] },
});
