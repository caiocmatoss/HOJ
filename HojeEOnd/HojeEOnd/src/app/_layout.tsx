import {
  Stack,
  router,
  useSegments,
} from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import LocationTracker from "@/components/LocationTracker";
import NotificationManager from "@/components/NotificationManager";

import {
  getCurrentUser,
} from "@/services/api";

import {
  useUserStore,
} from "@/store/user-store";

export default function RootLayout() {
  const segments = useSegments();

  const user = useUserStore(
    (state) => state.user,
  );

  const accessToken =
    useUserStore(
      (state) => state.accessToken,
    );

  const hasHydrated = useUserStore((state) => state.hasHydrated);

  const setUser =
    useUserStore(
      (state) => state.setUser,
    );

  const clearAuth =
    useUserStore(
      (state) => state.clearAuth,
    );

  const [
    sessionReady,
    setSessionReady,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!hasHydrated) {
      return;
    }

    const restoreSession =
      async () => {
        try {
          const token =
            useUserStore.getState()
              .accessToken;

          if (!token) {
            if (mounted) {
              setSessionReady(true);
            }

            return;
          }

          const currentUser =
            await getCurrentUser();

          if (!mounted) {
            return;
          }

          setUser(currentUser);
        } catch {
          if (!mounted) {
            return;
          }

          clearAuth();
        } finally {
          if (mounted) {
            setSessionReady(true);
          }
        }
      };

    void restoreSession();

    return () => {
      mounted = false;
    };
  },
  [
    hasHydrated,
    clearAuth,
    setUser,
  ]);

  useEffect(() => {
    if (!sessionReady) {
      return;
    }

    const firstSegment =
      segments[0];

    const isAuthRoute =
      firstSegment === "(auth)";

    /*
     * =======================================================
     * AUTENTICAÇÃO / NAVEGAÇÃO
     * =======================================================
     *
     * Usuários não autenticados permanecem
     * nas rotas de autenticação.
     *
     * Usuários autenticados podem acessar
     * as áreas protegidas do aplicativo.
     */

    if (!accessToken || !user) {
      if (!isAuthRoute) {
        router.replace(
          "/(auth)/login",
        );
      }

      return;
    }

    /*
     * Usuário autenticado não deve
     * permanecer nas telas de autenticação.
     */

    if (isAuthRoute) {
      router.replace(
        "/(main)/home",
      );

      return;
    }

    /*
     * Não redirecionamos mais toda rota
     * que não seja "(main)".
     *
     * Isso permite rotas como:
     *
     * /event/[id]
     * /venue/[id]
     *
     * e futuras rotas protegidas.
     */
  }, [
    sessionReady,
    accessToken,
    user,
    segments,
  ]);

  if (!sessionReady) {
    return null;
  }

  /*
   * =======================================================
   * APLICAÇÃO
   * =======================================================
   *
   * O LocationTracker fica montado no RootLayout.
   *
   * Dessa forma:
   *
   * - inicia quando existe usuário autenticado;
   * - solicita permissão de localização;
   * - acompanha a posição;
   * - atualiza o location-store;
   * - atualiza o presence-store;
   * - envia a posição pelo Socket.IO;
   * - recebe as posições dos amigos;
   * - funciona independentemente da tela atual.
   *
   * Como o componente retorna null,
   * ele não adiciona nenhum elemento visual
   * à interface.
   */

  const isAuthenticated =
    Boolean(
      accessToken && user,
    );

  return (
    <>
      <NotificationManager />

      {isAuthenticated && (
        <LocationTracker />
      )}

      <Stack
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor:
              "#090909",
          },
        }}
      >
        <Stack.Screen
          name="index"
        />
<Stack.Screen
          name="(main)"
        />

        <Stack.Screen
          name="venue/[id]"
        />

        <Stack.Screen
          name="event/[id]"
        />
      </Stack>
    </>
  );
}
