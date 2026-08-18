import { create } from "zustand";

interface PresenceStore {
  visible: boolean;
  latitude: number | null;
  longitude: number | null;

  setVisible: (value: boolean) => void;

  updatePosition: (
    latitude: number,
    longitude: number,
  ) => void;
}

export const usePresenceStore =
  create<PresenceStore>((set) => ({
    visible: true,

    latitude: null,
    longitude: null,

    setVisible: (value) =>
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
  }));