import { create } from "zustand";

import {
  addFavorite as addFavoriteRequest,
  getFavorites,
  removeFavorite as removeFavoriteRequest,
  type ApiFavorite,
  type ApiVenue,
} from "@/services/api";

interface FavoriteStore {
  favorites: string[];
  favoriteIds: string[];
  favoriteVenues: ApiVenue[];
  loading: boolean;
  error: string | null;
  processingVenueIds: Record<string, boolean>;
  loadFavorites: () => Promise<void>;
  addFavorite: (venueId: string) => Promise<void>;
  removeFavorite: (venueId: string) => Promise<void>;
  toggleFavorite: (venueId: string) => Promise<void>;
  isFavorite: (venueId: string) => boolean;
  isProcessing: (venueId: string) => boolean;
  clearFavorites: () => void;
  clearError: () => void;
}

function applyFavorites(
  items: ApiFavorite[],
): Pick<FavoriteStore, "favorites" | "favoriteIds" | "favoriteVenues"> {
  const ids = items.map((item) => item.venueId);
  return {
    favorites: ids,
    favoriteIds: ids,
    favoriteVenues: items.map((item) => item.venue),
  };
}

export const useFavoriteStore = create<FavoriteStore>()((set, get) => ({
  favorites: [],
  favoriteIds: [],
  favoriteVenues: [],
  loading: false,
  error: null,
  processingVenueIds: {},

  loadFavorites: async () => {
    set({ loading: true, error: null });
    try {
      const items = await getFavorites();
      set({ ...applyFavorites(items), loading: false, error: null });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar seus favoritos.",
      });
    }
  },

  addFavorite: async (venueId) => {
    if (!venueId || get().processingVenueIds[venueId]) return;
    set((state) => ({
      error: null,
      processingVenueIds: { ...state.processingVenueIds, [venueId]: true },
    }));
    try {
      const item = await addFavoriteRequest(venueId);
      set((state) => {
        const ids = state.favorites.includes(item.venueId)
          ? state.favorites
          : [...state.favorites, item.venueId];
        const venues = state.favoriteVenues.some((venue) => venue.id === item.venueId)
          ? state.favoriteVenues
          : [...state.favoriteVenues, item.venue];
        return {
          favorites: ids,
          favoriteIds: ids,
          favoriteVenues: venues,
          error: null,
          processingVenueIds: { ...state.processingVenueIds, [venueId]: false },
        };
      });
    } catch (error) {
      set((state) => ({
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível adicionar o favorito.",
        processingVenueIds: { ...state.processingVenueIds, [venueId]: false },
      }));
      throw error;
    }
  },

  removeFavorite: async (venueId) => {
    if (!venueId || get().processingVenueIds[venueId]) return;
    set((state) => ({
      error: null,
      processingVenueIds: { ...state.processingVenueIds, [venueId]: true },
    }));
    try {
      await removeFavoriteRequest(venueId);
      set((state) => {
        const ids = state.favorites.filter((id) => id !== venueId);
        return {
          favorites: ids,
          favoriteIds: ids,
          favoriteVenues: state.favoriteVenues.filter((venue) => venue.id !== venueId),
          error: null,
          processingVenueIds: { ...state.processingVenueIds, [venueId]: false },
        };
      });
    } catch (error) {
      set((state) => ({
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível remover o favorito.",
        processingVenueIds: { ...state.processingVenueIds, [venueId]: false },
      }));
      throw error;
    }
  },

  toggleFavorite: async (venueId) => {
    if (get().favorites.includes(venueId)) {
      await get().removeFavorite(venueId);
    } else {
      await get().addFavorite(venueId);
    }
  },

  isFavorite: (venueId) => get().favorites.includes(venueId),
  isProcessing: (venueId) => Boolean(get().processingVenueIds[venueId]),

  clearFavorites: () =>
    set({ favorites: [], favoriteIds: [], favoriteVenues: [], error: null }),
  clearError: () => set({ error: null }),
}));