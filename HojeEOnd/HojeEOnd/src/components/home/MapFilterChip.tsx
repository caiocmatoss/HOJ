import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, radii } from "@/theme/tokens";

type Props = { label: string; selected?: boolean; onPress: () => void };

export function MapFilterChip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "rgba(21, 25, 29, 0.94)",
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  selected: { backgroundColor: colors.brand, borderColor: colors.brand },
  label: { color: colors.text, fontFamily: fonts.medium, fontSize: 13 },
  selectedLabel: { color: colors.background, fontFamily: fonts.bold },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
