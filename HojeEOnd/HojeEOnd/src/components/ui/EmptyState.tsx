import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii } from "@/theme/tokens";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = "📭",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text accessibilityElementsHidden style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionLabel && onAction ? (
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
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
  iconContainer: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: 32,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    marginBottom: 16,
    width: 64,
  },
  icon: { fontSize: 28 },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 25,
    lineHeight: 30,
    textAlign: "center",
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 360,
    textAlign: "center",
  },
  button: {
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    marginTop: 18,
    paddingHorizontal: 19,
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  pressed: {
    backgroundColor: colors.brandPressed,
    transform: [{ scale: 0.98 }],
  },
});
