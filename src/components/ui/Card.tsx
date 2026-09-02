import { StyleSheet, View, type ViewProps } from "react-native";

import { colors, radii } from "@/theme/tokens";

export function Card(props: ViewProps) {
  return <View {...props} style={[styles.card, props.style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    padding: 16,
  },
});
