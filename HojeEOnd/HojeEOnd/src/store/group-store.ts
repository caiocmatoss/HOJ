import { create } from "zustand";

import {
  groups as initialGroups,
  type Group,
} from "@/data/groups";

interface GroupStore {
  groups: Group[];

  createGroup: (group: Group) => void;

  joinGroup: (
    groupId: string,
    userId: string,
  ) => void;

  leaveGroup: (
    groupId: string,
    userId: string,
  ) => void;
}

export const useGroupStore =
  create<GroupStore>((set) => ({
    groups: initialGroups,

    createGroup: (group) =>
      set((state) => ({
        groups: [
          ...state.groups,
          group,
        ],
      })),

    joinGroup: (groupId, userId) =>
      set((state) => ({
        groups: state.groups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          if (group.members.includes(userId)) {
            return group;
          }

          return {
            ...group,
            members: [
              ...group.members,
              userId,
            ],
          };
        }),
      })),

    leaveGroup: (groupId, userId) =>
      set((state) => ({
        groups: state.groups.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          return {
            ...group,
            members: group.members.filter(
              (id) => id !== userId,
            ),
          };
        }),
      })),
  }));