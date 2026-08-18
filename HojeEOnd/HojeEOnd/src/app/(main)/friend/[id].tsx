import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { friends } from "@/data/friends";
import { usePresenceStore } from "@/store/presence-store";

export default function FriendProfileScreen() {
  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const friendId = Array.isArray(id)
    ? id[0]
    : id;

  const friend = friends.find(
    (item) => item.id === friendId,
  );

  const { visible } = usePresenceStore();

  if (!friend) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Amigo não encontrado
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  const isOnline =
    friend.status === "online";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={({ pressed }) => [
          styles.topBackButton,
          pressed && styles.pressed,
        ]}
        onPress={() => router.back()}
      >
        <Text style={styles.topBackButtonText}>
          ← Voltar
        </Text>
      </Pressable>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: friend.avatar }}
            style={styles.avatar}
          />

          <View
            style={[
              styles.statusDot,
              isOnline
                ? styles.onlineDot
                : styles.offlineDot,
            ]}
          />
        </View>

        <Text style={styles.name}>
          {friend.name}
        </Text>

        <Text
          style={[
            styles.status,
            isOnline
              ? styles.onlineText
              : styles.offlineText,
          ]}
        >
          {isOnline
            ? "Online"
            : "Offline"}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>
          Informações
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Status
          </Text>

          <Text style={styles.infoValue}>
            {isOnline
              ? "Online agora"
              : "Offline"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>
            Presença
          </Text>

          <Text style={styles.infoValue}>
            {visible
              ? "Disponível"
              : "Oculta"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>
          Ações
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {}}
        >
          <Text style={styles.primaryButtonText}>
            Adicionar amigo
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>
            Voltar para amigos
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  topBackButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 14,
  },

  topBackButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  profileCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333333",
  },

  statusDot: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: "#1B1B1B",
  },

  onlineDot: {
    backgroundColor: "#4CAF50",
  },

  offlineDot: {
    backgroundColor: "#777777",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  status: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },

  onlineText: {
    color: "#4CAF50",
  },

  offlineText: {
    color: "#888888",
  },

  infoCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  actionsCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  infoLabel: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "600",
  },

  infoValue: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
  },

  primaryButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  secondaryButton: {
    backgroundColor: "#151515",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  backButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },

  backButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  errorContainer: {
    flex: 1,
    backgroundColor: "#090909",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },

  pressed: {
    opacity: 0.8,
  },
});