import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  status: "ONLINE" | "OFFLINE";
  createdAt?: string;
  updatedAt?: string;
};

interface UserStore {
  user: AuthUser | null;
  accessToken: string | null;
  hasHydrated: boolean;

  setAuth: (
    user: AuthUser,
    accessToken: string,
  ) => void;

  setUser: (
    user: AuthUser,
  ) => void;

  clearAuth: () => void;

  logout: () => void;

  setHasHydrated: (hasHydrated: boolean) => void;

  updateName: (
    name: string,
  ) => void;

  updateAvatar: (
    avatar: string | null,
  ) => void;

  updateStatus: (
    status: "ONLINE" | "OFFLINE",
  ) => void;

  updateBio: (
    bio: string | null,
  ) => void;
}

export const useUserStore =
  create<UserStore>()(
    persist(
      (set) => ({
        user: null,

        accessToken: null,

        hasHydrated: false,

        setAuth: (
          user,
          accessToken,
        ) =>
          set({
            user,
            accessToken,
          }),

        setUser: (
          user,
        ) =>
          set({
            user,
          }),

        clearAuth: () =>
          set({
            user: null,
            accessToken: null,
          }),

        logout: () =>
          set({
            user: null,
            accessToken: null,
          }),

        setHasHydrated: (hasHydrated) =>
          set({ hasHydrated }),

        updateName: (
          name,
        ) =>
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  name,
                }
              : null,
          })),

        updateAvatar: (
          avatar,
        ) =>
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  avatar,
                }
              : null,
          })),

        updateStatus: (
          status,
        ) =>
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  status,
                }
              : null,
          })),

        updateBio: (
          bio,
        ) =>
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  bio,
                }
              : null,
          })),
      }),

      {
        name: "hojeond-user",

        storage:
          createJSONStorage(
            () =>
              AsyncStorage,
          ),

        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },

        partialize:
          (state) => ({
            user:
              state.user,

            accessToken:
              state.accessToken,
          }),
      },
    ),
  );