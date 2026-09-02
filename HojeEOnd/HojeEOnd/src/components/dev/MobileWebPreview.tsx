import { Platform, StyleSheet, View } from "react-native";
import { colors } from "@/theme/tokens";

/** Development-only mobile canvas. Native devices keep their real dimensions. */
export function MobileWebPreview({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web" || !__DEV__) return <>{children}</>;
  return <View testID="mobile-web-preview" style={styles.canvas}>{children}</View>;
}

const styles = StyleSheet.create({
  canvas: {
    width: 390,
    maxWidth: "100%",
    height: 844,
    maxHeight: 844,
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
    backgroundColor: colors.background,
  },
});
