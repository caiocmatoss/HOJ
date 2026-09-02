import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii } from "@/theme/tokens";

type FeedbackType = "success" | "warning" | "error" | "info";

interface FeedbackMessageProps {
  type?: FeedbackType;
  title?: string;
  message: string;
}

const presentation: Record<
  FeedbackType,
  {
    color: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    surface: string;
  }
> = {
  error: { color: colors.danger, icon: "alert-circle", surface: colors.dangerSoft },
  info: { color: colors.textSecondary, icon: "information-circle", surface: colors.elevated },
  success: { color: colors.success, icon: "checkmark-circle", surface: colors.successSoft },
  warning: { color: colors.brand, icon: "warning", surface: colors.brandSoft },
};

export function FeedbackMessage({
  type = "info",
  title,
  message,
}: FeedbackMessageProps) {
  const variant = presentation[type];

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={type === "error" ? "alert" : undefined}
      style={[styles.container, { backgroundColor: variant.surface }]}
    >
      <Ionicons color={variant.color} name={variant.icon} size={19} />
      <View style={styles.copy}>
        {title ? <Text style={[styles.title, { color: variant.color }]}>{title}</Text> : null}
        <Text style={[styles.message, !title && styles.messageWithoutTitle]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    borderColor: colors.borderStrong,
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 13,
    width: "100%",
  },
  copy: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.bold, fontSize: 12 },
  message: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  messageWithoutTitle: { marginTop: 0 },
});
