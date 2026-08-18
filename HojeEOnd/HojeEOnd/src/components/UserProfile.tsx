import { router } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLocationStore } from "@/store/location-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";

export default function UserProfile() {
  const { user } = useUserStore();

  const { latitude, longitude } = useLocationStore();

  const { visible, setVisible } = usePresenceStore();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: user.avatar }}
        style={styles.avatar}
      />

      <Text style={styles.name}>{user.name}</Text>

      <Text style={styles.bio}>{user.bio}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Localização</Text>

        <Text style={styles.infoText}>
          {latitude !== null && longitude !== null
            ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            : "Localização não disponível"}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Visibilidade</Text>

        <Text style={styles.infoText}>
          {visible ? "Visível" : "Oculta"}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.toggleButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => setVisible(!visible)}
      >
        <Text style={styles.toggleButtonText}>
          {visible ? "Tornar oculto" : "Tornar visível"}
        </Text>
      </Pressable>

      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.settingsButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/(main)/edit-profile")}
        >
          <Text style={styles.buttonText}>Editar perfil</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            // Logout será implementado posteriormente.
          }}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },

  bio: {
    color: "#AAAAAA",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },

  infoContainer: {
    backgroundColor: "#1B1B1B",
    padding: 20,
    borderRadius: 18,
    width: "100%",
    marginBottom: 20,
  },

  infoTitle: {
    color: "#FFC400",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },

  infoText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  button: {
    padding: 18,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },

  toggleButton: {
    backgroundColor: "#FFC400",
  },

  settingsButton: {
    backgroundColor: "#1B1B1B",
    flex: 1,
  },

  logoutButton: {
    backgroundColor: "#FF5555",
    flex: 1,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  toggleButtonText: {
    color: "#000000",
    fontWeight: "700",
    fontSize: 16,
  },

  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 15,
  },

  buttonPressed: {
    opacity: 0.8,
  },
});