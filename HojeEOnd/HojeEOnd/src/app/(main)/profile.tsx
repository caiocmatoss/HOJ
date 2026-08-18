import {
  useMemo,
  useState,
} from "react";

import {
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

import { friends } from "@/data/friends";
import { venues } from "@/data/venues";

import {
  requestNotificationPermission,
  sendTestNotification,
} from "@/services/notifications";

import { useFavoriteStore } from "@/store/favorite-store";
import { useGroupStore } from "@/store/group-store";
import { useNotificationStore } from "@/store/notification-store";
import { useUserStore } from "@/store/user-store";

export default function ProfileScreen() {
  const {
    user,
    updateStatus,
  } = useUserStore();

  const groups = useGroupStore(
    (state) => state.groups,
  );

  const favoriteIds =
    useFavoriteStore(
      (state) => state.favorites,
    );

  const favoriteVenues =
    useMemo(() => {
      return favoriteIds
        .map((venueId) =>
          venues.find(
            (venue) =>
              venue.id === venueId,
          ),
        )
        .filter(
          (
            venue,
          ): venue is (typeof venues)[number] =>
            venue !== undefined,
        );
    }, [favoriteIds]);

  const userGroupsCount =
    useMemo(() => {
      return groups.filter(
        (group) =>
          group.members.includes(
            user.id,
          ),
      ).length;
    }, [
      groups,
      user.id,
    ]);

  const permissionStatus =
    useNotificationStore(
      (state) =>
        state.permissionStatus,
    );

  const notificationsEnabled =
    useNotificationStore(
      (state) =>
        state.notificationsEnabled,
    );

  const loading =
    useNotificationStore(
      (state) =>
        state.loading,
    );

  const notificationError =
    useNotificationStore(
      (state) =>
        state.error,
    );

  const setPermissionStatus =
    useNotificationStore(
      (state) =>
        state.setPermissionStatus,
    );

  const setNotificationsEnabled =
    useNotificationStore(
      (state) =>
        state.setNotificationsEnabled,
    );

  const setLoading =
    useNotificationStore(
      (state) =>
        state.setLoading,
    );

  const setError =
    useNotificationStore(
      (state) =>
        state.setError,
    );

  const [
    notificationMessage,
    setNotificationMessage,
  ] = useState<
    string | null
  >(null);

  const [
    notificationMessageType,
    setNotificationMessageType,
  ] = useState<
    "success" | "warning"
  >("success");

  const handleEnableNotifications =
    async () => {
      try {
        setLoading(true);
        setError(null);
        setNotificationMessage(null);

        const granted =
          await requestNotificationPermission();

        setPermissionStatus(
          granted
            ? "granted"
            : "denied",
        );

        setNotificationsEnabled(
          granted,
        );

        if (granted) {
          setNotificationMessageType(
            "success",
          );

          setNotificationMessage(
            "Notificações ativadas com sucesso.",
          );
        } else {
          setNotificationMessageType(
            "warning",
          );

          setNotificationMessage(
            "Permissão de notificações não concedida.",
          );
        }
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setError(
            error.message,
          );
        } else {
          setError(
            "Não foi possível ativar as notificações.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const handleTestNotification =
    async () => {
      try {
        setLoading(true);
        setError(null);
        setNotificationMessage(null);

        const notificationId =
          await sendTestNotification();

        if (!notificationId) {
          setPermissionStatus(
            "denied",
          );

          setNotificationsEnabled(
            false,
          );

          setNotificationMessageType(
            "warning",
          );

          setNotificationMessage(
            "Permissão necessária para enviar notificações.",
          );

          return;
        }

        setPermissionStatus(
          "granted",
        );

        setNotificationsEnabled(
          true,
        );

        setNotificationMessageType(
          "success",
        );

        setNotificationMessage(
          "Notificação de teste enviada.",
        );
      } catch (error) {
        if (
          error instanceof Error
        ) {
          setError(
            error.message,
          );
        } else {
          setError(
            "Não foi possível enviar a notificação.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const notificationStatusText =
    getNotificationStatusText(
      permissionStatus,
      notificationsEnabled,
    );

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <ScreenContainer>
        <View
          style={
            styles.content
          }
        >
          <View
            style={
              styles.profileHeader
            }
          >
            <Image
              source={{
                uri:
                  user.avatar,
              }}
              style={
                styles.avatar
              }
            />

            <Text
              style={
                styles.name
              }
            >
              {user.name}
            </Text>

            <Text
              style={[
                styles.status,

                user.status ===
                  "online"
                  ? styles.onlineStatus
                  : styles.offlineStatus,
              ]}
            >
              {user.status ===
              "online"
                ? "🟢 Online"
                : "⚫ Offline"}
            </Text>

            <Text
              style={
                styles.bio
              }
            >
              {user.bio}
            </Text>
          </View>

          <Pressable
            style={({
              pressed,
            }) => [
              styles.primaryButton,

              pressed &&
                styles.pressed,
            ]}
            onPress={() =>
              updateStatus(
                user.status ===
                  "online"
                  ? "offline"
                  : "online",
              )
            }
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Alterar status
            </Text>
          </Pressable>

          <Pressable
            style={({
              pressed,
            }) => [
              styles.secondaryButton,

              pressed &&
                styles.pressed,
            ]}
            onPress={() =>
              router.push(
                "/(main)/edit-profile",
              )
            }
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              ✏️ Editar perfil
            </Text>
          </Pressable>

          <View
            style={
              styles.card
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Resumo
            </Text>

            <View
              style={
                styles.statsRow
              }
            >
              <View
                style={
                  styles.statItem
                }
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    friends.length
                  }
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Amigos
                </Text>
              </View>

              <View
                style={
                  styles.statDivider
                }
              />

              <View
                style={
                  styles.statItem
                }
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    userGroupsCount
                  }
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Grupos
                </Text>
              </View>

              <View
                style={
                  styles.statDivider
                }
              />

              <View
                style={
                  styles.statItem
                }
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {
                    favoriteVenues.length
                  }
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Favoritos
                </Text>
              </View>
            </View>
          </View>

          <View
            style={
              styles.card
            }
          >
            <View
              style={
                styles.notificationHeader
              }
            >
              <View
                style={
                  styles.notificationHeaderText
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
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
                  {
                    notificationStatusText
                  }
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
              style={
                styles.notificationDescription
              }
            >
              Receba alertas de convites,
              mensagens, eventos e atividades
              importantes no HOJÉ OND.
            </Text>

            {!notificationsEnabled && (
              <Pressable
                disabled={
                  loading
                }
                onPress={
                  handleEnableNotifications
                }
                style={({
                  pressed,
                }) => [
                  styles.notificationButton,

                  loading &&
                    styles.disabledButton,

                  pressed &&
                    !loading &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.notificationButtonText
                  }
                >
                  {loading
                    ? "Ativando..."
                    : "Ativar notificações"}
                </Text>
              </Pressable>
            )}

            {notificationsEnabled && (
              <Pressable
                disabled={
                  loading
                }
                onPress={
                  handleTestNotification
                }
                style={({
                  pressed,
                }) => [
                  styles.testButton,

                  loading &&
                    styles.disabledButton,

                  pressed &&
                    !loading &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.testButtonText
                  }
                >
                  {loading
                    ? "Enviando..."
                    : "🔔 Enviar notificação de teste"}
                </Text>
              </Pressable>
            )}

            {permissionStatus ===
              "denied" && (
              <View
                style={
                  styles.feedbackWrapper
                }
              >
                <FeedbackMessage
                  type="warning"
                  title="Permissão negada"
                  message="A permissão foi negada. Talvez seja necessário habilitar notificações nas configurações do navegador ou do dispositivo."
                />
              </View>
            )}

            {notificationMessage && (
              <View
                style={
                  styles.feedbackWrapper
                }
              >
                <FeedbackMessage
                  type={
                    notificationMessageType
                  }
                  title={
                    notificationMessageType ===
                    "success"
                      ? "Tudo certo"
                      : "Atenção"
                  }
                  message={
                    notificationMessage
                  }
                />
              </View>
            )}

            {notificationError && (
              <View
                style={
                  styles.feedbackWrapper
                }
              >
                <FeedbackMessage
                  type="error"
                  title="Erro nas notificações"
                  message={
                    notificationError
                  }
                />
              </View>
            )}
          </View>

          <View
            style={
              styles.card
            }
          >
            <View
              style={
                styles.favoriteHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Favoritos recentes
              </Text>

              {favoriteVenues.length >
                0 && (
                <Text
                  style={
                    styles.favoriteCount
                  }
                >
                  {
                    favoriteVenues.length
                  }
                </Text>
              )}
            </View>

            {favoriteVenues.length >
            0 ? (
              favoriteVenues
                .slice(
                  0,
                  3,
                )
                .map(
                  (venue) => (
                    <Pressable
                      key={
                        venue.id
                      }
                      onPress={() =>
                        router.push({
                          pathname:
                            "/venue/[id]",

                          params: {
                            id:
                              venue.id,
                          },
                        })
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.favoriteItem,

                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            venue.image,
                        }}
                        style={
                          styles.favoriteImage
                        }
                      />

                      <View
                        style={
                          styles.favoriteInfo
                        }
                      >
                        <Text
                          style={
                            styles.favoriteName
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            venue.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.favoriteCategory
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {
                            venue.category
                          }
                        </Text>

                        <Text
                          style={
                            styles.favoriteDistance
                          }
                        >
                          {
                            venue.distance
                          }
                        </Text>
                      </View>

                      <View
                        style={
                          styles.favoriteIcon
                        }
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
                  ),
                )
            ) : (
              <View
                style={
                  styles.emptyFavoriteContainer
                }
              >
                <Text
                  style={
                    styles.emptyFavoriteIcon
                  }
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

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  Favorite locais para que eles
                  apareçam aqui.
                </Text>

                <Pressable
                  onPress={() =>
                    router.push(
                      "/(main)/explore",
                    )
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.exploreButton,

                    pressed &&
                      styles.pressed,
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
        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

function getNotificationStatusText(
  status:
    | "granted"
    | "denied"
    | "undetermined",
  enabled: boolean,
) {
  if (
    enabled ||
    status === "granted"
  ) {
    return "Ativadas";
  }

  if (
    status === "denied"
  ) {
    return "Permissão negada";
  }

  return "Não configuradas";
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#090909",
    },

    scrollContent: {
      paddingTop: 24,
      paddingBottom: 120,
    },

    content: {
      width: "100%",
    },

    profileHeader: {
      alignItems:
        "center",
    },

    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor:
        "#333333",
    },

    name: {
      color:
        "#FFFFFF",

      fontSize: 30,
      fontWeight: "800",

      marginTop: 18,
    },

    status: {
      fontSize: 15,
      fontWeight: "700",

      marginTop: 8,
    },

    onlineStatus: {
      color:
        "#4CAF50",
    },

    offlineStatus: {
      color:
        "#888888",
    },

    bio: {
      color:
        "#CCCCCC",

      fontSize: 15,
      lineHeight: 21,

      marginTop: 12,

      textAlign:
        "center",
    },

    primaryButton: {
      width:
        "100%",

      backgroundColor:
        "#FFC400",

      paddingVertical: 16,

      borderRadius: 14,

      marginTop: 22,

      alignItems:
        "center",
    },

    primaryButtonText: {
      color:
        "#000000",

      fontSize: 15,
      fontWeight: "800",
    },

    secondaryButton: {
      width:
        "100%",

      backgroundColor:
        "#1B1B1B",

      paddingVertical: 16,

      borderRadius: 14,

      marginTop: 12,

      alignItems:
        "center",

      borderWidth: 1,
      borderColor:
        "#333333",
    },

    secondaryButtonText: {
      color:
        "#FFFFFF",

      fontSize: 15,
      fontWeight: "700",
    },

    card: {
      backgroundColor:
        "#1B1B1B",

      width:
        "100%",

      padding: 18,

      borderRadius: 18,

      marginTop: 22,

      borderWidth: 1,
      borderColor:
        "#292929",
    },

    sectionTitle: {
      color:
        "#FFFFFF",

      fontSize: 19,
      fontWeight: "800",

      marginBottom: 14,
    },

    statsRow: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },

    statItem: {
      flex: 1,

      alignItems:
        "center",
    },

    statValue: {
      color:
        "#FFC400",

      fontSize: 24,
      fontWeight: "800",
    },

    statLabel: {
      color:
        "#888888",

      fontSize: 12,

      marginTop: 4,
    },

    statDivider: {
      width: 1,
      height: 38,

      backgroundColor:
        "#333333",
    },

    notificationHeader: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",
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
      color:
        "#4CAF50",
    },

    notificationDisabled: {
      color:
        "#888888",
    },

    notificationDot: {
      width: 10,
      height: 10,

      borderRadius: 5,

      marginTop: 4,
    },

    notificationDotEnabled: {
      backgroundColor:
        "#4CAF50",
    },

    notificationDotDisabled: {
      backgroundColor:
        "#666666",
    },

    notificationDescription: {
      color:
        "#AAAAAA",

      fontSize: 13,
      lineHeight: 19,

      marginTop: 12,
    },

    notificationButton: {
      backgroundColor:
        "#FFC400",

      borderRadius: 14,

      paddingVertical: 14,

      alignItems:
        "center",

      marginTop: 16,
    },

    notificationButtonText: {
      color:
        "#000000",

      fontSize: 14,
      fontWeight: "800",
    },

    testButton: {
      backgroundColor:
        "#17351D",

      borderRadius: 14,

      paddingVertical: 14,

      alignItems:
        "center",

      marginTop: 16,

      borderWidth: 1,
      borderColor:
        "#245C2D",
    },

    testButtonText: {
      color:
        "#4CAF50",

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
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",
    },

    favoriteCount: {
      minWidth: 28,
      height: 28,

      borderRadius: 14,

      backgroundColor:
        "#FFC400",

      color:
        "#000000",

      fontSize: 12,
      fontWeight: "800",

      textAlign:
        "center",

      lineHeight: 28,

      paddingHorizontal: 8,

      marginBottom: 14,
    },

    favoriteItem: {
      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#151515",

      padding: 12,

      borderRadius: 14,

      marginBottom: 10,

      borderWidth: 1,
      borderColor:
        "#292929",
    },

    favoriteImage: {
      width: 58,
      height: 58,

      borderRadius: 12,

      backgroundColor:
        "#292929",

      marginRight: 12,
    },

    favoriteIcon: {
      width: 38,
      height: 38,

      borderRadius: 19,

      backgroundColor:
        "#2A2300",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginLeft: 10,
    },

    favoriteIconText: {
      color:
        "#FFC400",

      fontSize: 18,
    },

    favoriteInfo: {
      flex: 1,
      minWidth: 0,
    },

    favoriteName: {
      color:
        "#FFFFFF",

      fontSize: 14,
      fontWeight: "700",
    },

    favoriteCategory: {
      color:
        "#888888",

      fontSize: 12,

      marginTop: 4,
    },

    favoriteDistance: {
      color:
        "#FFC400",

      fontSize: 11,
      fontWeight: "700",

      marginTop: 5,
    },

    emptyFavoriteContainer: {
      alignItems:
        "center",

      paddingVertical: 14,
      paddingHorizontal: 10,
    },

    emptyFavoriteIcon: {
      color:
        "#FFC400",

      fontSize: 38,
    },

    emptyFavoriteTitle: {
      color:
        "#FFFFFF",

      fontSize: 16,
      fontWeight: "800",

      marginTop: 10,
    },

    emptyText: {
      color:
        "#888888",

      fontSize: 14,
      lineHeight: 20,

      textAlign:
        "center",

      marginTop: 6,
    },

    exploreButton: {
      backgroundColor:
        "#FFC400",

      borderRadius: 12,

      paddingHorizontal: 18,
      paddingVertical: 11,

      marginTop: 16,
    },

    exploreButtonText: {
      color:
        "#000000",

      fontSize: 13,
      fontWeight: "800",
    },

    pressed: {
      opacity: 0.8,
    },
  });