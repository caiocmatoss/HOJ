import { create } from "zustand";

import {
  acceptInvite as acceptInviteRequest,
  getInvites,
  getSentInvites,
  rejectInvite as rejectInviteRequest,
  sendGroupInvite,
  type ApiAcceptInviteResponse,
  type ApiInvite,
} from "@/services/api";

import type { Invite } from "@/types/invite";

import { useGroupStore } from "@/store/group-store";

interface InviteStore {
  invites: Invite[];

  sentInvites: Invite[];

  loading: boolean;

  processingInviteIds: string[];

  error: string | null;

  loadInvites: () => Promise<void>;

  loadSentInvites: () => Promise<void>;

  sendInvite: (
    invite: Invite,
  ) => Promise<void>;

  acceptInvite: (
    inviteId: string,
  ) => Promise<void>;

  rejectInvite: (
    inviteId: string,
  ) => Promise<void>;

  clearError: () => void;
}

function normalizeInvite(
  backendInvite: ApiInvite,
): Invite {
  return {
    id: backendInvite.id,

    groupId: backendInvite.groupId,

    fromUserId:
      backendInvite.senderId,

    toUserId:
      backendInvite.receiverId,

    status:
      backendInvite.status === "PENDING"
        ? "pending"
        : backendInvite.status === "ACCEPTED"
          ? "accepted"
          : "rejected",

    createdAt:
      backendInvite.createdAt,

    respondedAt:
      backendInvite.respondedAt ?? null,

    group:
      backendInvite.group
        ? {
            id:
              backendInvite.group.id,

            name:
              backendInvite.group.name,

            venueId:
              backendInvite.group.venueId,
          }
        : undefined,

    sender:
      backendInvite.sender
        ? {
            id:
              backendInvite.sender.id,

            name:
              backendInvite.sender.name,

            email:
              backendInvite.sender.email,

            avatar:
              backendInvite.sender.avatar ??
              null,

            status:
              backendInvite.sender.status ??
              "OFFLINE",
          }
        : undefined,

    receiver:
      backendInvite.receiver
        ? {
            id:
              backendInvite.receiver.id,

            name:
              backendInvite.receiver.name,

            email:
              backendInvite.receiver.email,

            avatar:
              backendInvite.receiver.avatar ??
              null,

            status:
              backendInvite.receiver.status ??
              "OFFLINE",
          }
        : undefined,
  };
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error
    ? error.message
    : fallback;
}

function isProcessing(
  processingInviteIds: string[],
  inviteId: string,
): boolean {
  return processingInviteIds.includes(
    inviteId,
  );
}

function addProcessingInvite(
  processingInviteIds: string[],
  inviteId: string,
): string[] {
  if (
    processingInviteIds.includes(
      inviteId,
    )
  ) {
    return processingInviteIds;
  }

  return [
    ...processingInviteIds,
    inviteId,
  ];
}

function removeProcessingInvite(
  processingInviteIds: string[],
  inviteId: string,
): string[] {
  return processingInviteIds.filter(
    (id) => id !== inviteId,
  );
}

