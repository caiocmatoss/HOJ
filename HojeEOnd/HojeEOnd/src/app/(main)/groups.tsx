import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  router,
  useFocusEffect,
} from "expo-router";

import { EmptyState } from "@/components/ui/EmptyState";

import {
  ScreenContainer,
} from "@/components/ui/ScreenContainer";

import { getVenues, type ApiVenue } from "@/services/api";

import {
  useGroupStore,
} from "@/store/group-store";

export default function GroupsScreen() {
  const groups =
    useGroupStore(
      (state) =>
        state.groups,
    );

  const loading =
    useGroupStore(
      (state) =>
        state.loading,
    );

  const error =
    useGroupStore(
      (state) =>
        state.error,
    );

  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [venuesError, setVenuesError] = useState<string | null>(null);

  const loadVenues = useCallback(async () => {
    setVenuesLoading(true);
    setVenuesError(null);
    try {
      setVenues(await getVenues());
    } catch (requestError) {
      setVenuesError(requestError instanceof Error ? requestError.message : "Não foi possível carregar os locais.");
    } finally {
      setVenuesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVenues();
  }, [loadVenues]);

  const loadGroups =
    useGroupStore(
      (state) =>
        state.loadGroups,
    );

  /*
   * Sempre que a tela de grupos
   * entrar em foco, buscamos os
   * grupos reais no backend.
   *
   * Isso evita usar somente os
   * grupos antigos do AsyncStorage.
   */
  useFocusEffect(
    useCallback(() => {
      void loadGroups();
    }, [
      loadGroups,
    ]),
  );

  /*
   * Relaciona o venueId do grupo
   * com os dados locais dos locais.
   *
   * O ID do grupo continua sendo
   * o ID REAL vindo do backend.
   */
  const groupsWithVenue = useMemo(() => {
    const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
    return groups.map((group) => {
      const venue = venuesById.get(group.venueId);
      return {
        ...group,
        venueName: venue?.name ?? "Local não informado",
        venueDistance: venue?.distance ?? "Distância não disponível",
      };
    });
  }, [groups, venues]);
  const openGroup = (
    groupId: string,
  ) => {
    if (!groupId) {
      return;
    }

    router.push({
      pathname:
        "/(main)/group/[id]",

      params: {
        id: groupId,
      },
    });
  };

  const openReceivedInvites =
    () => {
      router.push(
        "/(main)/invites",
      );
    };

  const createGroup =
    () => {
      router.push(
        "/(main)/group/create",
      );
    };

  /*
   * Enquanto a primeira consulta
   * ao backend está acontecendo,
   * mostramos carregamento.
   */
  if (
    loading &&
    groups.length === 0
  ) {
    return (
      <View
        style={
          styles.container
        }
      >
        <ScreenContainer>
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color="#FFC400"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Carregando grupos...
            </Text>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <FlatList
        data={
          groupsWithVenue
        }

        keyExtractor={(
          item,
        ) => item.id}

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          groupsWithVenue.length >
          0
            ? styles.listContent
            : styles.emptyListContent
        }

        ListHeaderComponent={
          <ScreenContainer>
            <View
              style={
                styles.header
              }
            >
              <View
                style={
                  styles.headerText
                }
              >
                <Text
                  style={
                    styles.title
                  }
                >
                  Grupos
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  {loading
                    ? "Sincronizando..."
                    : groups.length ===
                        0
                      ? "Nenhum grupo criado"
                      : `${groups.length} ${
                          groups.length ===
                          1
                            ? "grupo"
                            : "grupos"
                        }`}
                </Text>
              </View>

              <View
                style={
                  styles.headerActions
                }
              >
                <Pressable
                  onPress={
                    openReceivedInvites
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.invitesButton,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={21}
                    color="#FFC400"
                  />

                  <Text
                    style={
                      styles.invitesButtonText
                    }
                  >
                    Convites
                  </Text>
                </Pressable>

                <Pressable
                  onPress={
                    createGroup
                  }
                  style={({
                    pressed,
                  }) => [
                    styles.addButton,

                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.addButtonText
                    }
                  >
                    +
                  </Text>
                </Pressable>
              </View>

              {error && (
                <View
                  style={
                    styles.errorBox
                  }
                >
                  <Ionicons
                    name="warning-outline"
                    size={18}
                    color="#FF6B6B"
                  />

                  <View
                    style={
                      styles.errorContent
                    }
                  >
                    <Text
                      style={
                        styles.errorTitle
                      }
                    >
                      Não foi possível
                      sincronizar os grupos
                    </Text>

                    <Text
                      style={
                        styles.errorText
                      }
                    >
                      {error}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      void loadGroups()
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.retryButton,

                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Text
                      style={
                        styles.retryButtonText
                      }
                    >
                      Tentar
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScreenContainer>
        }

        renderItem={({
          item,
        }) => (
          <ScreenContainer>
            <Pressable
              onPress={() =>
                openGroup(
                  item.id,
                )
              }
              style={({
                pressed,
              }) => [
                styles.card,

                pressed &&
                  styles.cardPressed,
              ]}
            >
              <View
                style={
                  styles.iconContainer
                }
              >
                <Text
                  style={
                    styles.icon
                  }
                >
                  👥
                </Text>
              </View>

              <View
                style={
                  styles.cardContent
                }
              >
                <Text
                  style={
                    styles.groupName
                  }
                  numberOfLines={
                    1
                  }
                >
                  {item.name}
                </Text>

                <Text
                  style={
                    styles.venueName
                  }
                  numberOfLines={
                    1
                  }
                >
                  📍{" "}
                  {
                    item.venueName
                  }
                </Text>

                <Text
                  style={
                    styles.venueDistance
                  }
                >
                  {
                    item.venueDistance
                  }
                </Text>

                <View
                  style={
                    styles.metaRow
                  }
                >
                  <Text
                    style={
                      styles.members
                    }
                  >
                    {
                      item.members
                        .length
                    }{" "}
                    {item.members
                      .length ===
                    1
                      ? "membro"
                      : "membros"}
                  </Text>

                  <Text
                    style={[
                      styles.status,

                      item.members
                        .length >
                        0
                        ? styles.activeStatus
                        : styles.emptyStatus,
                    ]}
                  >
                    {item.members
                      .length >
                    0
                      ? "Ativo"
                      : "Sem membros"}
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.arrow
                }
              >
                ›
              </Text>
            </Pressable>
          </ScreenContainer>
        )}

        ListEmptyComponent={
          <ScreenContainer>
            <View
              style={
                styles.emptyWrapper
              }
            >
              <EmptyState
                icon="👥"
                title="Nenhum grupo ainda"
                message="Crie um grupo para organizar sua próxima saída com seus amigos."
                actionLabel="Criar grupo"
                onAction={
                  createGroup
                }
              />
            </View>
          </ScreenContainer>
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      backgroundColor:
        "#090909",
    },

    listContent: {
      paddingTop: 24,

      paddingBottom: 120,
    },

    emptyListContent: {
      flexGrow: 1,

      paddingTop: 24,

      paddingBottom: 120,
    },

    header: {
      width: "100%",

      paddingBottom: 14,
    },

    headerText: {
      marginBottom: 14,
    },

    title: {
      color: "#FFC400",

      fontSize: 30,

      fontWeight: "800",
    },

    subtitle: {
      color: "#888888",

      fontSize: 14,

      marginTop: 5,
    },

    headerActions: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,
    },

    invitesButton: {
      flex: 1,

      height: 46,

      borderRadius: 14,

      backgroundColor:
        "#1B1B1B",

      borderWidth: 1,

      borderColor:
        "#393000",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,
    },

    invitesButtonText: {
      color: "#FFC400",

      fontSize: 14,

      fontWeight: "800",
    },

    addButton: {
      width: 46,

      height: 46,

      borderRadius: 23,

      backgroundColor:
        "#FFC400",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    addButtonText: {
      color: "#000000",

      fontSize: 30,

      fontWeight: "600",

      lineHeight: 32,
    },

    errorBox: {
      width: "100%",

      marginTop: 14,

      padding: 14,

      borderRadius: 14,

      backgroundColor:
        "#2A1515",

      borderWidth: 1,

      borderColor:
        "#632727",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 10,
    },

    errorContent: {
      flex: 1,

      minWidth: 0,
    },

    errorTitle: {
      color: "#FF8A8A",

      fontSize: 13,

      fontWeight: "800",
    },

    errorText: {
      color: "#C9A0A0",

      fontSize: 11,

      lineHeight: 16,

      marginTop: 3,
    },

    retryButton: {
      paddingHorizontal: 12,

      paddingVertical: 8,

      borderRadius: 10,

      backgroundColor:
        "#FFC400",
    },

    retryButtonText: {
      color: "#000000",

      fontSize: 12,

      fontWeight: "800",
    },

    card: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#1B1B1B",

      borderRadius: 18,

      padding: 16,

      marginBottom: 12,

      borderWidth: 1,

      borderColor:
        "#292929",
    },

    cardPressed: {
      opacity: 0.82,

      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    iconContainer: {
      width: 58,

      height: 58,

      borderRadius: 29,

      backgroundColor:
        "#2A2300",

      alignItems:
        "center",

      justifyContent:
        "center",

      marginRight: 14,
    },

    icon: {
      fontSize: 27,
    },

    cardContent: {
      flex: 1,

      minWidth: 0,
    },

    groupName: {
      color: "#FFFFFF",

      fontSize: 18,

      fontWeight: "800",
    },

    venueName: {
      color: "#FFC400",

      fontSize: 13,

      marginTop: 6,
    },

    venueDistance: {
      color: "#777777",

      fontSize: 12,

      marginTop: 3,
    },

    metaRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginTop: 8,
    },

    members: {
      color: "#999999",

      fontSize: 12,
    },

    status: {
      fontSize: 12,

      fontWeight: "700",
    },

    activeStatus: {
      color: "#4CAF50",
    },

    emptyStatus: {
      color: "#777777",
    },

    arrow: {
      color: "#FFC400",

      fontSize: 30,

      marginLeft: 10,
    },

    emptyWrapper: {
      width: "100%",

      paddingTop: 40,
    },

    loadingContainer: {
      flex: 1,

      minHeight: 500,

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    loadingText: {
      color: "#888888",

      fontSize: 14,

      marginTop: 14,
    },

    pressed: {
      opacity: 0.8,
    },
  });