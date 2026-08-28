import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  rejectFriendRequest,
  type ApiFriend,
  type ApiFriendRequest,
} from "@/services/api";

import { getPresence } from "@/services/socket";

import { usePresenceStore } from "@/store/presence-store";

import { useUserStore } from "@/store/user-store";

export default function FriendsScreen() {
  const user = useUserStore(
    (state) => state.user,
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    friends,
    setFriends,
  ] = useState<ApiFriend[]>([]);

  const [
    requests,
    setRequests,
  ] = useState<ApiFriendRequest[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingRequests,
    setLoadingRequests,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    requestsError,
    setRequestsError,
  ] = useState<string | null>(null);

  const [
    processingRequestId,
    setProcessingRequestId,
  ] = useState<string | null>(null);

  const presenceStatuses =
    usePresenceStore(
      (state) => state.statuses,
    );

  /**
   * =====================================================
   * CARREGAR AMIGOS
   * =====================================================
   */
  const loadFriends =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getFriends();

        setFriends(result);

        console.log(
          "[Friends] amigos reais carregados:",
          result,
        );
      } catch (err) {
        console.error(
          "[Friends] erro ao carregar amigos:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar seus amigos.",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * =====================================================
   * CARREGAR SOLICITAÇÕES
   * =====================================================
   */
  const loadFriendRequests =
    useCallback(async () => {
      setLoadingRequests(true);
      setRequestsError(null);

      try {
        const result =
          await getFriendRequests();

        setRequests(result);

        console.log(
          "[Friends] solicitações recebidas:",
          result,
        );
      } catch (err) {
        console.error(
          "[Friends] erro ao carregar solicitações:",
          err,
        );

        setRequestsError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as solicitações.",
        );
      } finally {
        setLoadingRequests(false);
      }
    }, []);

  /**
   * =====================================================
   * CARREGAMENTO INICIAL
   * =====================================================
   */
  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    void loadFriendRequests();
  }, [loadFriendRequests]);

  /**
   * =====================================================
   * PRESENÇA REAL
   * =====================================================
   */
  useEffect(() => {
    let cancelled = false;

    const loadPresence =
      async () => {
        try {
          await getPresence();

          if (!cancelled) {
            console.log(
              "[Friends] presença carregada.",
            );
          }
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "[Friends] erro ao carregar presença:",
            err,
          );
        }
      };

    void loadPresence();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * =====================================================
   * STATUS DO AMIGO
   * =====================================================
   *
   * A presença em tempo real do Socket.IO
   * tem prioridade.
   *
   * Quando ainda não existe informação no
   * PresenceStore, o status da API é utilizado
   * como fallback.
   */
  const getFriendStatus =
    (
      friend: ApiFriend,
    ): "online" | "offline" => {
      const realtimeStatus =
        presenceStatuses[
          friend.id
        ];

      if (
        realtimeStatus ===
        "ONLINE"
      ) {
        return "online";
      }

      if (
        realtimeStatus ===
        "OFFLINE"
      ) {
        return "offline";
      }

      return friend.status ===
        "ONLINE"
        ? "online"
        : "offline";
    };

  /**
   * =====================================================
   * BUSCA DE AMIGOS
   * =====================================================
   */
  const filteredFriends =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return friends;
      }

      return friends.filter(
        (friend) =>
          friend.name
            .toLowerCase()
            .includes(query),
      );
    }, [
      friends,
      searchQuery,
    ]);

  /**
   * =====================================================
   * AMIGOS ONLINE
   * =====================================================
   */
  const onlineFriends =
    useMemo(
      () =>
        filteredFriends.filter(
          (friend) =>
            getFriendStatus(
              friend,
            ) === "online",
        ),
      [
        filteredFriends,
        presenceStatuses,
      ],
    );

  /**
   * =====================================================
   * AMIGOS OFFLINE
   * =====================================================
   */
  const offlineFriends =
    useMemo(
      () =>
        filteredFriends.filter(
          (friend) =>
            getFriendStatus(
              friend,
            ) === "offline",
        ),
      [
        filteredFriends,
        presenceStatuses,
      ],
    );

  const orderedFriends = [
    ...onlineFriends,
    ...offlineFriends,
  ];

  const onlineCount =
    onlineFriends.length;

  const hasSearch =
    searchQuery.trim().length >
    0;

  /**
   * =====================================================
   * ACEITAR SOLICITAÇÃO
   * =====================================================
   */
  const handleAcceptRequest =
    async (
      requestId: string,
    ) => {
      if (
        processingRequestId
      ) {
        return;
      }

      try {
        setProcessingRequestId(
          requestId,
        );

        setRequestsError(
          null,
        );

        await acceptFriendRequest(
          requestId,
        );

        /**
         * O backend já alterou a amizade
         * para ACCEPTED.
         *
         * Atualizamos as duas listas para
         * refletir imediatamente o novo estado.
         */
        await Promise.all([
          loadFriends(),
          loadFriendRequests(),
        ]);

        console.log(
          "[Friends] solicitação aceita:",
          requestId,
        );
      } catch (err) {
        console.error(
          "[Friends] erro ao aceitar solicitação:",
          err,
        );

        setRequestsError(
          err instanceof Error
            ? err.message
            : "Não foi possível aceitar a solicitação.",
        );
      } finally {
        setProcessingRequestId(
          null,
        );
      }
    };

  /**
   * =====================================================
   * RECUSAR SOLICITAÇÃO
   * =====================================================
   */
  const handleRejectRequest =
    async (
      requestId: string,
    ) => {
      if (
        processingRequestId
      ) {
        return;
      }

      try {
        setProcessingRequestId(
          requestId,
        );

        setRequestsError(
          null,
        );

        await rejectFriendRequest(
          requestId,
        );

        /**
         * Atualizamos somente as
         * solicitações, porque a amizade
         * não foi criada.
         */
        await loadFriendRequests();

        console.log(
          "[Friends] solicitação recusada:",
          requestId,
        );
      } catch (err) {
        console.error(
          "[Friends] erro ao recusar solicitação:",
          err,
        );

        setRequestsError(
          err instanceof Error
            ? err.message
            : "Não foi possível recusar a solicitação.",
        );
      } finally {
        setProcessingRequestId(
          null,
        );
      }
    };

  /**
   * =====================================================
   * RENDER DA SOLICITAÇÃO
   * =====================================================
   */
  const renderFriendRequest =
    (
      request: ApiFriendRequest,
    ) => {
      /**
       * GET /friends/requests retorna
       * solicitações destinadas ao usuário
       * autenticado.
       *
       * Portanto, o requester é quem
       * enviou a solicitação.
       *
       * O campo requester é opcional no tipo
       * retornado pela API, então fazemos
       * fallback seguro para evitar acesso
       * a undefined.
       */
      const requester =
        request.requester;

      const requesterName =
        requester?.name ??
        "Usuário";

      const requesterAvatar =
        requester?.avatar ??
        "https://i.pravatar.cc/150?img=12";

      const isProcessing =
        processingRequestId ===
        request.id;

      return (
        <View
          key={request.id}
          style={
            styles.requestCard
          }
        >
          <View
            style={
              styles.requestAvatarContainer
            }
          >
            <Image
              source={{
                uri:
                  requesterAvatar,
              }}
              style={
                styles.requestAvatar
              }
            />
          </View>

          <View
            style={
              styles.requestContent
            }
          >
            <Text
              style={
                styles.requestName
              }
              numberOfLines={1}
            >
              {requesterName}
            </Text>

            <Text
              style={
                styles.requestMessage
              }
            >
              quer ser seu amigo
            </Text>

            <View
              style={
                styles.requestActions
              }
            >
              <Pressable
                disabled={
                  isProcessing
                }
                onPress={() =>
                  void handleAcceptRequest(
                    request.id,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.acceptButton,

                  isProcessing &&
                    styles.disabledButton,

                  pressed &&
                    !isProcessing &&
                    styles.pressed,
                ]}
              >
                {isProcessing ? (
                  <ActivityIndicator
                    size="small"
                    color="#000000"
                  />
                ) : (
                  <Text
                    style={
                      styles.acceptButtonText
                    }
                  >
                    Aceitar
                  </Text>
                )}
              </Pressable>

              <Pressable
                disabled={
                  isProcessing
                }
                onPress={() =>
                  void handleRejectRequest(
                    request.id,
                  )
                }
                style={({
                  pressed,
                }) => [
                  styles.rejectButton,

                  isProcessing &&
                    styles.disabledButton,

                  pressed &&
                    !isProcessing &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.rejectButtonText
                  }
                >
                  Recusar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    };

  /**
   * =====================================================
   * HEADER
   * =====================================================
   */
  const renderHeader =
    () => (
      <ScreenContainer>
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.titleRow
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Amigos
            </Text>

            {loading ||
            loadingRequests ? (
              <ActivityIndicator
                size="small"
                color="#FFC400"
                style={
                  styles.titleLoader
                }
              />
            ) : null}
          </View>

          <Text
            style={
              styles.subtitle
            }
          >
            {onlineCount}{" "}
            {onlineCount === 1
              ? "amigo online"
              : "amigos online"}{" "}
            agora
          </Text>

          <TextInput
            value={
              searchQuery
            }
            onChangeText={
              setSearchQuery
            }
            placeholder="Buscar amigos..."
            placeholderTextColor="#777777"
            style={
              styles.searchInput
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />

          {requestsError ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Text
                style={
                  styles.errorText
                }
              >
                {requestsError}
              </Text>

              <Pressable
                onPress={() => {
                  void loadFriendRequests();
                }}
                style={
                  styles.retryButton
                }
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          ) : null}

          {requests.length >
            0 && (
            <View
              style={
                styles.requestsSection
              }
            >
              <View
                style={
                  styles.requestsTitleRow
                }
              >
                <Text
                  style={
                    styles.requestsTitle
                  }
                >
                  Solicitações de amizade
                </Text>

                <View
                  style={
                    styles.requestCountBadge
                  }
                >
                  <Text
                    style={
                      styles.requestCountText
                    }
                  >
                    {
                      requests.length
                    }
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.requestsSubtitle
                }
              >
                Pessoas que querem
                adicionar você
              </Text>

              <View
                style={
                  styles.requestsList
                }
              >
                {requests.map(
                  renderFriendRequest,
                )}
              </View>
            </View>
          )}

          {loadingRequests &&
          requests.length ===
            0 ? (
            <View
              style={
                styles.requestsLoading
              }
            >
              <ActivityIndicator
                size="small"
                color="#FFC400"
              />

              <Text
                style={
                  styles.requestsLoadingText
                }
              >
                Verificando solicitações...
              </Text>
            </View>
          ) : null}

          {orderedFriends.length >
            0 && (
            <View
              style={
                styles.listHeader
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                {onlineFriends.length >
                0
                  ? "Online agora"
                  : "Amigos"}
              </Text>

              {onlineFriends.length >
                0 && (
                <Text
                  style={
                    styles.sectionMeta
                  }
                >
                  {
                    onlineFriends.length
                  }{" "}
                  {onlineFriends.length ===
                  1
                    ? "amigo online"
                    : "amigos online"}
                </Text>
              )}
            </View>
          )}
        </View>
      </ScreenContainer>
    );

  /**
   * =====================================================
   * RENDER
   * =====================================================
   */
  return (
    <View
      style={
        styles.container
      }
    >
      <FlatList
        data={
          orderedFriends
        }
        keyExtractor={(item) =>
          item.id
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          orderedFriends.length >
          0
            ? styles.listContent
            : styles.emptyListContent
        }
        ListHeaderComponent={
          renderHeader()
        }
        renderItem={({
          item,
        }) => {
          const isOnline =
            getFriendStatus(
              item,
            ) === "online";

          return (
            <ScreenContainer>
              <Pressable
                style={({
                  pressed,
                }) => [
                  styles.card,

                  pressed &&
                    styles.cardPressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname:
                      "/(main)/friend/[id]",
                    params: {
                      id: item.id,
                    },
                  })
                }
              >
                <View
                  style={
                    styles.avatarContainer
                  }
                >
                  <Image
                    source={{
                      uri:
                        item.avatar ??
                        "https://i.pravatar.cc/150?img=12",
                    }}
                    style={
                      styles.avatar
                    }
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

                <View
                  style={
                    styles.friendInfo
                  }
                >
                  <Text
                    style={
                      styles.name
                    }
                    numberOfLines={
                      1
                    }
                  >
                    {item.name}
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

                  <Text
                    style={
                      styles.friendHint
                    }
                    numberOfLines={
                      1
                    }
                  >
                    Toque para ver o perfil
                  </Text>
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
          );
        }}
        ListEmptyComponent={
          <ScreenContainer>
            <View
              style={
                styles.emptyWrapper
              }
            >
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#FFC400"
                />
              ) : (
                <EmptyState
                  icon="👥"
                  title={
                    error
                      ? "Erro ao carregar amigos"
                      : "Nenhum amigo encontrado"
                  }
                  message={
                    error
                      ? "Verifique sua conexão com o backend."
                      : hasSearch
                        ? "Tente buscar por outro nome."
                        : "Quando você adicionar amigos, eles aparecerão aqui."
                  }
                  actionLabel={
                    hasSearch
                      ? "Limpar busca"
                      : undefined
                  }
                  onAction={
                    hasSearch
                      ? () =>
                          setSearchQuery(
                            "",
                          )
                      : undefined
                  }
                />
              )}
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
      paddingBottom: 8,
    },

    titleRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    title: {
      color: "#FFC400",
      fontSize: 30,
      fontWeight: "800",
    },

    titleLoader: {
      marginLeft: 10,
    },

    subtitle: {
      color: "#888888",
      fontSize: 14,
      marginTop: 5,
    },

    searchInput: {
      width: "100%",
      marginTop: 18,
      marginBottom: 8,
      backgroundColor:
        "#1B1B1B",
      color: "#FFFFFF",
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 52,
      fontSize: 16,
      borderWidth: 1,
      borderColor:
        "#292929",
    },

    errorBox: {
      backgroundColor:
        "#321515",
      borderWidth: 1,
      borderColor:
        "#5A2424",
      borderRadius: 14,
      padding: 14,
      marginTop: 10,
    },

    errorText: {
      color: "#FFB4B4",
      fontSize: 13,
      lineHeight: 19,
    },

    retryButton: {
      alignSelf:
        "flex-start",
      backgroundColor:
        "#FFC400",
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginTop: 10,
    },

    retryButtonText: {
      color: "#000000",
      fontSize: 13,
      fontWeight: "800",
    },

    requestsSection: {
      marginTop: 18,
      backgroundColor:
        "#1B1B1B",
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor:
        "#292929",
    },

    requestsTitleRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    requestsTitle: {
      flex: 1,
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
    },

    requestCountBadge: {
      minWidth: 28,
      height: 28,
      paddingHorizontal: 8,
      borderRadius: 14,
      backgroundColor:
        "#FFC400",
      alignItems: "center",
      justifyContent:
        "center",
      marginLeft: 10,
    },

    requestCountText: {
      color: "#000000",
      fontSize: 13,
      fontWeight: "900",
    },

    requestsSubtitle: {
      color: "#888888",
      fontSize: 13,
      marginTop: 4,
      marginBottom: 14,
    },

    requestsList: {
      width: "100%",
    },

    requestCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#151515",
      borderRadius: 14,
      padding: 12,
      marginTop: 10,
      borderWidth: 1,
      borderColor:
        "#292929",
    },

    requestAvatarContainer: {
      width: 52,
      height: 52,
      marginRight: 12,
    },

    requestAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor:
        "#333333",
    },

    requestContent: {
      flex: 1,
      minWidth: 0,
    },

    requestName: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    requestMessage: {
      color: "#888888",
      fontSize: 12,
      marginTop: 3,
    },

    requestActions: {
      flexDirection:
        "row",
      gap: 8,
      marginTop: 10,
    },

    acceptButton: {
      flex: 1,
      minHeight: 38,
      backgroundColor:
        "#FFC400",
      borderRadius: 10,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent:
        "center",
    },

    acceptButtonText: {
      color: "#000000",
      fontSize: 12,
      fontWeight: "800",
    },

    rejectButton: {
      flex: 1,
      minHeight: 38,
      backgroundColor:
        "#202020",
      borderRadius: 10,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
      borderColor:
        "#333333",
    },

    rejectButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.45,
    },

    requestsLoading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 16,
      paddingVertical: 8,
    },

    requestsLoadingText: {
      color: "#777777",
      fontSize: 12,
      marginLeft: 8,
    },

    listHeader: {
      paddingTop: 18,
      paddingBottom: 4,
    },

    sectionTitle: {
      color: "#FFFFFF",
      fontSize: 19,
      fontWeight: "800",
    },

    sectionMeta: {
      color: "#666666",
      fontSize: 12,
      marginTop: 4,
      marginBottom: 8,
    },

    card: {
      width: "100%",
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#1B1B1B",
      padding: 14,
      borderRadius: 18,
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

    avatarContainer: {
      position:
        "relative",
      width: 60,
      height: 60,
      marginRight: 14,
    },

    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor:
        "#333333",
    },

    statusDot: {
      position:
        "absolute",
      right: 0,
      bottom: 1,
      width: 15,
      height: 15,
      borderRadius: 8,
      borderWidth: 2,
      borderColor:
        "#1B1B1B",
    },

    onlineDot: {
      backgroundColor:
        "#4CAF50",
    },

    offlineDot: {
      backgroundColor:
        "#666666",
    },

    friendInfo: {
      flex: 1,
      minWidth: 0,
    },

    name: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
    },

    status: {
      fontSize: 13,
      fontWeight: "700",
      marginTop: 5,
    },

    onlineText: {
      color: "#4CAF50",
    },

    offlineText: {
      color: "#888888",
    },

    friendHint: {
      color: "#666666",
      fontSize: 12,
      marginTop: 5,
    },

    arrow: {
      color: "#FFC400",
      fontSize: 30,
      fontWeight: "300",
      marginLeft: 10,
    },

    emptyWrapper: {
      width: "100%",
      paddingTop: 40,
      alignItems: "center",
    },

    pressed: {
      opacity: 0.8,
    },
  });