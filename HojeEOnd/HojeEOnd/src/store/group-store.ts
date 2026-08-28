import { create } from "zustand";

import {
  addGroupMember,
  createGroup as createGroupRequest,
  deleteGroup as deleteGroupRequest,
  getGroupMembers,
  getGroups,
  removeGroupMember,
  type ApiGroup,
} from "@/services/api";

import type { Group } from "@/types/group";

interface GroupStore {
  groups: Group[];

  membersByGroup: Record<
    string,
    import("@/services/api").ApiGroupMember[]
  >;

  loading: boolean;

  processing: boolean;

  error: string | null;

  loadGroups: () => Promise<void>;

  loadGroupMembers: (
    groupId: string,
  ) => Promise<void>;

  createGroup: (
    name: string,
    venueId: string,
  ) => Promise<Group>;

  joinGroup: (
    groupId: string,
    userId: string,
  ) => Promise<void>;

  /*
   * Atualiza somente o estado local.
   *
   * Não chama a API.
   *
   * Usado quando o backend já realizou a operação,
   * como no aceite de convite.
   */
  syncGroupMember: (
    groupId: string,
    userId: string,
  ) => void;

  leaveGroup: (
    groupId: string,
    userId: string,
  ) => Promise<void>;

  deleteGroup: (
    groupId: string,
  ) => Promise<void>;

  clearError: () => void;
}

const normalizeGroup = (
  group: ApiGroup,
): Group => ({
  id: group.id,

  name: group.name,

  venueId: group.venueId,

  creatorId: group.creatorId,

  members:
    group.members?.map(
      (member) => member.userId,
    ) ?? [],
});

const messageFor = (
  error: unknown,
  fallback: string,
) =>
  error instanceof Error
    ? error.message
    : fallback;

