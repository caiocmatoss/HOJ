import AsyncStorage from "@react-native-async-storage/async-storage";

import { create } from "zustand";

import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

import type {
  LocationUpdatedData,
  PresenceChangedData,
  PresenceStatus,
  PresenceUser,
} from "@/services/socket";

type PresenceMap = Record<
  string,
  PresenceStatus
>;

type FriendLocation = LocationUpdatedData;

interface PresenceStore {
  /*
   * ================================
   * VISIBILIDADE / LOCALIZAÇÃO
   * ================================
   */

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

  /*
   * ================================
   * LOCALIZAÇÃO DOS AMIGOS
   * ================================
   *
   * userId -> localização em tempo real
   *
   * NÃO é persistido.
   */

  friendLocations: Record<
    string,
    FriendLocation
  >;

  updateFriendLocation: (
    data: FriendLocation,
  ) => void;

  removeFriendLocation: (
    userId: string,
  ) => void;

  /*
   * ================================
   * PRESENÇA DOS USUÁRIOS
   * ================================
   *
   * userId -> ONLINE / OFFLINE
   */

  statuses: PresenceMap;

  setPresenceList: (
    users: PresenceUser[],
  ) => void;

  updatePresence: (
    data: PresenceChangedData,
  ) => void;

  setUserStatus: (
    userId: string,
    status: PresenceStatus,
  ) => void;

  getUserStatus: (
    userId: string,
  ) => PresenceStatus;

  isOnline: (
    userId: string,
  ) => boolean;

  removeUser: (
    userId: string,
  ) => void;

  clearPresence: () => void;

  clearAll: () => void;
}

