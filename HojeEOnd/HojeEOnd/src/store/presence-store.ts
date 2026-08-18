import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

interface PresenceStore {
  visible: boolean;

  latitude: number | null;

  longitude: number | null;

  setVisible: (
    value: boolean,
  ) => void;

  updatePosition: (
    latitude: number,
    longitude: number,
  ) => void;
}

export const usePresenceStore =
  create<PresenceStore>()(
    persist(
      (set) => ({
        visible: true,

        latitude: null,

        longitude: null,

        setVisible: (
          value,
        ) =>
          set({
            visible: value,
          }),

        updatePosition: (
          latitude,
          longitude,
        ) =>
          set({
            latitude,
            longitude,
          }),
      }),

      {
        name:
          "hojeond-presence",

        storage:
          createJSONStorage(
            () =>
              AsyncStorage,
          ),

        partialize: (
          state,
        ) => ({
          visible:
            state.visible,
        }),
      },
    ),
  );