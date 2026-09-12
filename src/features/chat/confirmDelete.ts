import { Alert, Platform } from "react-native";

export function confirmDelete(onConfirm: () => void): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm("Excluir esta mensagem?")) {
      onConfirm();
    }
    return;
  }

  Alert.alert("Excluir mensagem", "Deseja excluir esta mensagem?", [
    { text: "Cancelar", style: "cancel" },
    { text: "Excluir", style: "destructive", onPress: onConfirm },
  ]);
}
