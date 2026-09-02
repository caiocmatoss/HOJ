import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { colors, shadows } from "@/theme/tokens";

export function FigmaMapMarker({ selected = false, onPress }: { selected?: boolean; onPress?: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel="Local no mapa" onPress={onPress} style={[styles.marker, selected && styles.selected]}><Ionicons color={selected ? colors.background : colors.brand} name="location" size={selected ? 24 : 20} /></Pressable>;
}
const styles = StyleSheet.create({ marker: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.brand, borderRadius: 20, borderWidth: 2, height: 40, justifyContent: "center", width: 40, ...shadows.floating }, selected: { backgroundColor: colors.brand, borderColor: colors.brand, height: 48, width: 48 } });
