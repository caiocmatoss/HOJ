import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/theme/tokens";

interface ScreenHeadingProps {
  action?: ReactNode;
  eyebrow?: string;
  subtitle?: string;
  title: string;
}

export function ScreenHeading({ action, eyebrow, subtitle, title }: ScreenHeadingProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 39,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  action: {
    marginLeft: 16,
  },
});
