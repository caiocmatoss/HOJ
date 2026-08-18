import {
  StyleSheet,
  Text,
  View,
} from "react-native";

type FeedbackType =
  | "success"
  | "warning"
  | "error"
  | "info";

interface FeedbackMessageProps {
  type?: FeedbackType;
  title?: string;
  message: string;
}

export function FeedbackMessage({
  type = "info",
  title,
  message,
}: FeedbackMessageProps) {
  return (
    <View
      style={[
        styles.container,
        getContainerStyle(type),
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.icon,
            getTitleStyle(type),
          ]}
        >
          {getIcon(type)}
        </Text>

        {title ? (
          <Text
            style={[
              styles.title,
              getTitleStyle(type),
            ]}
          >
            {title}
          </Text>
        ) : null}
      </View>

      <Text style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

function getIcon(
  type: FeedbackType,
) {
  switch (type) {
    case "success":
      return "✓";

    case "warning":
      return "⚠";

    case "error":
      return "✕";

    default:
      return "ℹ";
  }
}

function getContainerStyle(
  type: FeedbackType,
) {
  switch (type) {
    case "success":
      return styles.successContainer;

    case "warning":
      return styles.warningContainer;

    case "error":
      return styles.errorContainer;

    default:
      return styles.infoContainer;
  }
}

function getTitleStyle(
  type: FeedbackType,
) {
  switch (type) {
    case "success":
      return styles.successTitle;

    case "warning":
      return styles.warningTitle;

    case "error":
      return styles.errorTitle;

    default:
      return styles.infoTitle;
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  icon: {
    fontSize: 15,
    fontWeight: "800",
  },

  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
  },

  message: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  successContainer: {
    backgroundColor: "#17351D",
    borderColor: "#245C2D",
  },

  warningContainer: {
    backgroundColor: "#2A2300",
    borderColor: "#594A00",
  },

  errorContainer: {
    backgroundColor: "#351414",
    borderColor: "#5C2222",
  },

  infoContainer: {
    backgroundColor: "#151E2A",
    borderColor: "#24354C",
  },

  successTitle: {
    color: "#4CAF50",
  },

  warningTitle: {
    color: "#FFC400",
  },

  errorTitle: {
    color: "#FF6B6B",
  },

  infoTitle: {
    color: "#64B5F6",
  },
});