import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Carregando...",
}: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#FFC400"
      />

      <Text style={styles.message}>
        {message}
      </Text>
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

  message: {
    color: "#AAAAAA",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    textAlign: "center",
  },
});