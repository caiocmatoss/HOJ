import { useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { login } from "@/services/api";

import {
  connectSocket,
} from "@/services/socket";

import {
  useUserStore,
} from "@/store/user-store";

export default function LoginScreen() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] = useState<
    Record<string, string>
  >({});

  const setAuth =
    useUserStore(
      (state) => state.setAuth,
    );

  const validateForm = () => {
    const newErrors: Record<
      string,
      string
    > = {};

    if (!email.trim()) {
      newErrors.email =
        "Email é obrigatório";
    } else if (
      !/^\S+@\S+\.\S+$/.test(
        email.trim(),
      )
    ) {
      newErrors.email =
        "Email inválido";
    }

    if (!password) {
      newErrors.password =
        "Senha é obrigatória";
    } else if (
      password.length < 6
    ) {
      newErrors.password =
        "Senha deve ter pelo menos 6 caracteres";
    }

    setErrors(
      newErrors,
    );

    return (
      Object.keys(
        newErrors,
      ).length === 0
    );
  };

  const handleLogin =
    async () => {
      if (loading) {
        return;
      }

      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);

        setErrors({});

        const result = await login(email.trim(), password);

        if (
          !result.user ||
          !result.accessToken
        ) {
          throw new Error(
            "Resposta de login inválida.",
          );
        }

        /*
         * Salva o usuário REAL
         * retornado pelo backend.
         */
        setAuth(
          result.user,
          result.accessToken,
        );

        /*
         * Agora o Socket.IO
         * consegue usar o JWT real.
         */
        connectSocket();

        router.replace(
          "/(main)/home",
        );
      } catch (
        error
      ) {
        const message =
          error instanceof
          Error
            ? error.message
            : "Não foi possível fazer login.";

        setErrors({
          general:
            message,
        });
      } finally {
        setLoading(
          false,
        );
      }
    };

  return (
    <View
      style={
        styles.container
      }
    >
      <ScreenContainer
        maxWidth={760}
      >
        <View
          style={
            styles.content
          }
        >
          <View
            style={
              styles.header
            }
          >
            <Text
              style={
                styles.title
              }
            >
              HOJÉ OND
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Bem-vindo de volta
            </Text>
          </View>

          <View
            style={
              styles.form
            }
          >
            {errors.general ? (
              <Text
                style={
                  styles.generalError
                }
              >
                {
                  errors.general
                }
              </Text>
            ) : null}

            <TextInput
              style={[
                styles.input,
                errors.email &&
                  styles.inputError,
              ]}
              placeholder="Email"
              placeholderTextColor="#777777"
              value={
                email
              }
              onChangeText={(
                value,
              ) => {
                setEmail(
                  value,
                );

                if (
                  errors.email
                ) {
                  setErrors(
                    (
                      current,
                    ) => ({
                      ...current,
                      email:
                        "",
                    }),
                  );
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={
                false
              }
              editable={
                !loading
              }
            />

            {errors.email ? (
              <Text
                style={
                  styles.errorText
                }
              >
                {
                  errors.email
                }
              </Text>
            ) : null}

            <TextInput
              style={[
                styles.input,
                errors.password &&
                  styles.inputError,
              ]}
              placeholder="Senha"
              placeholderTextColor="#777777"
              secureTextEntry
              value={
                password
              }
              onChangeText={(
                value,
              ) => {
                setPassword(
                  value,
                );

                if (
                  errors.password
                ) {
                  setErrors(
                    (
                      current,
                    ) => ({
                      ...current,
                      password:
                        "",
                    }),
                  );
                }
              }}
              editable={
                !loading
              }
            />

            {errors.password ? (
              <Text
                style={
                  styles.errorText
                }
              >
                {
                  errors.password
                }
              </Text>
            ) : null}

            <Pressable
              style={({
                pressed,
              }) => [
                styles.button,

                loading &&
                  styles.buttonDisabled,

                pressed &&
                  !loading &&
                  styles.pressed,
              ]}
              onPress={
                handleLogin
              }
              disabled={
                loading
              }
            >
              <Text
                style={
                  styles.buttonText
                }
              >
                {loading
                  ? "Entrando..."
                  : "Entrar"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push(
                  "/(auth)/register",
                )
              }
              disabled={
                loading
              }
              style={({
                pressed,
              }) => [
                styles.registerButton,

                pressed &&
                  !loading &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.register
                }
              >
                Criar uma conta
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#0F0F0F",
      justifyContent:
        "center",
    },

    content: {
      width: "100%",
      alignItems:
        "center",
    },

    header: {
      width: "100%",
      alignItems:
        "center",
      marginBottom: 32,
    },

    title: {
      color:
        "#FFD54F",
      fontSize: 40,
      fontWeight:
        "800",
      textAlign:
        "center",
      letterSpacing: 1,
    },

    subtitle: {
      color:
        "#FFFFFF",
      fontSize: 18,
      marginTop: 10,
      textAlign:
        "center",
    },

    form: {
      width: "100%",
      maxWidth: 520,
    },

    generalError: {
      color:
        "#FF6B6B",
      backgroundColor:
        "#2A1515",
      borderWidth: 1,
      borderColor:
        "#5A2525",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      fontSize: 13,
      lineHeight: 18,
    },

    input: {
      width: "100%",
      height: 56,
      backgroundColor:
        "#1B1B1B",
      color:
        "#FFFFFF",
      paddingHorizontal: 16,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#292929",
      fontSize: 16,
      marginBottom: 10,
    },

    inputError: {
      borderColor:
        "#D50000",
    },

    errorText: {
      color:
        "#FF6B6B",
      fontSize: 13,
      lineHeight: 18,
      marginTop: -4,
      marginBottom: 10,
      paddingHorizontal: 4,
    },

    button: {
      width: "100%",
      backgroundColor:
        "#FFC400",
      paddingVertical: 17,
      borderRadius: 14,
      marginTop: 8,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    buttonDisabled: {
      backgroundColor:
        "#777777",
    },

    buttonText: {
      color:
        "#000000",
      fontSize: 17,
      fontWeight:
        "800",
    },

    registerButton: {
      alignSelf:
        "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginTop: 12,
    },

    register: {
      color:
        "#FFC400",
      fontSize: 15,
      fontWeight:
        "700",
      textAlign:
        "center",
    },

    pressed: {
      opacity: 0.8,
    },
  });