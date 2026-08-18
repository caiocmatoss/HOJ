import { create } from "zustand";

interface FavoriteStore {
  favorites: string[];
  addFavorite: (venueId: string) => void;
  removeFavorite: (venueId: string) => void;
  toggleFavorite: (venueId: string) => void;
  isFavorite: (venueId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore =
  create<FavoriteStore>((set, get) => ({
    favorites: [],

    addFavorite: (venueId) =>
      set((state) => {
        if (state.favorites.includes(venueId)) {
          return state;
        }

        return {
          favorites: [...state.favorites, venueId],
        };
      }),

    removeFavorite: (venueId) =>
      set((state) => ({
        favorites: state.favorites.filter(
          (id) => id !== venueId,
        ),
      })),

    toggleFavorite: (venueId) => {
      const { isFavorite, addFavorite, removeFavorite } =
        get();

      if (isFavorite(venueId)) {
        removeFavorite(venueId);
      } else {
        addFavorite(venueId);
      }
    },

    isFavorite: (venueId) =>
      get().favorites.includes(venueId),

    clearFavorites: () =>
      set({
        favorites: [],
      }),
  }));