import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

interface FavoriteStore {
  favorites: string[];

  addFavorite: (
    venueId: string,
  ) => void;

  removeFavorite: (
    venueId: string,
  ) => void;

  toggleFavorite: (
    venueId: string,
  ) => void;

  isFavorite: (
    venueId: string,
  ) => boolean;

  clearFavorites: () => void;
}

export const useFavoriteStore =
  create<FavoriteStore>()(
    persist(
      (set, get) => ({
        favorites: [],

        addFavorite: (
          venueId,
        ) => {
          set((state) => {
            if (
              state.favorites.includes(
                venueId,
              )
            ) {
              return state;
            }

            return {
              favorites: [
                ...state.favorites,
                venueId,
              ],
            };
          });
        },

        removeFavorite: (
          venueId,
        ) => {
          set((state) => ({
            favorites:
              state.favorites.filter(
                (id) =>
                  id !== venueId,
              ),
          }));
        },

        toggleFavorite: (
          venueId,
        ) => {
          set((state) => {
            const alreadyFavorite =
              state.favorites.includes(
                venueId,
              );

            if (alreadyFavorite) {
              return {
                favorites:
                  state.favorites.filter(
                    (id) =>
                      id !==
                      venueId,
                  ),
              };
            }

            return {
              favorites: [
                ...state.favorites,
                venueId,
              ],
            };
          });
        },

        isFavorite: (
          venueId,
        ) =>
          get().favorites.includes(
            venueId,
          ),

        clearFavorites: () => {
          set({
            favorites: [],
          });
        },
      }),

      {
        name:
          "hojeond-favorites",

        storage:
          createJSONStorage(
            () =>
              AsyncStorage,
          ),

        partialize: (
          state,
        ) => ({
          favorites:
            state.favorites,
        }),
      },
    ),
  );