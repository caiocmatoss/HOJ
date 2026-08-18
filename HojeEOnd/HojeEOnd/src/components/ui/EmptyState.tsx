import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
        <Text style={styles.icon}>
          {icon}
        </Text>
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.message}>
        {message}
      </Text>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [
            styles.button,
            pressed &&
              styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },

  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  icon: {
    fontSize: 34,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },

  message: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  button: {
    backgroundColor: "#FFC400",
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 16,
  },

  buttonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});