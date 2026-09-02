import { create } from "zustand";

export type LocationStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "error";

type LocationStore = {
  latitude: number | null;
  longitude: number | null;

  status: LocationStatus;
  error: string | null;
  isTracking: boolean;

  updateLocation: (
    latitude: number,
    longitude: number,
  ) => void;

  setStatus: (
    status: LocationStatus,
  ) => void;

  setError: (
    error: string | null,
  ) => void;

  setTracking: (
    isTracking: boolean,
  ) => void;

  clearLocation: () => void;
};

export const useLocationStore =
  create<LocationStore>((set) => ({
    latitude: null,
    longitude: null,

    status: "idle",
    error: null,
    isTracking: false,

    updateLocation: (
      latitude,
      longitude,
    ) =>
      set({
        latitude,
        longitude,
        error: null,
      }),

    setStatus: (status) =>
      set({
        status,
      }),

    setError: (error) =>
      set({
        error,
      }),

    setTracking: (isTracking) =>
      set({
        isTracking,
      }),

    clearLocation: () =>
      set({
        latitude: null,
        longitude: null,
        status: "idle",
        error: null,
        isTracking: false,
      }),
  }));