export const useGroupStore =
  create<GroupStore>()(
    (set, get) => ({
      groups: [],

      membersByGroup: {},

      loading: false,

      processing: false,

      error: null,

      /*
       * =====================================================
       * LOAD GROUPS
       * =====================================================
       */
      loadGroups:
        async () => {
          set({
            loading: true,
            error: null,
          });

          try {
            const response =
              await getGroups();

            set({
              groups:
                response.map(
                  normalizeGroup,
                ),

              loading: false,

              error: null,
            });
          } catch (error) {
            set({
              loading: false,

              error: messageFor(
                error,
                "Não foi possível carregar os grupos.",
              ),
            });

            throw error;
          }
        },

      /*
       * =====================================================
       * LOAD GROUP MEMBERS
       * =====================================================
       */
      loadGroupMembers:
        async (
          groupId,
        ) => {
          try {
            const members =
              await getGroupMembers(
                groupId,
              );

            set((state) => ({
              membersByGroup: {
                ...state.membersByGroup,

                [groupId]:
                  members,
              },

              groups:
                state.groups.map(
                  (group) =>
                    group.id ===
                    groupId
                      ? {
                          ...group,

                          members:
                            members.map(
                              (
                                member,
                              ) =>
                                member.userId,
                            ),
                        }
                      : group,
                ),
            }));
          } catch (error) {
            set({
              error: messageFor(
                error,
                "Não foi possível carregar os membros do grupo.",
              ),
            });

            throw error;
          }
        },

      /*
       * =====================================================
       * CREATE GROUP
       * =====================================================
       */
      createGroup:
        async (
          name,
          venueId,
        ) => {
          if (
            get().processing
          ) {
            throw new Error(
              "Uma operação de grupo já está em andamento.",
            );
          }

          set({
            loading: true,

            processing: true,

            error: null,
          });

          try {
            const created =
              normalizeGroup(
                await createGroupRequest(
                  name,
                  venueId,
                ),
              );

            set((state) => ({
              groups:
                state.groups.some(
                  (group) =>
                    group.id ===
                    created.id,
                )
                  ? state.groups
                  : [
                      ...state.groups,
                      created,
                    ],

              loading: false,

              processing: false,

              error: null,
            }));

            return created;
          } catch (error) {
            set({
              loading: false,

              processing: false,

              error: messageFor(
                error,
                "Não foi possível criar o grupo.",
              ),
            });

            throw error;
          }
        },

      /*
       * =====================================================
       * JOIN GROUP
       * =====================================================
       *
       * Esta função continua fazendo POST.
       *
       * Ela é usada quando a própria aplicação
       * realmente deseja adicionar um membro.
       *
       * NÃO deve ser utilizada depois de
       * PATCH /invites/:id/accept porque o backend
       * já cria o GroupMember nesse fluxo.
       */
      joinGroup:
        async (
          groupId,
          userId,
        ) => {
          if (
            get().processing
          ) {
            return;
          }

          set({
            processing: true,

            error: null,
          });

          try {
            await addGroupMember(
              groupId,
              userId,
            );

            set((state) => ({
              processing: false,

              groups:
                state.groups.map(
                  (group) =>
                    group.id !==
                      groupId ||
                    group.members.includes(
                      userId,
                    )
                      ? group
                      : {
                          ...group,

                          members: [
                            ...group.members,
                            userId,
                          ],
                        },
                ),

              error: null,
            }));
          } catch (error) {
            set({
              processing: false,

              error: messageFor(
                error,
                "Não foi possível adicionar o membro.",
              ),
            });

            throw error;
          }
        },

      /*
       * =====================================================
       * SYNC GROUP MEMBER
       * =====================================================
       *
       * SOMENTE ESTADO LOCAL.
       *
       * Não executa nenhuma chamada HTTP.
       *
       * Serve para sincronizar o GroupStore quando
       * o backend já executou a operação.
       */
      syncGroupMember:
        (
          groupId,
          userId,
        ) => {
          set((state) => ({
            groups:
              state.groups.map(
                (group) =>
                  group.id !==
                    groupId ||
                  group.members.includes(
                    userId,
                  )
                    ? group
                    : {
                        ...group,

                        members: [
                          ...group.members,
                          userId,
                        ],
                      },
              ),
          }));
        },

      /*
       * =====================================================
       * LEAVE GROUP
       * =====================================================
       */
      leaveGroup:
        async (
          groupId,
          userId,
        ) => {
          if (
            get().processing
          ) {
            return;
          }

          set({
            processing: true,

            error: null,
          });

          try {
            await removeGroupMember(
              groupId,
              userId,
            );

            set((state) => ({
              processing: false,

              groups:
                state.groups.map(
                  (group) =>
                    group.id ===
                    groupId
                      ? {
                          ...group,

                          members:
                            group.members.filter(
                              (
                                id,
                              ) =>
                                id !==
                                userId,
                            ),
                        }
                      : group,
                ),

              error: null,
            }));
          } catch (error) {
            set({
              processing: false,

              error: messageFor(
                error,
                "Não foi possível remover o membro.",
              ),
            });

            throw error;
          }
        },

      /*
       * =====================================================
       * DELETE GROUP
       * =====================================================
       *
       * Exclusão autorizada pelo backend.
       */
      deleteGroup:
        async (groupId) => {
          if (get().processing) {
            return;
          }

          set({
            loading: true,
            processing: true,
            error: null,
          });

          try {
            await deleteGroupRequest(groupId);

            set((state) => {
              const {
                [groupId]: _removedMembers,
                ...remainingMembers
              } = state.membersByGroup;

              return {
                groups: state.groups.filter((group) => group.id !== groupId),
                membersByGroup: remainingMembers,
                loading: false,
                processing: false,
                error: null,
              };
            });
          } catch (error) {
            set({
              loading: false,
              processing: false,
              error: messageFor(
                error,
                "Não foi possível excluir o grupo.",
              ),
            });

            throw error;
          }
        },

      /*
       * =====================================================
       * CLEAR ERROR
       * =====================================================
       */
      clearError:
        () =>
          set({
            error: null,
          }),
    }),
  );
