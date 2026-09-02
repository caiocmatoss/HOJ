import {
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

interface CategoryChipProps {
  title: string;
  active?: boolean;
  onPress?: () => void;
}

export function CategoryChip({
  title,
  active = false,
  onPress = () => {},
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        active && styles.active,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          active && styles.activeText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1B1B1B",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#292929",
  },

  active: {
    backgroundColor: "#FFC400",
    borderColor: "#FFC400",
  },

  pressed: {
    opacity: 0.75,
  },

  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  activeText: {
    color: "#000000",
    fontWeight: "800",
  },
});















































