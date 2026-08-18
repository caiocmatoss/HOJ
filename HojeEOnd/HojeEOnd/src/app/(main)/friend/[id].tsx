import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { friends } from "@/data/friends";

import { usePresenceStore } from "@/store/presence-store";

export default function FriendProfileScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const friendId =
    Array.isArray(id)
      ? id[0]
      : id;

  const friend = friends.find(
    (item) =>
      item.id === friendId,
  );

  const visible =
    usePresenceStore(
      (state) => state.visible,
    );

  const handleBackToFriends = () => {
    router.replace(
      "/(main)/friends",
    );
  };

  if (!friend) {
    return (
      <View style={styles.errorScreen}>
        <ScreenContainer
          maxWidth={760}
        >
          <View
            style={
              styles.errorContainer
            }
          >
            <Text
              style={
                styles.errorIcon
              }
            >
              👤
            </Text>

            <Text
              style={
                styles.errorTitle
              }
            >
              Amigo não encontrado
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              Não foi possível encontrar
              este amigo.
            </Text>

            <Pressable
              onPress={
                handleBackToFriends
              }
              style={({
                pressed,
              }) => [
                styles.backButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                Voltar para amigos
              </Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const isOnline =
    friend.status === "online";

  const handleOpenChat = () => {
    router.push({
      pathname:
        "/(main)/chat/[id]",

      params: {
        id: friend.id,
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <ScreenContainer
        maxWidth={760}
      >
        <View style={styles.content}>
          <Pressable
            onPress={
              handleBackToFriends
            }
            style={({ pressed }) => [
              styles.topBackButton,

              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.topBackButtonText
              }
            >
              ← Voltar
            </Text>
          </Pressable>

          <View
            style={
              styles.profileCard
            }
          >
            <View
              style={
                styles.avatarContainer
              }
            >
              <Image
                source={{
                  uri: friend.avatar,
                }}
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

            <View
              style={[
                styles.statusBadge,

                isOnline
                  ? styles.onlineBadge
                  : styles.offlineBadge,
              ]}
            >
              <View
                style={[
                  styles.statusBadgeDot,

                  isOnline
                    ? styles.onlineBadgeDot
                    : styles.offlineBadgeDot,
                ]}
              />

              <Text
                style={[
                  styles.statusText,

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

            <Text
              style={
                styles.profileHint
              }
            >
              Amigo da sua rede no
              HOJÉ OND.
            </Text>
          </View>

          <View style={styles.card}>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Status
            </Text>

            <View
              style={
                styles.infoRow
              }
            >
              <View
                style={
                  styles.infoIcon
                }
              >
                <Text
                  style={
                    styles.infoIconText
                  }
                >
                  {isOnline
                    ? "🟢"
                    : "⚫"}
                </Text>
              </View>

              <View
                style={
                  styles.infoContent
                }
              >
                <Text
                  style={
                    styles.infoTitle
                  }
                >
                  Presença
                </Text>

                <Text
                  style={
                    styles.infoDescription
                  }
                >
                  {isOnline
                    ? `${friend.name} está online agora.`
                    : `${friend.name} está offline no momento.`}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Sua visibilidade
            </Text>

            <View
              style={
                styles.visibilityRow
              }
            >
              <View
                style={
                  styles.visibilityIcon
                }
              >
                <Text
                  style={
                    styles.visibilityIconText
                  }
                >
                  {visible
                    ? "👁️"
                    : "🙈"}
                </Text>
              </View>

              <View
                style={
                  styles.infoContent
                }
              >
                <Text
                  style={
                    styles.infoTitle
                  }
                >
                  {visible
                    ? "Visível para amigos"
                    : "Oculto para amigos"}
                </Text>

                <Text
                  style={
                    styles.infoDescription
                  }
                >
                  {visible
                    ? "Seus amigos podem ver sua presença."
                    : "Sua presença está oculta para seus amigos."}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={
              styles.actionsCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Ações
            </Text>

            <Pressable
              onPress={
                handleOpenChat
              }
              style={({ pressed }) => [
                styles.messageButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.messageButtonText
                }
              >
                💬 Enviar mensagem
              </Text>
            </Pressable>

            <Pressable
              onPress={
                handleBackToFriends
              }
              style={({ pressed }) => [
                styles.secondaryButton,

                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Voltar para amigos
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 50,
  },

  content: {
    width: "100%",
  },

  topBackButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
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
    width: 112,
    height: 112,
    position: "relative",
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#333333",
  },

  statusDot: {
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
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
    marginTop: 18,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 10,
  },

  onlineBadge: {
    backgroundColor: "#17351D",
  },

  offlineBadge: {
    backgroundColor: "#252525",
  },

  statusBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  onlineBadgeDot: {
    backgroundColor: "#4CAF50",
  },

  offlineBadgeDot: {
    backgroundColor: "#777777",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  onlineText: {
    color: "#4CAF50",
  },

  offlineText: {
    color: "#999999",
  },

  profileHint: {
    color: "#888888",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },

  card: {
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
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#151515",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  infoIconText: {
    fontSize: 20,
  },

  visibilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  visibilityIconText: {
    fontSize: 20,
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  infoDescription: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  messageButton: {
    width: "100%",
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  messageButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  secondaryButton: {
    width: "100%",
    backgroundColor: "#151515",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333333",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  errorScreen: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
  },

  errorContainer: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 24,
    alignItems: "center",
  },

  errorIcon: {
    fontSize: 42,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14,
  },

  errorText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  backButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginTop: 20,
  },

  backButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});