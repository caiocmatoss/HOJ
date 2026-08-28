import {
  StyleSheet,
  Text,
} from "react-native";

interface OccupancyBadgeProps {
  status: string;
}

export function OccupancyBadge({
  status,
}: OccupancyBadgeProps) {
  return (
    <Text style={styles.badge}>
      {status}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FF8F00",
    color: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    fontWeight: "700",
    marginTop: 10,
    overflow: "hidden",
  },
});