import { router } from "expo-router";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useLocationStore } from "@/store/location-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";

export default function UserProfile() {
  const { user } = useUserStore();

  const {
    latitude,
    longitude,
  } = useLocationStore();

  const {
    visible,
    setVisible,
  } = usePresenceStore();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={{ uri: user.avatar }}
        style={styles.avatar}
      />

      <Text style={styles.name}>
        {user.name}
      </Text>

      <Text style={styles.bio}>
        {user.bio || "Sem bio"}
      </Text>

      <View style={styles.statsRow}>
        <Stat
          value={user.friendsCount}
          label="Amigos"
        />

        <Stat
          value={user.groupsCount}
          label="Grupos"
        />

        <Stat
          value={user.favoritesCount}
          label="Favoritos"
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>
          Localização
        </Text>

        <Text style={styles.infoText}>
          {latitude !== null &&
          longitude !== null
            ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            : "Localização não disponível"}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>
          Visibilidade
        </Text>

        <Text style={styles.infoText}>
          {visible
            ? "Visível para amigos"
            : "Oculto para amigos"}
        </Text>
      </View>

      <Pressable
        onPress={() => setVisible(!visible)}
        style={({ pressed }) => [
          styles.visibilityButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.visibilityButtonText}>
          {visible
            ? "Tornar oculto"
            : "Tornar visível"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          router.push(
            "/(main)/edit-profile",
          )
        }
        style={({ pressed }) => [
          styles.editButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.editButtonText}>
          Editar perfil
        </Text>
      </Pressable>

      <Pressable
        onPress={() => {}}
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.logoutButtonText}>
          Sair
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  content: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 50,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 20,
    marginBottom: 18,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  bio: {
    color: "#AAAAAA",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  stat: {
    flex: 1,
    backgroundColor: "#1B1B1B",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  statValue: {
    color: "#FFC400",
    fontSize: 21,
    fontWeight: "800",
  },

  statLabel: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
  },

  infoContainer: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#292929",
  },

  infoTitle: {
    color: "#FFC400",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },

  infoText: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  visibilityButton: {
    width: "100%",
    backgroundColor: "#FFC400",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },

  visibilityButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  editButton: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  logoutButton: {
    width: "100%",
    backgroundColor: "#351414",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },

  logoutButtonText: {
    color: "#FF6B6B",
    fontSize: 15,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});