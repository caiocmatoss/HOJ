import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/theme/tokens";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando…" }: LoadingStateProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View style={styles.indicatorShell}>
        <ActivityIndicator color={colors.brand} size="small" />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
    width: "100%",
  },
  indicatorShell: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  message: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: "center",
  },
});
