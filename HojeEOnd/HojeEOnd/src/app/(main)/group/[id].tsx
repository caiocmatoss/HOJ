import { useEffect, useState } from "react";

import {
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

import { getFriends, getGroup, getGroupMembers, getVenue, type ApiFriend, type ApiUser, type ApiVenue } from "@/services/api";
import type { Group } from "@/types/group";


import { useGroupStore } from "@/store/group-store";
import { useInviteStore } from "@/store/invite-store";
import { useUserStore } from "@/store/user-store";
import { usePresenceStore } from "@/store/presence-store";

export default function GroupDetailsScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const groupId =
    Array.isArray(id)
      ? id[0]
      : id;

  const [
    confirmDelete,
    setConfirmDelete,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState<string | null>(null);

  const groups = useGroupStore(
    (state) => state.groups,
  );

  const joinGroup = useGroupStore(
    (state) => state.joinGroup,
  );

  const leaveGroup = useGroupStore(
    (state) => state.leaveGroup,
  );

  const deleteGroup = useGroupStore(
    (state) => state.deleteGroup,
  );

  const groupProcessing = useGroupStore(
    (state) => state.processing,
  );

  const invites = useInviteStore(
    (state) => state.invites,
  );

  const sendInvite = useInviteStore(
    (state) => state.sendInvite,
  );

  const user = useUserStore(
    (state) => state.user,
  );

  const [realMembers, setRealMembers] = useState<import("@/services/api").ApiGroupMember[]>([]);
  const [realFriends, setRealFriends] = useState<ApiFriend[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const presenceStatuses = usePresenceStore((state) => state.statuses);

  useEffect(() => {
    if (!groupId) return;
    setMembersLoading(true);
    void getGroupMembers(groupId).then(setRealMembers).catch((error: unknown) => setMembersError(error instanceof Error ? error.message : "Não foi possível carregar os membros.")).finally(() => setMembersLoading(false));
    void getFriends().then(setRealFriends).catch(() => setRealFriends([]));
  }, [groupId]);

  const [remoteGroup, setRemoteGroup] = useState<Group | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  const storeGroup = groups.find((item) => item.id === groupId);
  const loadRemoteGroup = () => {
    if (!groupId || storeGroup) return;
    setGroupLoading(true);
    setGroupError(null);
    void getGroup(groupId)
      .then((response) => setRemoteGroup({ id: response.id, name: response.name, venueId: response.venueId, creatorId: response.creatorId, members: response.members?.map((member) => member.userId) ?? [] }))
      .catch((error: unknown) => setGroupError(error instanceof Error ? error.message : "Não foi possível carregar o grupo."))
      .finally(() => setGroupLoading(false));
  };
  useEffect(() => { loadRemoteGroup(); }, [groupId, storeGroup]);
  const [venue, setVenue] = useState<ApiVenue | null>(null);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueError, setVenueError] = useState<string | null>(null);
  const groupForVenue = groups.find((item) => item.id === groupId);

  useEffect(() => {
    if (!groupForVenue?.venueId) {
      setVenue(null);
      return;
    }
    let cancelled = false;
    setVenueLoading(true);
    setVenueError(null);
    getVenue(groupForVenue.venueId)
      .then((response) => { if (!cancelled) setVenue(response); })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setVenue(null);
          setVenueError(requestError instanceof Error ? requestError.message : "Não foi possível carregar o local.");
        }
      })
      .finally(() => { if (!cancelled) setVenueLoading(false); });
    return () => { cancelled = true; };
  }, [groupForVenue?.venueId]);
  const handleBackToGroups = () => {
    router.replace(
      "/(main)/groups",
    );
  };

  if (!groupId) {
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
              👥
            </Text>

            <Text
              style={
                styles.errorTitle
              }
            >
              Grupo não encontrado
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              Não foi possível identificar
              este grupo.
            </Text>

            <Pressable
              onPress={
                handleBackToGroups
              }
              style={({ pressed }) => [
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
                Voltar para grupos
              </Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const group = groups.find((item) => item.id === groupId) ?? remoteGroup;

  if (!group) {
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
              👥
            </Text>

            <Text
              style={
                styles.errorTitle
              }
            >
              Grupo não encontrado
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              Este grupo pode ter sido
              removido ou não está mais
              disponível.
            </Text>

            <Pressable
              onPress={
                handleBackToGroups
              }
              style={({ pressed }) => [
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
                Voltar para grupos
              </Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }



  const groupMembers = realMembers.map((member) => member.user).filter((member): member is ApiUser => Boolean(member));

  const currentUserIsMember =
    user
      ? group.members.includes(
          user.id,
        )
      : false;

  const canDeleteGroup =
    user?.id === group.creatorId;

  const availableFriends = realFriends.filter((friend) => {
      const alreadyMember =
        group.members.includes(
          friend.id,
        );

      const pendingInvite =
        invites.some(
          (invite) =>
            invite.groupId ===
              group.id &&
            invite.toUserId ===
              friend.id &&
            invite.status ===
              "pending",
        );

      const isCurrentUser =
        user?.id === friend.id;

      return (
        !alreadyMember &&
        !pendingInvite &&
        !isCurrentUser
      );
    });

  const handleInvite = (
    friendId: string,
  ) => {
    if (!user) {
      return;
    }

    const existingInvite =
      invites.find(
        (invite) =>
          invite.groupId ===
            group.id &&
          invite.toUserId ===
            friendId &&
          invite.status ===
            "pending",
      );

    if (existingInvite) {
      return;
    }

    sendInvite({
      id: `invite-${Date.now()}-${friendId}`,
      groupId: group.id,
      fromUserId: user.id,
      toUserId: friendId,
      status: "pending",
    });
  };

  const handleJoinGroup = () => {
    if (!user) {
      return;
    }

    joinGroup(
      group.id,
      user.id,
    );

    setConfirmDelete(false);
  };

  const handleLeaveGroup = () => {
    if (!user) {
      return;
    }

    leaveGroup(
      group.id,
      user.id,
    );
  };

  const handleOpenChat = () => {
    router.push({
      pathname:
        "/(main)/group/chat/[id]",

      params: {
        id: group.id,
      },
    });
  };

  const handleDeleteGroup = async () => {
    if (groupProcessing) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteGroup(group.id);

      router.replace(
        "/(main)/groups",
      );
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o grupo.",
      );
    }
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
        maxWidth={800}
      >
        <View style={styles.content}>
          <Pressable
            onPress={
              handleBackToGroups
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

          <View style={styles.heroCard}>
            <View
              style={
                styles.groupIconContainer
              }
            >
              <Text
                style={
                  styles.groupIcon
                }
              >
                👥
              </Text>
            </View>

            <Text style={styles.title}>
              {group.name}
            </Text>

            {venue && (
              <Text
                style={
                  styles.venue
                }
              >
                📍 {venue.name}
              </Text>
            )}

            <Text
              style={
                styles.memberCount
              }
            >
              {group.members.length}{" "}
              {group.members.length ===
              1
                ? "membro"
                : "membros"}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Sobre o grupo
            </Text>

            <Text
              style={
                styles.infoText
              }
            >
              Grupo criado para organizar
              saídas, eventos e momentos
              com amigos.
            </Text>

            {venue && (
              <View
                style={
                  styles.locationContainer
                }
              >
                <Text
                  style={
                    styles.infoLabel
                  }
                >
                  Local
                </Text>

                <Text
                  style={
                    styles.infoValue
                  }
                >
                  {venue.name}
                </Text>

                <Text
                  style={
                    styles.distance
                  }
                >
                  {venue.distance}
                </Text>
              </View>
            )}
          </View>

          <View
            style={
              styles.membersCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Membros
            </Text>

            {membersLoading ? (
              <Text style={styles.emptyText}>Carregando membros...</Text>
            ) : membersError ? (
              <Text style={styles.errorText}>{membersError}</Text>
            ) : groupMembers.length === 0 ? (
              <Text
                style={
                  styles.emptyText
                }
              >
                Nenhum membro encontrado.
              </Text>
            ) : (
              groupMembers.map(
                (member) => (
                  <Pressable
                    key={member.id}
                    onPress={() =>
                      router.push({
                        pathname:
                          "/(main)/friend/[id]",
                        params: {
                          id: member.id,
                        },
                      })
                    }
                    style={({ pressed }) => [
                      styles.memberRow,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <View
                      style={
                        styles.memberAvatar
                      }
                    >
                      <Text
                        style={
                          styles.memberAvatarText
                        }
                      >
                        {member.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.memberInfo
                      }
                    >
                      <Text
                        style={
                          styles.memberName
                        }
                      >
                        {member.name}
                      </Text>

                      <Text
                        style={[
                          styles.memberStatus,

                          (presenceStatuses[member.id] ?? member.status) === "ONLINE"
                            ? styles.online
                            : styles.offline,
                        ]}
                      >
                        {(presenceStatuses[member.id] ?? member.status) === "ONLINE"
                          ? "Online"
                          : "Offline"}
                      </Text>
                    </View>

                    <Text
                      style={
                        styles.memberArrow
                      }
                    >
                      ›
                    </Text>
                  </Pressable>
                ),
              )
            )}
          </View>

          <View
            style={
              styles.inviteCard
            }
          >
            <View
              style={
                styles.inviteHeader
              }
            >
              <View
                style={
                  styles.inviteHeaderText
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Convidar amigos
                </Text>

                <Text
                  style={
                    styles.inviteSubtitle
                  }
                >
                  Envie convites para
                  entrar neste grupo.
                </Text>
              </View>

              <Text
                style={
                  styles.inviteIcon
                }
              >
                ✉️
              </Text>
            </View>

            {availableFriends.length ===
            0 ? (
              <Text
                style={
                  styles.emptyText
                }
              >
                Todos os seus amigos já
                são membros ou possuem
                convite pendente.
              </Text>
            ) : (
              availableFriends.map(
                (friend) => (
                  <View
                    key={friend.id}
                    style={
                      styles.friendInviteRow
                    }
                  >
                    <View
                      style={
                        styles.friendAvatar
                      }
                    >
                      <Text
                        style={
                          styles.friendAvatarText
                        }
                      >
                        {friend.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.friendInviteInfo
                      }
                    >
                      <Text
                        style={
                          styles.friendName
                        }
                        numberOfLines={1}
                      >
                        {friend.name}
                      </Text>

                      <Text
                        style={[
                          styles.friendStatus,

                          (presenceStatuses[friend.id] ?? friend.status) === "ONLINE"
                            ? styles.online
                            : styles.offline,
                        ]}
                      >
                        {(presenceStatuses[friend.id] ?? friend.status) === "ONLINE"
                          ? "Online"
                          : "Offline"}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        handleInvite(
                          friend.id,
                        )
                      }
                      style={({ pressed }) => [
                        styles.inviteButton,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.inviteButtonText
                        }
                      >
                        Convidar
                      </Text>
                    </Pressable>
                  </View>
                ),
              )
            )}
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
                styles.primaryButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                💬 Abrir chat
              </Text>
            </Pressable>

            {currentUserIsMember ? (
              <Pressable
                onPress={
                  handleLeaveGroup
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
                  Sair do grupo
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={
                  handleJoinGroup
                }
                style={({ pressed }) => [
                  styles.joinButton,
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={
                    styles.joinButtonText
                  }
                >
                  Entrar no grupo
                </Text>
              </Pressable>
            )}

            {canDeleteGroup &&
              !confirmDelete && (
                <Pressable
                  onPress={() =>
                    setConfirmDelete(
                      true,
                    )
                  }
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <Text
                    style={
                      styles.deleteButtonText
                    }
                  >
                    🗑️ Excluir grupo
                  </Text>
                </Pressable>
              )}

            {canDeleteGroup &&
              confirmDelete && (
                <View
                  style={
                    styles.deleteConfirmCard
                  }
                >
                  <Text
                    style={
                      styles.deleteConfirmTitle
                    }
                  >
                    Excluir este grupo?
                  </Text>

                  <Text
                    style={
                      styles.deleteConfirmText
                    }
                  >
                    O grupo "{group.name}"
                    será removido desta
                    sessão.
                  </Text>

                  {deleteError && (
                    <Text style={styles.errorText}>
                      {deleteError}
                    </Text>
                  )}

                  <View
                    style={
                      styles.deleteConfirmActions
                    }
                  >
                    <Pressable
                      onPress={() =>
                        setConfirmDelete(
                          false,
                        )
                      }
                      style={({ pressed }) => [
                        styles.cancelDeleteButton,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.cancelDeleteText
                        }
                      >
                        Cancelar
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={
                        handleDeleteGroup
                      }
                      disabled={groupProcessing}
                      style={({ pressed }) => [
                        styles.confirmDeleteButton,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <Text
                        style={
                          styles.confirmDeleteText
                        }
                      >
                        {groupProcessing
                          ? "Excluindo..."
                          : "Excluir"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
          </View>

          <Pressable
            onPress={
              handleBackToGroups
            }
            style={({ pressed }) => [
              styles.bottomBackButton,
              pressed &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.bottomBackButtonText
              }
            >
              Voltar para grupos
            </Text>
          </Pressable>
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
    marginBottom: 14,
  },

  topBackButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  heroCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  groupIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#2A2300",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  groupIcon: {
    fontSize: 42,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  venue: {
    color: "#FFC400",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },

  memberCount: {
    color: "#888888",
    fontSize: 13,
    marginTop: 6,
  },

  infoCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  membersCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  inviteCard: {
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

  infoText: {
    color: "#CCCCCC",
    fontSize: 14,
    lineHeight: 21,
  },

  locationContainer: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#292929",
  },

  infoLabel: {
    color: "#FFC400",
    fontSize: 13,
    fontWeight: "800",
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },

  distance: {
    color: "#888888",
    fontSize: 12,
    marginTop: 3,
  },

  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  memberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFC400",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  memberAvatarText: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "800",
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  memberStatus: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  online: {
    color: "#4CAF50",
  },

  offline: {
    color: "#888888",
  },

  memberArrow: {
    color: "#FFC400",
    fontSize: 28,
    marginLeft: 8,
  },

  inviteHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  inviteHeaderText: {
    flex: 1,
  },

  inviteSubtitle: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 19,
    marginTop: -6,
    marginBottom: 14,
  },

  inviteIcon: {
    fontSize: 28,
  },

  friendInviteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#262626",
  },

  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFC400",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  friendAvatarText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "800",
  },

  friendInviteInfo: {
    flex: 1,
    minWidth: 0,
  },

  friendName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  friendStatus: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  inviteButton: {
    backgroundColor: "#FFC400",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginLeft: 10,
  },

  inviteButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "800",
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
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
    backgroundColor: "#351414",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#FF6B6B",
    fontSize: 15,
    fontWeight: "800",
  },

  joinButton: {
    backgroundColor: "#17351D",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  joinButtonText: {
    color: "#4CAF50",
    fontSize: 15,
    fontWeight: "800",
  },

  deleteButton: {
    backgroundColor: "#2A0F0F",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#6B1F1F",
  },

  deleteButtonText: {
    color: "#FF5555",
    fontSize: 15,
    fontWeight: "800",
  },

  deleteConfirmCard: {
    backgroundColor: "#2A0F0F",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#6B1F1F",
  },

  deleteConfirmTitle: {
    color: "#FF5555",
    fontSize: 16,
    fontWeight: "800",
  },

  deleteConfirmText: {
    color: "#CCCCCC",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  deleteConfirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  cancelDeleteButton: {
    flex: 1,
    backgroundColor: "#151515",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
  },

  cancelDeleteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#D32F2F",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  bottomBackButton: {
    backgroundColor: "#151515",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333333",
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 18,
  },

  bottomBackButtonText: {
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
    fontSize: 20,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center",
  },

  errorText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  backButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 20,
  },

  backButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});
