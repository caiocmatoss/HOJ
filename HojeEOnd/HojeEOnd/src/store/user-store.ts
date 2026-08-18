import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type { User } from "@/data/users";

interface UserStore {
  user: User;

  updateName: (
    name: string,
  ) => void;

  updateAvatar: (
    avatar: string,
  ) => void;

  updateStatus: (
    status:
      | "online"
      | "offline",
  ) => void;

  updateBio: (
    bio: string,
  ) => void;
}

export const useUserStore =
  create<UserStore>()(
    persist(
      (set) => ({
        user: {
          id: "1",

          name:
            "Caio",

          avatar:
            "https://i.pravatar.cc/150?img=12",

          status:
            "online",

          bio:
            "Procurando rolê hoje 🎧",
        },

        updateName: (
          name,
        ) =>
          set((state) => ({
            user: {
              ...state.user,
              name,
            },
          })),

        updateAvatar: (
          avatar,
        ) =>
          set((state) => ({
            user: {
              ...state.user,
              avatar,
            },
          })),

        updateStatus: (
          status,
        ) =>
          set((state) => ({
            user: {
              ...state.user,
              status,
            },
          })),

        updateBio: (
          bio,
        ) =>
          set((state) => ({
            user: {
              ...state.user,
              bio,
            },
          })),
      }),

      {
        name:
          "hojeond-user",

        storage:
          createJSONStorage(
            () =>
              AsyncStorage,
          ),

        partialize: (
          state,
        ) => ({
          user:
            state.user,
        }),
      },
    ),
  );