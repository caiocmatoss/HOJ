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
import { register } from "@/services/api";
import { connectSocket } from "@/services/socket";
import { useUserStore } from "@/store/user-store";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const setAuth = useUserStore(
    (state) => state.setAuth,
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (name.trim().length < 2) {
      newErrors.name =
        "Nome deve ter pelo menos 2 caracteres";
    }

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (
      !/^\S+@\S+\.\S+$/.test(email.trim())
    ) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password =
        "Senha deve ter pelo menos 6 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Confirmação de senha é obrigatória";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Senhas não coincidem";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const result = await register(name.trim(), email.trim().toLowerCase(), password);

      if (!result.user || !result.accessToken) {
        throw new Error(
          "Resposta de cadastro inválida.",
        );
      }

      setAuth(result.user, result.accessToken);

      connectSocket();

      router.replace("/(main)/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta.";

      setErrors({
        general: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);

    if (errors.name || errors.general) {
      setErrors((current) => ({
        ...current,
        name: "",
        general: "",
      }));
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (errors.email || errors.general) {
      setErrors((current) => ({
        ...current,
        email: "",
        general: "",
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (errors.password || errors.general) {
      setErrors((current) => ({
        ...current,
        password: "",
        general: "",
      }));
    }
  };

  const handleConfirmPasswordChange = (
    value: string,
  ) => {
    setConfirmPassword(value);

    if (
      errors.confirmPassword ||
      errors.general
    ) {
      setErrors((current) => ({
        ...current,
        confirmPassword: "",
        general: "",
      }));
    }
  };

  return (
    <View style={styles.container}>
      <ScreenContainer maxWidth={760}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>
              HOJÉ OND
            </Text>

            <Text style={styles.title}>
              Crie sua conta
            </Text>
          </View>

          <View style={styles.form}>
            {errors.general ? (
              <Text style={styles.generalError}>
                {errors.general}
              </Text>
            ) : null}

            <TextInput
              style={[
                styles.input,
                errors.name && styles.inputError,
              ]}
              placeholder="Nome"
              placeholderTextColor="#777777"
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />

            {errors.name ? (
              <Text style={styles.errorText}>
                {errors.name}
              </Text>
            ) : null}

            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError,
              ]}
              placeholder="Email"
              placeholderTextColor="#777777"
              keyboardType="email-address"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {errors.email ? (
              <Text style={styles.errorText}>
                {errors.email}
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
              value={password}
              onChangeText={handlePasswordChange}
              editable={!loading}
            />

            {errors.password ? (
              <Text style={styles.errorText}>
                {errors.password}
              </Text>
            ) : null}

            <TextInput
              style={[
                styles.input,
                errors.confirmPassword &&
                  styles.inputError,
              ]}
              placeholder="Confirmar senha"
              placeholderTextColor="#777777"
              secureTextEntry
              value={confirmPassword}
              onChangeText={
                handleConfirmPasswordChange
              }
              editable={!loading}
            />

            {errors.confirmPassword ? (
              <Text style={styles.errorText}>
                {errors.confirmPassword}
              </Text>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                loading &&
                  styles.buttonDisabled,
                pressed &&
                  !loading &&
                  styles.pressed,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "Criando conta..."
                  : "Criar conta"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push(
                  "/(auth)/login",
                )
              }
              disabled={loading}
              style={({ pressed }) => [
                styles.loginButton,
                pressed &&
                  !loading &&
                  styles.pressed,
              ]}
            >
              <Text style={styles.login}>
                Já tenho uma conta
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    color: "#FFC400",
    fontSize: 40,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  form: {
    width: "100%",
    maxWidth: 520,
  },

  generalError: {
    color: "#FF6B6B",
    backgroundColor: "#2A1515",
    borderWidth: 1,
    borderColor: "#5A2525",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 18,
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#1B1B1B",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#292929",
    marginBottom: 10,
    fontSize: 16,
  },

  inputError: {
    borderColor: "#D50000",
  },

  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 10,
    paddingHorizontal: 4,
  },

  button: {
    width: "100%",
    backgroundColor: "#FFC400",
    paddingVertical: 17,
    borderRadius: 14,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    backgroundColor: "#777777",
  },

  buttonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "800",
  },

  loginButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },

  login: {
    color: "#FFC400",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  pressed: {
    opacity: 0.8,
  },
});