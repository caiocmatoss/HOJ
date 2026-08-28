import { useEffect } from "react";

import * as Location from "expo-location";

import {
  updateSocketLocation,
} from "@/services/socket";

import { useLocationStore } from "@/store/location-store";
import { usePresenceStore } from "@/store/presence-store";

export default function LocationTracker() {
  const updateLocation =
    useLocationStore(
      (state) =>
        state.updateLocation,
    );

  const setStatus =
    useLocationStore(
      (state) =>
        state.setStatus,
    );

  const setError =
    useLocationStore(
      (state) =>
        state.setError,
    );

  const setTracking =
    useLocationStore(
      (state) =>
        state.setTracking,
    );

  const updatePosition =
    usePresenceStore(
      (state) =>
        state.updatePosition,
    );

  useEffect(() => {
    let mounted = true;

    let subscription:
      | Location.LocationSubscription
      | null = null;

    let lastSentLatitude:
      | number
      | null = null;

    let lastSentLongitude:
      | number
      | null = null;

    async function sendLocationToSocket(
      latitude: number,
      longitude: number,
    ) {
      try {
        if (!mounted) {
          return;
        }

        /*
         * Evita enviar exatamente a mesma posição
         * repetidamente para o backend.
         */
        if (
          lastSentLatitude ===
            latitude &&
          lastSentLongitude ===
            longitude
        ) {
          return;
        }

        const result =
          await updateSocketLocation(
            latitude,
            longitude,
          );

        if (!mounted) {
          return;
        }

        lastSentLatitude =
          latitude;

        lastSentLongitude =
          longitude;

        console.log(
          "[LocationTracker] localização enviada:",
          {
            latitude:
              result.latitude,
            longitude:
              result.longitude,
            nearbyFriends:
              result.nearbyFriends,
          },
        );
      } catch (
        error: unknown
      ) {
        /*
         * Falha no Socket não interrompe
         * o rastreamento local do GPS.
         *
         * A posição continua disponível
         * no location-store.
         */
        if (!mounted) {
          return;
        }

        console.warn(
          "[LocationTracker] não foi possível enviar localização pelo Socket:",
          error,
        );
      }
    }

    function updateStores(
      latitude: number,
      longitude: number,
    ) {
      if (!mounted) {
        return;
      }

      updateLocation(
        latitude,
        longitude,
      );

      updatePosition(
        latitude,
        longitude,
      );

      void sendLocationToSocket(
        latitude,
        longitude,
      );
    }

    async function startTracking() {
      try {
        setStatus(
          "requesting",
        );

        setError(null);
        setTracking(false);

        /*
         * Primeiro verifica o estado atual
         * da permissão antes de solicitar
         * novamente.
         */
        let permission =
          await Location.getForegroundPermissionsAsync();

        if (!mounted) {
          return;
        }

        if (
          permission.status !==
          "granted"
        ) {
          permission =
            await Location.requestForegroundPermissionsAsync();
        }

        if (!mounted) {
          return;
        }

        if (
          permission.status !==
          "granted"
        ) {
          setStatus(
            "denied",
          );

          setTracking(false);

          setError(
            "Permissão de localização não concedida.",
          );

          return;
        }

        setStatus(
          "granted",
        );

        setError(null);

        /*
         * Usa uma localização conhecida,
         * quando disponível, para atualizar
         * a interface rapidamente.
         */
        try {
          const lastKnown =
            await Location.getLastKnownPositionAsync();

          if (
            mounted &&
            lastKnown
          ) {
            updateStores(
              lastKnown.coords.latitude,
              lastKnown.coords.longitude,
            );
          }
        } catch {
          /*
           * A ausência de uma localização
           * anterior não impede o restante
           * do rastreamento.
           */
        }

        if (!mounted) {
          return;
        }

        /*
         * Tenta obter uma localização atual.
         */
        try {
          const currentPosition =
            await Location.getCurrentPositionAsync(
              {
                accuracy:
                  Location.Accuracy.High,
              },
            );

          if (mounted) {
            updateStores(
              currentPosition.coords
                .latitude,

              currentPosition.coords
                .longitude,
            );
          }
        } catch {
          /*
           * O watchPositionAsync abaixo
           * ainda poderá fornecer uma
           * posição posteriormente.
           */
        }

        if (!mounted) {
          return;
        }

        subscription =
          await Location.watchPositionAsync(
            {
              accuracy:
                Location.Accuracy.High,

              timeInterval:
                5000,

              distanceInterval:
                10,
            },

            (location) => {
              updateStores(
                location.coords
                  .latitude,

                location.coords
                  .longitude,
              );
            },
          );

        if (!mounted) {
          subscription.remove();

          subscription =
            null;

          return;
        }

        setTracking(true);
      } catch (
        error: unknown
      ) {
        if (!mounted) {
          return;
        }

        setStatus(
          "error",
        );

        setTracking(false);

        if (
          error instanceof Error
        ) {
          setError(
            error.message,
          );
        } else {
          setError(
            "Não foi possível obter sua localização.",
          );
        }
      }
    }

    void startTracking();

    return () => {
      mounted = false;

      if (subscription) {
        subscription.remove();

        subscription =
          null;
      }

      setTracking(false);
    };
  }, [
    setError,
    setStatus,
    setTracking,
    updateLocation,
    updatePosition,
  ]);

  return null;
}
