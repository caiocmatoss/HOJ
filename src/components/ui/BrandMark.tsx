import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii } from "@/theme/tokens";

interface BrandMarkProps {
  compact?: boolean;
  tagline?: string;
}

export function BrandMark({
  compact = false,
  tagline,
}: BrandMarkProps) {
  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.symbol, compact && styles.compactSymbol]}>
        <Ionicons
          color={colors.background}
          name="navigate"
          size={compact ? 18 : 24}
        />
      </View>

      <View style={styles.copy}>
        <Text style={[styles.wordmark, compact && styles.compactWordmark]}>
          HOJE É ONDE
        </Text>

        {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  compactContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  symbol: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 18,
    transform: [{ rotate: "12deg" }],
    width: 48,
  },
  compactSymbol: {
    borderRadius: radii.small,
    height: 36,
    marginBottom: 0,
    width: 36,
  },
  copy: {
    alignItems: "center",
  },
  wordmark: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 3.2,
  },
  compactWordmark: {
    fontSize: 13,
    letterSpacing: 2.2,
    lineHeight: 20,
  },
  tagline: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 3,
  },
});
