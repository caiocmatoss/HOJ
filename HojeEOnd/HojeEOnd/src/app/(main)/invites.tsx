import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { EmptyState } from "@/components/ui/EmptyState";

import { useGroupStore } from "@/store/group-store";
import { useInviteStore } from "@/store/invite-store";
import { useUserStore } from "@/store/user-store";

export default function InvitesScreen() {
  const user = useUserStore(
    (state) => state.user,
  );

  const groups = useGroupStore(
    (state) => state.groups,
  );

  const allInvites = useInviteStore(
    (state) => state.invites,
  );

  const sentInvites = useInviteStore(
    (state) => state.sentInvites,
  );

  const loading = useInviteStore(
    (state) => state.loading,
  );

  const error = useInviteStore(
    (state) => state.error,
  );

  const loadInvites = useInviteStore(
    (state) => state.loadInvites,
  );

  const loadSentInvites = useInviteStore(
    (state) => state.loadSentInvites,
  );

  const acceptInvite = useInviteStore(
    (state) => state.acceptInvite,
  );

  const rejectInvite = useInviteStore(
    (state) => state.rejectInvite,
  );

  const [processingInviteId, setProcessingInviteId] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  /*
   * Carrega os convites reais do backend
   * sempre que a tela for aberta.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    void (async () => {
      try {
        await loadInvites();
        await loadSentInvites();
      } catch {
        // O erro já é refletido pelo store e exibido pela tela.
      }
    })();
  }, [
    user,
    loadInvites,
    loadSentInvites,
  ]);

  /*
   * Somente convites pendentes destinados
   * ao usuário atualmente autenticado.
   */
  const pendingInvites = useMemo(() => {
    if (!user) {
      return [];
    }

    return allInvites.filter(
      (invite) =>
        invite.status === "pending" &&
        invite.toUserId === user.id,
    );
  }, [
    allInvites,
    user,
  ]);

  /*
   * Procura o grupo no GroupStore.
   *
   * O nome oficial do grupo vem do próprio
   * convite retornado pelo backend.
   *
   * O GroupStore é utilizado apenas para
   * obter informações adicionais, como
   * quantidade de membros.
   */
  const getGroupFromStore = useCallback(
    (groupId: string) => {
      return groups.find(
        (group) =>
          group.id === groupId,
      );
    },
    [groups],
  );

  const handleBackToGroups = () => {
    router.replace(
      "/(main)/groups",
    );
  };

  const handleAccept = async (
    inviteId: string,
  ) => {
    if (processingInviteId) {
      return;
    }

    try {
      setProcessingInviteId(
        inviteId,
      );

      setActionError(null);

      await acceptInvite(
        inviteId,
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível aceitar o convite.",
      );
    } finally {
      setProcessingInviteId(
        null,
      );
    }
  };

  const handleReject = async (
    inviteId: string,
  ) => {
    if (processingInviteId) {
      return;
    }

    try {
      setProcessingInviteId(
        inviteId,
      );

      setActionError(null);

      await rejectInvite(
        inviteId,
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível recusar o convite.",
      );
    } finally {
      setProcessingInviteId(
        null,
      );
    }
  };

  /*
   * Usuário não autenticado.
   */
  if (!user) {
    return (
      <View
        style={styles.container}
      >
        <EmptyState
          icon="⚠️"
          title="Sessão não encontrada"
          message="Faça login novamente para visualizar seus convites."
          actionLabel="Voltar"
          onAction={
            handleBackToGroups
          }
        />
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <View
        style={styles.header}
      >
        <Pressable
          onPress={
            handleBackToGroups
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
            ← Voltar
          </Text>
        </Pressable>

        <Text
          style={styles.title}
        >
          Convites
        </Text>

        <Text
          style={styles.subtitle}
        >
          {loading
            ? "Carregando convites..."
            : pendingInvites.length ===
                0
              ? "Nenhum convite pendente"
              : `${pendingInvites.length} ${
                  pendingInvites.length ===
                  1
                    ? "convite pendente"
                    : "convites pendentes"
                }`}
        </Text>
      </View>

      {(error ||
        actionError) && (
        <View
          style={
            styles.errorBanner
          }
        >
          <Text
            style={
              styles.errorBannerText
            }
          >
            {actionError ??
              error}
          </Text>

          <Pressable
            onPress={() => {
              setActionError(
                null,
              );

              void loadInvites();
              void loadSentInvites();
            }}
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
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      )}

      {loading &&
      allInvites.length ===
        0 ? (
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
            Carregando seus
            convites...
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingInvites}
          keyExtractor={(item) =>
            item.id
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            pendingInvites.length >
            0
              ? styles.listContent
              : styles.emptyListContent
          }
          renderItem={({
            item,
          }) => {
            /*
             * Dados do remetente vêm
             * diretamente do backend.
             */
            const senderName =
              item.sender?.name ??
              "Alguém";

            /*
             * Dados do grupo vêm
             * diretamente do backend.
             */
            const groupName =
              item.group?.name ??
              "Grupo";

            /*
             * Informações adicionais
             * do grupo podem estar
             * disponíveis no GroupStore.
             */
            const group =
              getGroupFromStore(
                item.groupId,
              );

            const memberCount =
              group?.members
                ?.length ?? 0;

            const isProcessing =
              processingInviteId ===
              item.id;

            return (
              <View
                style={styles.card}
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
                      styles.cardTitle
                    }
                  >
                    {senderName}
                  </Text>

                  <Text
                    style={
                      styles.message
                    }
                  >
                    convidou você
                    para o grupo
                  </Text>

                  <Text
                    style={
                      styles.groupName
                    }
                  >
                    {groupName}
                  </Text>

                  {group ? (
                    <Text
                      style={
                        styles.groupMeta
                      }
                    >
                      {memberCount}{" "}
                      {memberCount ===
                      1
                        ? "membro"
                        : "membros"}
                    </Text>
                  ) : (
                    <Text
                      style={
                        styles.groupUnavailable
                      }
                    >
                      Grupo recebido do
                      servidor.
                    </Text>
                  )}

                  <View
                    style={
                      styles.actionRow
                    }
                  >
                    <Pressable
                      disabled={
                        isProcessing ||
                        loading
                      }
                      onPress={() =>
                        void handleAccept(
                          item.id,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.acceptButton,

                        (isProcessing ||
                          loading) &&
                          styles.disabledButton,

                        pressed &&
                          !isProcessing &&
                          !loading &&
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
                            styles.acceptText
                          }
                        >
                          Aceitar
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      disabled={
                        isProcessing ||
                        loading
                      }
                      onPress={() =>
                        void handleReject(
                          item.id,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.rejectButton,

                        (isProcessing ||
                          loading) &&
                          styles.disabledButton,

                        pressed &&
                          !isProcessing &&
                          !loading &&
                          styles.pressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.rejectText
                        }
                      >
                        Recusar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="✉️"
              title="Nenhum convite"
              message="Quando alguém convidar você para um grupo, o convite aparecerá aqui."
              actionLabel="Voltar para grupos"
              onAction={
                handleBackToGroups
              }
            />
          }
          ListFooterComponent={
            <View style={styles.sentSection}>
              <Text style={styles.sentSectionTitle}>
                Convites enviados
              </Text>

              {sentInvites.length === 0 ? (
                <Text style={styles.sentEmptyText}>
                  Nenhum convite enviado.
                </Text>
              ) : (
                sentInvites.map((invite) => {
                  const statusLabel =
                    invite.status === "pending"
                      ? "Pendente"
                      : invite.status === "accepted"
                        ? "Aceito"
                        : "Recusado";

                  return (
                    <View key={invite.id} style={styles.sentCard}>
                      <Text style={styles.sentGroupName}>
                        {invite.group?.name ?? "Grupo"}
                      </Text>
                      <Text style={styles.sentRecipient}>
                        Para: {invite.receiver?.name ?? "Usuário"}
                      </Text>
                      <Text style={styles.sentStatus}>
                        Status: {statusLabel}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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

  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#2A0F0F",
    borderWidth: 1,
    borderColor: "#6B1F1F",
  },

  errorBannerText: {
    color: "#FF6B6B",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FFC400",
  },

  retryButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "800",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 12,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },

  emptyListContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  sentSection: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  sentSectionTitle: {
    color: "#FFC400",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },

  sentEmptyText: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 12,
  },

  sentCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#292929",
  },

  sentGroupName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  sentRecipient: {
    color: "#AAAAAA",
    fontSize: 13,
    marginTop: 5,
  },

  sentStatus: {
    color: "#FFC400",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#292929",
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  icon: {
    fontSize: 25,
  },

  cardContent: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  message: {
    color: "#999999",
    fontSize: 13,
    marginTop: 3,
    lineHeight: 19,
  },

  groupName: {
    color: "#FFC400",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },

  groupMeta: {
    color: "#AAAAAA",
    fontSize: 12,
    marginTop: 5,
  },

  groupUnavailable: {
    color: "#FFB74D",
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  acceptButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: "#FFC400",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  acceptText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "800",
  },

  rejectButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: "#151515",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },

  rejectText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.45,
  },

  pressed: {
    opacity: 0.8,
  },
});
