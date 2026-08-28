import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { useUserStore } from "@/store/user-store";

export default function IndexScreen() {
  const [checkingSession, setCheckingSession] =
    useState(true);

  const accessToken = useUserStore(
    (state) => state.accessToken,
  );

  useEffect(() => {
    let mounted = true;

    if (accessToken) {
      router.replace("/(main)/home");
    } else {
      router.replace("/(auth)/login");
    }

    if (mounted) {
      setCheckingSession(false);
    }

    return () => {
      mounted = false;
    };
  }, [accessToken]);

  if (checkingSession) {
    return (
      <View style={styles.page}>
        <View style={styles.content}>
          <Text style={styles.logo}>
          HOJÉ OND</Text>

          <ActivityIndicator
            size="large"
            color="#FFD54F"
            style={styles.loader}
          />

          <Text style={styles.subtitle}>
            Verificando sua sessão...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.content}>
        <Text style={styles.logo}>
        HOJÉ OND</Text>

        <Text style={styles.subtitle}>
          Redirecionando...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0F0F0F",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    width: "100%",
    maxWidth: 520,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  logo: {
    color: "#FFD54F",
    fontSize: 42,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },

  loader: {
    marginBottom: 20,
  },

  subtitle: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 380,
  },
});