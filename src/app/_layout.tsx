import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { useFonts } from "expo-font";
import {
  Stack,
  router,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";

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
import { colors } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 420, fade: true });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSerifDisplay_400Regular,
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.backgroundColor = colors.background;
    document.body.style.backgroundColor = colors.background;
  }, []);
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
    if (sessionReady && (fontsLoaded || fontError)) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded, sessionReady]);

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

    // The Figma reference is an isolated, design-only route. It must remain
    // reachable without a session and must never be sent through the auth
    // redirects used by the product screens.
    const isFigmaReferenceRoute =
      __DEV__ && firstSegment === "figma-home-reference";
    const isVisualHarnessRoute =
      __DEV__ && firstSegment === "visual-home-states";

    if (isFigmaReferenceRoute || isVisualHarnessRoute) {
      return;
    }

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

  if ((!fontsLoaded && !fontError) || !sessionReady) {
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="light" />
      <NotificationManager />

      {isAuthenticated && (
        <LocationTracker />
      )}

      <Stack
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor: colors.background,
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

        <Stack.Screen
          name="figma-home-reference"
          options={{ headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