export const useInviteStore =
  create<InviteStore>()(
    (set, get) => ({
      /*
       * O backend é a única fonte de verdade
       * para convites.
       *
       * Não existe mais estado inicial vindo
       * de src/data/invites.ts.
       */
      invites: [],

      sentInvites: [],

      loading: false,

      processingInviteIds: [],

      error: null,

      /*
       * =====================================================
       * LOAD INVITES
       * =====================================================
       *
       * GET /invites
       */
      loadInvites:
        async () => {
          try {
            set({
              loading: true,
              error: null,
            });

            const response =
              await getInvites();

            const normalizedInvites =
              response.map(
                normalizeInvite,
              );

            set({
              invites:
                normalizedInvites,

              loading: false,

              error: null,
            });
          } catch (error) {
            console.error(
              "[Invites] Erro ao carregar convites:",
              error,
            );

            set({
              loading: false,

              error:
                getErrorMessage(
                  error,
                  "Não foi possível carregar os convites.",
                ),
            });

            throw error;
          }
        },

      loadSentInvites:
        async () => {
          try {
            set({
              loading: true,
              error: null,
            });

            const response = await getSentInvites();
            const normalizedInvites = response.map(normalizeInvite);

            set({
              sentInvites: normalizedInvites,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error(
              "[Invites] Erro ao carregar convites enviados:",
              error,
            );

            set({
              loading: false,
              error: getErrorMessage(
                error,
                "Não foi possível carregar os convites enviados.",
              ),
            });

            throw error;
          }
        },

      /*
       * =====================================================
       * SEND INVITE
       * =====================================================
       *
       * POST /groups/:groupId/invites
       */
      sendInvite:
        async (
          invite,
        ) => {
          if (
            isProcessing(
              get()
                .processingInviteIds,
              invite.id,
            )
          ) {
            return;
          }

          try {
            set((state) => ({
              error: null,

              processingInviteIds:
                addProcessingInvite(
                  state.processingInviteIds,
                  invite.id,
                ),
            }));

            const response =
              await sendGroupInvite(invite.groupId, invite.toUserId);

            const normalizedInvite =
              normalizeInvite(
                response,
              );

            set((state) => {
              const sentAlreadyExists = state.sentInvites.some(
                (item) => item.id === normalizedInvite.id,
              );

              return {
                sentInvites: sentAlreadyExists
                  ? state.sentInvites
                  : [...state.sentInvites, normalizedInvite],

                processingInviteIds:
                  removeProcessingInvite(
                    state.processingInviteIds,
                    invite.id,
                  ),

                error: null,
              };
            });
          } catch (error) {
            console.error(
              "[Invites] Erro ao enviar convite:",
              error,
            );

            set((state) => ({
              processingInviteIds:
                removeProcessingInvite(
                  state.processingInviteIds,
                  invite.id,
                ),

              error:
                getErrorMessage(
                  error,
                  "Não foi possível enviar o convite.",
                ),
            }));

            throw error;
          }
        },

      /*
       * =====================================================
       * ACCEPT INVITE
       * =====================================================
       *
       * PATCH /invites/:id/accept
       *
       * O backend já:
       *
       * 1. altera o convite para ACCEPTED;
       * 2. cria o GroupMember;
       * 3. pode disparar a notificação correspondente.
       *
       * Portanto NÃO devemos chamar
       * POST /groups/:id/members novamente.
       */
      acceptInvite:
        async (
          inviteId,
        ) => {
          if (
            isProcessing(
              get()
                .processingInviteIds,
              inviteId,
            )
          ) {
            return;
          }

          try {
            set((state) => ({
              loading: true,

              error: null,

              processingInviteIds:
                addProcessingInvite(
                  state.processingInviteIds,
                  inviteId,
                ),
            }));

            const response =
              await acceptInviteRequest(inviteId);

            const normalizedInvite =
              normalizeInvite(
                response.invite,
              );

            /*
             * Primeiro atualizamos o convite localmente.
             */
            set((state) => ({
              invites:
                state.invites.map(
                  (invite) =>
                    invite.id ===
                    inviteId
                      ? normalizedInvite
                      : invite,
                ),

              processingInviteIds:
                removeProcessingInvite(
                  state.processingInviteIds,
                  inviteId,
                ),

              loading: false,

              error: null,
            }));

            /*
             * O backend já criou o GroupMember.
             *
             * Apenas sincronizamos o estado local
             * do GroupStore.
             *
             * NÃO chamamos addGroupMember().
             */
            if (
              response.member?.groupId &&
              response.member?.userId
            ) {
              useGroupStore
                .getState()
                .syncGroupMember(
                  response.member.groupId,
                  response.member.userId,
                );
            }

            /*
             * Fazemos uma nova leitura dos grupos
             * para garantir consistência com o backend.
             *
             * Isso também faz o grupo aparecer imediatamente
             * em groups.tsx mesmo que ele ainda não estivesse
             * carregado anteriormente no GroupStore.
             */
            try {
              await useGroupStore
                .getState()
                .loadGroups();
            } catch (groupError) {
              console.error(
                "[Invites] Grupo aceito, mas não foi possível sincronizar a lista de grupos:",
                groupError,
              );

              /*
               * O aceite do convite já foi concluído
               * com sucesso. O erro da sincronização
               * não deve desfazer o aceite.
               */
            }
          } catch (error) {
            console.error(
              "[Invites] Erro ao aceitar convite:",
              error,
            );

            set((state) => ({
              loading: false,

              processingInviteIds:
                removeProcessingInvite(
                  state.processingInviteIds,
                  inviteId,
                ),

              error:
                getErrorMessage(
                  error,
                  "Não foi possível aceitar o convite.",
                ),
            }));

            throw error;
          }
        },

      /*
       * =====================================================
       * REJECT INVITE
       * =====================================================
       *
       * PATCH /invites/:id/reject
       */
      rejectInvite:
        async (
          inviteId,
        ) => {
          if (
            isProcessing(
              get()
                .processingInviteIds,
              inviteId,
            )
          ) {
            return;
          }

          try {
            set((state) => ({
              loading: true,

              error: null,

              processingInviteIds:
                addProcessingInvite(
                  state.processingInviteIds,
                  inviteId,
                ),
            }));

            const response =
              await rejectInviteRequest(inviteId);

            const normalizedInvite =
              normalizeInvite(
                response,
              );

            set((state) => ({
              invites:
                state.invites.map(
                  (invite) =>
                    invite.id ===
                    inviteId
                      ? normalizedInvite
                      : invite,
                ),

              loading: false,

              processingInviteIds:
                removeProcessingInvite(
                  state.processingInviteIds,
                  inviteId,
                ),

              error: null,
            }));
          } catch (error) {
            console.error(
              "[Invites] Erro ao rejeitar convite:",
              error,
            );

            set((state) => ({
              loading: false,

              processingInviteIds:
                removeProcessingInvite(
                  state.processingInviteIds,
                  inviteId,
                ),

              error:
                getErrorMessage(
                  error,
                  "Não foi possível rejeitar o convite.",
                ),
            }));

            throw error;
          }
        },

      clearError:
        () =>
          set({
            error: null,
          }),
    }),
  );
