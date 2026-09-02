import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BrandMark } from "@/components/ui/BrandMark";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";

export default function NotFoundScreen() {
  const accessToken = useUserStore((state) => state.accessToken);
  const user = useUserStore((state) => state.user);
  const destination = accessToken && user ? "/(main)/home" : "/(auth)/login";

  return (
    <SafeAreaView edges={["top", "right", "bottom", "left"]} style={styles.page}>
      <View pointerEvents="none" style={styles.glow} />
      <View style={styles.card}>
        <BrandMark tagline="A cidade continua acontecendo" />

        <View style={styles.iconShell}>
          <Ionicons color={colors.brand} name="navigate-outline" size={31} />
        </View>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Esse caminho não leva a lugar nenhum.</Text>
        <Text style={styles.message}>
          A página pode ter mudado ou o endereço não existe mais. Volte para continuar explorando.
        </Text>

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Ir para o início"
            accessibilityRole="button"
            onPress={() => router.replace(destination)}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.background} name="home" size={18} />
            <Text style={styles.primaryText}>Ir para o início</Text>
          </Pressable>

          {router.canGoBack() ? (
            <Pressable
              accessibilityLabel="Voltar para a tela anterior"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>Voltar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    padding: 22,
  },
  glow: {
    backgroundColor: colors.brandSoft,
    borderRadius: 240,
    height: 420,
    pointerEvents: "none",
    position: "absolute",
    right: -210,
    top: -150,
    width: 420,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    maxWidth: 520,
    paddingHorizontal: 24,
    paddingVertical: 30,
    width: "100%",
    ...shadows.floating,
  },
  iconShell: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: 30,
    borderWidth: 1,
    height: 60,
    justifyContent: "center",
    marginTop: 28,
    width: 60,
  },
  code: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 2.4,
    marginTop: 17,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 29,
    lineHeight: 34,
    marginTop: 7,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
    maxWidth: 390,
    textAlign: "center",
  },
  actions: { gap: 10, marginTop: 23, width: "100%" },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
  },
  primaryText: { color: colors.background, fontFamily: fonts.bold, fontSize: 13 },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
