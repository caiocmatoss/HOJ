import { create } from "zustand";

import type { User } from "@/data/users";

interface UserStore {
  user: User;

  updateName: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  updateStatus: (status: "online" | "offline") => void;
  updateBio: (bio: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: {
    id: "1",
    name: "Caio",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: "online",
    bio: "Procurando rolê hoje 🎧",
    friendsCount: 12,
    groupsCount: 4,
    favoritesCount: 8,
  },

  updateName: (name) =>
    set((state) => ({
      user: {
        ...state.user,
        name,
      },
    })),

  updateAvatar: (avatar) =>
    set((state) => ({
      user: {
        ...state.user,
        avatar,
      },
    })),

  updateStatus: (status) =>
    set((state) => ({
      user: {
        ...state.user,
        status,
      },
    })),

  updateBio: (bio) =>
    set((state) => ({
      user: {
        ...state.user,
        bio,
      },
    })),
}));