export const usePresenceStore =
  create<PresenceStore>()(
    persist(
      (set, get) => ({
        /*
         * ================================
         * VISIBILIDADE / LOCALIZAÇÃO
         * ================================
         */

        visible: true,

        latitude: null,

        longitude: null,

        setVisible: (
          value,
        ) => {
          set({
            visible: value,
          });
        },

        updatePosition: (
          latitude,
          longitude,
        ) => {
          if (
            !Number.isFinite(
              latitude,
            ) ||
            !Number.isFinite(
              longitude,
            )
          ) {
            return;
          }

          set({
            latitude,
            longitude,
          });
        },

        /*
         * ================================
         * LOCALIZAÇÃO DOS AMIGOS
         * ================================
         */

        friendLocations: {},

        updateFriendLocation: (
          data,
        ) => {
          if (
            !data ||
            typeof data.userId !==
              "string" ||
            !data.userId.trim()
          ) {
            return;
          }

          if (
            !Number.isFinite(
              data.latitude,
            ) ||
            !Number.isFinite(
              data.longitude,
            )
          ) {
            return;
          }

          if (
            data.latitude < -90 ||
            data.latitude > 90
          ) {
            return;
          }

          if (
            data.longitude < -180 ||
            data.longitude > 180
          ) {
            return;
          }

          if (
            typeof data.updatedAt !==
            "string"
          ) {
            return;
          }

          const userId =
            data.userId.trim();

          set((state) => {
            const previous =
              state.friendLocations[
                userId
              ];

            /*
             * Evita renderização desnecessária
             * quando os dados recebidos são iguais.
             */
            if (
              previous &&
              previous.latitude ===
                data.latitude &&
              previous.longitude ===
                data.longitude &&
              previous.updatedAt ===
                data.updatedAt &&
              previous.distanceMeters ===
                data.distanceMeters &&
              previous.distanceKm ===
                data.distanceKm
            ) {
              return state;
            }

            return {
              friendLocations: {
                ...state.friendLocations,

                [userId]: {
                  ...data,
                  userId,
                },
              },
            };
          });
        },

        removeFriendLocation: (
          userId,
        ) => {
          const normalizedUserId =
            userId.trim();

          if (
            !normalizedUserId
          ) {
            return;
          }

          set((state) => {
            if (
              !Object.prototype.hasOwnProperty.call(
                state.friendLocations,
                normalizedUserId,
              )
            ) {
              return state;
            }

            const next = {
              ...state.friendLocations,
            };

            delete next[
              normalizedUserId
            ];

            return {
              friendLocations: next,
            };
          });
        },

        /*
         * ================================
         * PRESENÇA
         * ================================
         */

        statuses: {},

        setPresenceList: (
          users,
        ) => {
          if (!Array.isArray(users)) {
            return;
          }

          set((state) => {
            const next = {
              ...state.statuses,
            };

            for (
              const user of users
            ) {
              if (
                !user ||
                typeof user.id !==
                  "string" ||
                !user.id.trim()
              ) {
                continue;
              }

              if (
                user.status !==
                  "ONLINE" &&
                user.status !==
                  "OFFLINE"
              ) {
                continue;
              }

              next[user.id] =
                user.status;
            }

            return {
              statuses: next,
            };
          });
        },

        updatePresence: (
          data,
        ) => {
          if (
            !data ||
            typeof data.userId !==
              "string" ||
            !data.userId.trim()
          ) {
            return;
          }

          if (
            data.status !==
              "ONLINE" &&
            data.status !==
              "OFFLINE"
          ) {
            return;
          }

          set((state) => {
            const currentStatus =
              state.statuses[
                data.userId
              ];

            const nextLocations =
              state.friendLocations;

            /*
             * Quando o usuário fica offline,
             * sua localização em tempo real
             * deixa de ser válida para o mapa.
             */
            if (
              data.status ===
              "OFFLINE" &&
              Object.prototype.hasOwnProperty.call(
                nextLocations,
                data.userId,
              )
            ) {
              const locations = {
                ...nextLocations,
              };

              delete locations[
                data.userId
              ];

              return {
                statuses: {
                  ...state.statuses,

                  [data.userId]:
                    data.status,
                },

                friendLocations:
                  locations,
              };
            }

            if (
              currentStatus ===
              data.status
            ) {
              return state;
            }

            return {
              statuses: {
                ...state.statuses,

                [data.userId]:
                  data.status,
              },
            };
          });
        },

        setUserStatus: (
          userId,
          status,
        ) => {
          const normalizedUserId =
            userId.trim();

          if (
            !normalizedUserId
          ) {
            return;
          }

          if (
            status !== "ONLINE" &&
            status !== "OFFLINE"
          ) {
            return;
          }

          set((state) => {
            if (
              state.statuses[
                normalizedUserId
              ] === status
            ) {
              return state;
            }

            return {
              statuses: {
                ...state.statuses,

                [normalizedUserId]:
                  status,
              },
            };
          });
        },

        getUserStatus: (
          userId,
        ) => {
          const normalizedUserId =
            userId.trim();

          if (
            !normalizedUserId
          ) {
            return "OFFLINE";
          }

          return (
            get().statuses[
              normalizedUserId
            ] ??
            "OFFLINE"
          );
        },

        isOnline: (
          userId,
        ) => {
          const normalizedUserId =
            userId.trim();

          if (
            !normalizedUserId
          ) {
            return false;
          }

          return (
            get().statuses[
              normalizedUserId
            ] === "ONLINE"
          );
        },

        removeUser: (
          userId,
        ) => {
          const normalizedUserId =
            userId.trim();

          if (
            !normalizedUserId
          ) {
            return;
          }

          set((state) => {
            const hasStatus =
              Object.prototype.hasOwnProperty.call(
                state.statuses,
                normalizedUserId,
              );

            const hasLocation =
              Object.prototype.hasOwnProperty.call(
                state.friendLocations,
                normalizedUserId,
              );

            if (
              !hasStatus &&
              !hasLocation
            ) {
              return state;
            }

            const nextStatuses = {
              ...state.statuses,
            };

            const nextLocations = {
              ...state.friendLocations,
            };

            delete nextStatuses[
              normalizedUserId
            ];

            delete nextLocations[
              normalizedUserId
            ];

            return {
              statuses:
                nextStatuses,

              friendLocations:
                nextLocations,
            };
          });
        },

        clearPresence: () => {
          set({
            statuses: {},
            friendLocations: {},
          });
        },

        clearAll: () => {
          set({
            visible: true,

            latitude: null,

            longitude: null,

            statuses: {},

            friendLocations: {},
          });
        },
      }),

      {
        name:
          "hojeond-presence",

        storage:
          createJSONStorage(
            () =>
              AsyncStorage,
          ),

        /*
         * NÃO persistimos:
         * - statuses
         * - friendLocations
         * - latitude
         * - longitude
         *
         * Persistimos somente a preferência
         * de visibilidade.
         */
        partialize: (
          state,
        ) => ({
          visible:
            state.visible,
        }),
      },
    ),
  );