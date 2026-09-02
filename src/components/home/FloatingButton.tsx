import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";

import { colors, shadows } from "@/theme/tokens";

export function FloatingButton() {
  const router = useRouter();

  return (
    <Pressable
      accessibilityHint="Abre a criação de um novo grupo"
      accessibilityLabel="Criar grupo"
      accessibilityRole="button"
      onPress={() => router.push("/(main)/group/create")}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons color={colors.background} name="add" size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 27,
    bottom: 18,
    height: 54,
    justifyContent: "center",
    position: "absolute",
    right: 18,
    width: 54,
    ...shadows.floating,
    ...(Platform.OS === "web" ? { bottom: 18, right: 18 } : {}),
  },
  pressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.95 }] },
});
