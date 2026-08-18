import { create } from "zustand";

import {
  invites as initialInvites,
  type Invite,
} from "@/data/invites";

import { useGroupStore } from "@/store/group-store";

interface InviteStore {
  invites: Invite[];

  sendInvite: (invite: Invite) => void;

  acceptInvite: (inviteId: string) => void;

  rejectInvite: (inviteId: string) => void;
}

export const useInviteStore =
  create<InviteStore>((set) => ({
    invites: initialInvites,

    sendInvite: (invite) =>
      set((state) => ({
        invites: [
          ...state.invites,
          invite,
        ],
      })),

    acceptInvite: (inviteId) => {
      let acceptedInvite: Invite | undefined;

      set((state) => ({
        invites: state.invites.map((invite) => {
          if (invite.id !== inviteId) {
            return invite;
          }

          acceptedInvite = invite;

          return {
            ...invite,
            status: "accepted",
          };
        }),
      }));

      if (acceptedInvite) {
        useGroupStore
          .getState()
          .joinGroup(
            acceptedInvite.groupId,
            acceptedInvite.toUserId,
          );
      }
    },

    rejectInvite: (inviteId) =>
      set((state) => ({
        invites: state.invites.map((invite) =>
          invite.id === inviteId
            ? {
                ...invite,
                status: "rejected",
              }
            : invite,
        ),
      })),
  }));