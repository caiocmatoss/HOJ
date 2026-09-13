import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, radii } from "@/theme/tokens";

export type NearbyDiscoveryItem = {
  id: string;
  kind: "venue" | "event" | "external";
  title: string;
  category: string;
  distance?: string;
  detail?: string;
  occupancy?: string;
  image?: string | null;
};

export function NearbyDiscoveryCard({
  item,
  onPress,
}: {
  item: NearbyDiscoveryItem;
  onPress: () => void;
}) {
  const detail = [item.detail, item.occupancy].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityHint="Abre os detalhes"
      accessibilityLabel={item.title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.icon, item.kind === "event" && styles.eventIcon]}>
        <Ionicons
          color={item.kind === "event" ? colors.success : colors.brand}
          name={item.kind === "event" ? "calendar" : "location"}
          size={19}
        />
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.meta}>
          {item.category}{item.distance ? ` · ${item.distance}` : ""}
        </Text>
        {detail ? <Text numberOfLines={1} style={styles.detail}>{detail}</Text> : null}
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 11,
    width: "100%",
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: 20,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  eventIcon: { backgroundColor: colors.successSoft, borderColor: "rgba(106, 191, 160, 0.24)" },
  content: { flex: 1, marginHorizontal: 12, minWidth: 0 },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  meta: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 1 },
  detail: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  pressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.995 }] },
});
