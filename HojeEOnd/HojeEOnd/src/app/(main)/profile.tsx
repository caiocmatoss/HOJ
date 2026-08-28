import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { disconnectSocket } from "@/services/socket";

import { useFavoriteStore } from "@/store/favorite-store";
import { useGroupStore } from "@/store/group-store";
import { useLocationStore } from "@/store/location-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";

type NotificationPermissionStatus =
  | "granted"
  | "denied"
  | "undetermined";

export default function ProfileScreen() {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  const groups = useGroupStore((state) => state.groups);

  const favoriteVenues = useFavoriteStore(
    (state) => state.favoriteVenues,
  );

  const favoriteLoading = useFavoriteStore(
    (state) => state.loading,
  );

  const favoriteError = useFavoriteStore(
    (state) => state.error,
  );

  const loadFavorites = useFavoriteStore(
    (state) => state.loadFavorites,
  );

  const presenceVisible = usePresenceStore(
    (state) => state.visible,
  );

  const presenceStatuses = usePresenceStore(
    (state) => state.statuses,
  );

  const latitude = useLocationStore(
    (state) => state.latitude,
  );

  const longitude = useLocationStore(
    (state) => state.longitude,
  );

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(false);

  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>("undetermined");

  const [loading, setLoading] = useState(false);

  const [notificationMessage, setNotificationMessage] =
    useState("");

  const [notificationMessageType, setNotificationMessageType] =
    useState<"success" | "warning">("success");

  const [notificationError, setNotificationError] =
    useState("");

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  const groupCount = groups.length;

  const favoriteCount = favoriteVenues.length;

  const profileName =
    user?.name?.trim() || "Usuário";

  const profileBio =
    user?.bio?.trim() ||
    "Ainda não adicionou uma bio.";

  const profileAvatar =
    user?.avatar?.trim() || "";

  const userPresenceStatus =
    presenceStatuses[user?.id ?? ""] ??
    user?.status;

  const isOnline =
    userPresenceStatus === "ONLINE";

  const locationAvailable =
    latitude !== null &&
    longitude !== null;

  const openEditProfile = () => {
    router.push("/(main)/edit-profile");
  };

  const openGroups = () => {
    router.push("/(main)/groups");
  };

  const openExplore = () => {
    router.push("/(main)/explore");
  };

  const handleLogout = () => {
    disconnectSocket();
    logout();

    router.replace("/(auth)/login");
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    setNotificationError("");
    setNotificationMessage("");

    try {
      setNotificationsEnabled(true);
      setPermissionStatus("granted");

      setNotificationMessage(
        "Notificações ativadas com sucesso.",
      );

      setNotificationMessageType("success");
    } catch (error) {
      console.error(
        "[Profile] Erro ao ativar notificações:",
        error,
      );

      setNotificationError(
        "Não foi possível ativar as notificações.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setNotificationError("");
    setNotificationMessage("");

    try {
      setNotificationMessage(
        "Notificação de teste preparada.",
      );

      setNotificationMessageType("success");
    } catch (error) {
      console.error(
        "[Profile] Erro no teste de notificação:",
        error,
      );

      setNotificationError(
        "Não foi possível enviar a notificação de teste.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ScreenContainer maxWidth={760}>
          <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>
              Faça login
            </Text>

            <Text style={styles.loginText}>
              Você precisa estar autenticado para
              visualizar seu perfil.
            </Text>

            <Pressable
              onPress={() => {
                router.replace("/(auth)/login");
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Ir para login
              </Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ScreenContainer maxWidth={760}>
        <View style={styles.content}>

          {/* HEADER DO PERFIL */}

          <View style={styles.profileHeader}>
            {profileAvatar ? (
              <Image
                source={{
                  uri: profileAvatar,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profileName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            <Text
              style={styles.name}
              numberOfLines={1}
            >
              {profileName}
            </Text>

            <Text
              style={[
                styles.status,
                isOnline
                  ? styles.onlineStatus
                  : styles.offlineStatus,
              ]}
            >
              {isOnline ? "● Online" : "● Offline"}
            </Text>

            <Text style={styles.bio}>
              {profileBio}
            </Text>

            <Pressable
              onPress={openEditProfile}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                Editar perfil
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                Sair da conta
              </Text>
            </Pressable>
          </View>

          {/* ESTATÍSTICAS */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Resumo
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {groupCount}
                </Text>

                <Text style={styles.statLabel}>
                  Grupos
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {favoriteCount}
                </Text>

                <Text style={styles.statLabel}>
                  Favoritos
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {presenceVisible ? "ON" : "OFF"}
                </Text>

                <Text style={styles.statLabel}>
                  Presença
                </Text>
              </View>
            </View>
          </View>

          {/* PRESENÇA */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Presença
            </Text>

            <Text style={styles.notificationDescription}>
              {presenceVisible
                ? "Sua presença está visível para seus amigos."
                : "Sua presença está oculta para seus amigos."}
            </Text>

            <View style={styles.presenceStatusRow}>
              <View
                style={[
                  styles.notificationDot,
                  presenceVisible
                    ? styles.notificationDotEnabled
                    : styles.notificationDotDisabled,
                ]}
              />

              <Text
                style={
                  presenceVisible
                    ? styles.notificationEnabled
                    : styles.notificationDisabled
                }
              >
                {presenceVisible
                  ? "Visível"
                  : "Oculta"}
              </Text>
            </View>

            {locationAvailable ? (
              <Text style={styles.locationText}>
                Localização disponível
              </Text>
            ) : null}
          </View>

          {/* NOTIFICAÇÕES */}

          <View style={styles.card}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationHeaderText}>
                <Text style={styles.sectionTitle}>
                  Notificações
                </Text>

                <Text
                  style={[
                    styles.notificationStatus,
                    notificationsEnabled
                      ? styles.notificationEnabled
                      : styles.notificationDisabled,
                  ]}
                >
                  {getNotificationStatusText(
                    permissionStatus,
                    notificationsEnabled,
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.notificationDot,
                  notificationsEnabled
                    ? styles.notificationDotEnabled
                    : styles.notificationDotDisabled,
                ]}
              />
            </View>

            <Text
              style={styles.notificationDescription}
            >
              Receba avisos sobre mensagens, grupos,
              convites e novidades do Hoje É Ond.
            </Text>

            {!notificationsEnabled ? (
              <Pressable
                disabled={loading}
                onPress={handleEnableNotifications}
                style={({ pressed }) => [
                  styles.notificationButton,
                  loading && styles.disabledButton,
                  pressed &&
                    !loading &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={styles.notificationButtonText}
                >
                  {loading
                    ? "Ativando..."
                    : "Ativar notificações"}
                </Text>
              </Pressable>
            ) : null}

            {notificationsEnabled ? (
              <Pressable
                disabled={loading}
                onPress={handleTestNotification}
                style={({ pressed }) => [
                  styles.testButton,
                  loading && styles.disabledButton,
                  pressed &&
                    !loading &&
                    styles.pressed,
                ]}
              >
                <Text style={styles.testButtonText}>
                  {loading
                    ? "Enviando..."
                    : "🔔 Enviar notificação de teste"}
                </Text>
              </Pressable>
            ) : null}

            {permissionStatus === "denied" ? (
              <View style={styles.feedbackWrapper}>
                <FeedbackMessage
                  type="warning"
                  title="Permissão negada"
                  message="A permissão foi negada. Talvez seja necessário habilitar notificações nas configurações do navegador ou do dispositivo."
                />
              </View>
            ) : null}

            {notificationMessage ? (
              <View style={styles.feedbackWrapper}>
                <FeedbackMessage
                  type={notificationMessageType}
                  title={
                    notificationMessageType === "success"
                      ? "Tudo certo"
                      : "Atenção"
                  }
                  message={notificationMessage}
                />
              </View>
            ) : null}

            {notificationError ? (
              <View style={styles.feedbackWrapper}>
                <FeedbackMessage
                  type="error"
                  title="Erro nas notificações"
                  message={notificationError}
                />
              </View>
            ) : null}
          </View>

          {/* FAVORITOS */}

          <View style={styles.card}>
            <View style={styles.favoriteHeader}>
              <Text style={styles.sectionTitle}>
                Favoritos recentes
              </Text>

              {favoriteVenues.length > 0 ? (
                <Text style={styles.favoriteCount}>
                  {favoriteVenues.length}
                </Text>
              ) : null}
            </View>

            {favoriteLoading ? (
              <View
                style={
                  styles.emptyFavoriteContainer
                }
              >
                <ActivityIndicator color="#FFC400" />

                <Text
                  style={
                    styles.emptyFavoriteTitle
                  }
                >
                  Carregando favoritos...
                </Text>
              </View>
            ) : favoriteError ? (
              <View
                style={
                  styles.emptyFavoriteContainer
                }
              >
                <FeedbackMessage
                  type="error"
                  title="Não foi possível carregar"
                  message={favoriteError}
                />

                <Pressable
                  onPress={() => {
                    void loadFavorites();
                  }}
                  style={({ pressed }) => [
                    styles.exploreButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.exploreButtonText
                    }
                  >
                    Tentar novamente
                  </Text>
                </Pressable>
              </View>
            ) : favoriteVenues.length > 0 ? (
              favoriteVenues
                .slice(0, 3)
                .map((venue) => (
                  <Pressable
                    key={venue.id}
                    onPress={() => {
                      router.push({
                        pathname: "/venue/[id]",
                        params: {
                          id: venue.id,
                        },
                      });
                    }}
                    style={({ pressed }) => [
                      styles.favoriteItem,
                      pressed && styles.pressed,
                    ]}
                  >
                    {venue.image ? (
                      <Image
                        source={{
                          uri: venue.image,
                        }}
                        style={styles.favoriteImage}
                      />
                    ) : (
                      <View
                        style={
                          styles.favoriteImagePlaceholder
                        }
                      >
                        <Text
                          style={
                            styles.favoriteImagePlaceholderText
                          }
                        >
                          {venue.name
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View
                      style={styles.favoriteInfo}
                    >
                      <Text
                        style={styles.favoriteName}
                        numberOfLines={1}
                      >
                        {venue.name}
                      </Text>

                      <Text
                        style={
                          styles.favoriteCategory
                        }
                        numberOfLines={1}
                      >
                        {venue.category}
                      </Text>

                      <Text
                        style={
                          styles.favoriteDistance
                        }
                      >
                        {venue.distance}
                      </Text>
                    </View>

                    <View
                      style={styles.favoriteIcon}
                    >
                      <Text
                        style={
                          styles.favoriteIconText
                        }
                      >
                        ♥
                      </Text>
                    </View>
                  </Pressable>
                ))
            ) : (
              <View
                style={
                  styles.emptyFavoriteContainer
                }
              >
                <Text
                  style={styles.emptyFavoriteIcon}
                >
                  ♡
                </Text>

                <Text
                  style={
                    styles.emptyFavoriteTitle
                  }
                >
                  Nenhum favorito ainda
                </Text>

                <Text style={styles.emptyText}>
                  Favorite locais para que eles
                  apareçam aqui.
                </Text>

                <Pressable
                  onPress={openExplore}
                  style={({ pressed }) => [
                    styles.exploreButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.exploreButtonText
                    }
                  >
                    Explorar locais
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* GRUPOS */}

          <View style={styles.card}>
            <View style={styles.favoriteHeader}>
              <Text style={styles.sectionTitle}>
                Meus grupos
              </Text>

              {groups.length > 0 ? (
                <Text style={styles.favoriteCount}>
                  {groups.length}
                </Text>
              ) : null}
            </View>

            {groups.length > 0 ? (
              groups
                .slice(0, 3)
                .map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => {
                      router.push({
                        pathname:
                          "/(main)/group/[id]",
                        params: {
                          id: group.id,
                        },
                      });
                    }}
                    style={({ pressed }) => [
                      styles.groupItem,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={styles.groupIcon}
                    >
                      <Text
                        style={
                          styles.groupIconText
                        }
                      >
                        👥
                      </Text>
                    </View>

                    <View
                      style={styles.groupInfo}
                    >
                      <Text
                        style={styles.groupName}
                        numberOfLines={1}
                      >
                        {group.name}
                      </Text>

                      <Text
                        style={
                          styles.groupMembers
                        }
                      >
                        {group.members.length}{" "}
                        {group.members.length === 1
                          ? "membro"
                          : "membros"}
                      </Text>
                    </View>

                    <Text
                      style={styles.groupArrow}
                    >
                      ›
                    </Text>
                  </Pressable>
                ))
            ) : (
              <View
                style={
                  styles.emptyFavoriteContainer
                }
              >
                <Text
                  style={styles.emptyFavoriteIcon}
                >
                  👥
                </Text>

                <Text
                  style={
                    styles.emptyFavoriteTitle
                  }
                >
                  Nenhum grupo ainda
                </Text>

                <Text style={styles.emptyText}>
                  Crie ou participe de um grupo
                  para organizar sua noite.
                </Text>

                <Pressable
                  onPress={openGroups}
                  style={({ pressed }) => [
                    styles.exploreButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.exploreButtonText
                    }
                  >
                    Ver grupos
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* LOCALIZAÇÃO */}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Localização
            </Text>

            {locationAvailable ? (
              <View>
                <Text
                  style={
                    styles.locationAvailable
                  }
                >
                  ● Localização disponível
                </Text>

                <Text
                  style={
                    styles.locationDescription
                  }
                >
                  Sua localização está disponível
                  para os recursos que dependem
                  de proximidade.
                </Text>
              </View>
            ) : (
              <View>
                <Text
                  style={
                    styles.locationUnavailable
                  }
                >
                  ● Localização não disponível
                </Text>

                <Text
                  style={
                    styles.locationDescription
                  }
                >
                  Ative a localização quando quiser
                  usar recursos baseados em
                  distância.
                </Text>
              </View>
            )}
          </View>

        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

function getNotificationStatusText(
  status: NotificationPermissionStatus,
  enabled: boolean,
) {
  if (
    enabled ||
    status === "granted"
  ) {
    return "Ativadas";
  }

  if (status === "denied") {
    return "Permissão negada";
  }

  return "Não configuradas";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  scrollContent: {
    paddingTop: 24,
    paddingBottom: 120,
  },

  content: {
    width: "100%",
  },

  loginContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },

  loginTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  loginText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
  },

  profileHeader: {
    alignItems: "center",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333333",
  },

  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarPlaceholderText: {
    color: "#FFC400",
    fontSize: 42,
    fontWeight: "800",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 18,
    maxWidth: "90%",
  },

  status: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },

  onlineStatus: {
    color: "#4CAF50",
  },

  offlineStatus: {
    color: "#888888",
  },

  bio: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12,
    textAlign: "center",
    maxWidth: 650,
  },

  primaryButton: {
    width: "100%",
    backgroundColor: "#FFC400",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 22,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  secondaryButton: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#1B1B1B",
    width: "100%",
    padding: 18,
    borderRadius: 18,
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#292929",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 14,
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#FFC400",
    fontSize: 24,
    fontWeight: "800",
  },

  statLabel: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: "#333333",
  },

  presenceStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  notificationHeaderText: {
    flex: 1,
  },

  notificationStatus: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: -8,
  },

  notificationEnabled: {
    color: "#4CAF50",
  },

  notificationDisabled: {
    color: "#888888",
  },

  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },

  notificationDotEnabled: {
    backgroundColor: "#4CAF50",
  },

  notificationDotDisabled: {
    backgroundColor: "#666666",
  },

  notificationDescription: {
    color: "#AAAAAA",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },

  notificationButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },

  notificationButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  testButton: {
    backgroundColor: "#17351D",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#245C2D",
  },

  testButtonText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.5,
  },

  feedbackWrapper: {
    marginTop: 14,
  },

  favoriteHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  favoriteCount: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFC400",
    color: "#000000",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 28,
    paddingHorizontal: 8,
    marginBottom: 14,
  },

  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#292929",
  },

  favoriteImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#292929",
    marginRight: 12,
  },

  favoriteImagePlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  favoriteImagePlaceholderText: {
    color: "#FFC400",
    fontSize: 22,
    fontWeight: "800",
  },

  favoriteIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  favoriteIconText: {
    color: "#FFC400",
    fontSize: 18,
  },

  favoriteInfo: {
    flex: 1,
    minWidth: 0,
  },

  favoriteName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  favoriteCategory: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
  },

  favoriteDistance: {
    color: "#FFC400",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },

  emptyFavoriteContainer: {
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },

  emptyFavoriteIcon: {
    color: "#FFC400",
    fontSize: 38,
  },

  emptyFavoriteTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },

  exploreButton: {
    backgroundColor: "#FFC400",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 16,
  },

  exploreButtonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
  },

  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#292929",
  },

  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  groupIconText: {
    fontSize: 22,
  },

  groupInfo: {
    flex: 1,
    minWidth: 0,
  },

  groupName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  groupMembers: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
  },

  groupArrow: {
    color: "#FFC400",
    fontSize: 30,
    marginLeft: 10,
  },

  locationText: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 10,
  },

  locationAvailable: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "700",
  },

  locationUnavailable: {
    color: "#888888",
    fontSize: 14,
    fontWeight: "700",
  },

  locationDescription: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  pressed: {
    opacity: 0.8,
  },
});