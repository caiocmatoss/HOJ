import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { BrandMark } from "@/components/ui/BrandMark";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";

export default function LaunchExperience() {
  const accessToken = useUserStore((state) => state.accessToken);

  useEffect(() => {
    const destination = accessToken ? "/(main)/home" : "/(auth)/login";
    const timer = setTimeout(() => router.replace(destination), 120);

    return () => clearTimeout(timer);
  }, [accessToken]);

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={[colors.background, "#11161C", colors.background]}
        end={{ x: 0.85, y: 1 }}
        start={{ x: 0.15, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.glow} />

      <View style={styles.content}>
        <BrandMark tagline="A cidade está acontecendo" />

        <View style={styles.statusCard}>
          <ActivityIndicator color={colors.brand} size="small" />
          <Text accessibilityLiveRegion="polite" style={styles.statusText}>
            Preparando sua experiência…
          </Text>
        </View>
      </View>

      <Text style={styles.footer}>DESCUBRA · CONECTE · VIVA AGORA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 24,
  },
  glow: {
    backgroundColor: colors.brandSoft,
    borderRadius: 220,
    height: 440,
    opacity: 0.72,
    position: "absolute",
    right: -250,
    top: -180,
    width: 440,
  },
  content: {
    alignItems: "center",
    gap: 34,
    width: "100%",
  },
  statusCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  statusText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  footer: {
    bottom: 32,
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.6,
    position: "absolute",
  },
});
