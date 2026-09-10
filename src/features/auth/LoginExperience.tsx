import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BrandMark } from "@/components/ui/BrandMark";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { login } from "@/services/api/auth";
import { connectSocket } from "@/services/socket";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";

type LoginErrors = Partial<Record<"email" | "password" | "general", string>>;

export default function LoginExperience() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const clearError = (field: keyof LoginErrors) => {
    if (!errors[field] && !errors.general) return;

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }));
  };

  const validateForm = () => {
    const nextErrors: LoginErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      nextErrors.email = "Informe seu email.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Digite um email válido.";
    }

    if (!password) {
      nextErrors.password = "Informe sua senha.";
    } else if (password.length < 6) {
      nextErrors.password = "A senha precisa ter pelo menos 6 caracteres.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (loading || !validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const result = await login(email.trim().toLowerCase(), password);

      if (!result.user || !result.accessToken) {
        throw new Error("Resposta de login inválida.");
      }

      connectSocket();
      router.replace("/(main)/home");
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Não foi possível entrar. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={[colors.background, "#11151B", colors.background]}
        end={{ x: 0.9, y: 1 }}
        start={{ x: 0.1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenContainer maxWidth={500} paddingHorizontal={22}>
            <View style={styles.content}>
              <BrandMark />

              <View style={styles.intro}>
                <Text style={styles.eyebrow}>BEM-VINDO DE VOLTA</Text>
                <Text style={styles.title}>Sua noite começa aqui.</Text>
                <Text style={styles.subtitle}>
                  Entre para descobrir o que está acontecendo perto de você agora.
                </Text>
              </View>

              <View style={styles.formCard}>
                {errors.general ? (
                  <View accessibilityRole="alert" style={styles.errorBanner}>
                    <Ionicons color={colors.danger} name="alert-circle-outline" size={19} />
                    <Text style={styles.errorBannerText}>{errors.general}</Text>
                  </View>
                ) : null}

                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputShell, errors.email && styles.inputShellError]}>
                    <Ionicons color={colors.textMuted} name="mail-outline" size={19} />
                    <TextInput
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!loading}
                      keyboardType="email-address"
                      onChangeText={(value) => {
                        setEmail(value);
                        clearError("email");
                      }}
                      onSubmitEditing={() => undefined}
                      placeholder="voce@email.com"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="next"
                      style={styles.input}
                      value={email}
                    />
                  </View>
                  {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
                </View>

                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Senha</Text>
                    <Text style={styles.labelHint}>mínimo de 6 caracteres</Text>
                  </View>
                  <View style={[styles.inputShell, errors.password && styles.inputShellError]}>
                    <Ionicons color={colors.textMuted} name="lock-closed-outline" size={19} />
                    <TextInput
                      autoComplete="current-password"
                      editable={!loading}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearError("password");
                      }}
                      onSubmitEditing={() => void handleLogin()}
                      placeholder="Sua senha"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="go"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={password}
                    />
                    <Pressable
                      accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      hitSlop={10}
                      onPress={() => setShowPassword((current) => !current)}
                      style={styles.visibilityButton}
                    >
                      <Ionicons
                        color={colors.textSecondary}
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                      />
                    </Pressable>
                  </View>
                  {errors.password ? (
                    <Text style={styles.fieldError}>{errors.password}</Text>
                  ) : null}
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={() => void handleLogin()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    loading && styles.buttonDisabled,
                    pressed && !loading && styles.primaryButtonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Text>
                  <Ionicons color={colors.background} name="arrow-forward" size={19} />
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Novo por aqui?</Text>
                  <View style={styles.divider} />
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={() => router.push("/(auth)/register")}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && !loading && styles.secondaryButtonPressed,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>Criar uma conta</Text>
                </Pressable>
              </View>

              <Text style={styles.footer}>
                Descubra lugares · encontre amigos · viva agora
              </Text>
            </View>
          </ScreenContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 36,
    paddingTop: 48,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  glowTop: {
    backgroundColor: "rgba(245, 197, 66, 0.09)",
    borderRadius: 180,
    height: 300,
    position: "absolute",
    right: -150,
    top: -90,
    width: 300,
  },
  glowBottom: {
    backgroundColor: "rgba(104, 151, 204, 0.06)",
    borderRadius: 160,
    bottom: -130,
    height: 280,
    left: -150,
    position: "absolute",
    width: 280,
  },
  intro: {
    alignItems: "center",
    marginBottom: 26,
    marginTop: 30,
  },
  eyebrow: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.8,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 45,
    marginTop: 9,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
    maxWidth: 380,
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "rgba(21, 25, 29, 0.94)",
    borderColor: colors.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    padding: 20,
    ...shadows.floating,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(239, 125, 125, 0.24)",
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginBottom: 18,
    padding: 12,
  },
  errorBannerText: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  field: {
    marginBottom: 17,
  },
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginBottom: 8,
  },
  labelHint: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginBottom: 8,
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 15,
  },
  inputShellError: {
    borderColor: colors.danger,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 11,
    paddingVertical: 0,
  },
  visibilityButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  fieldError: {
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginLeft: 4,
    marginTop: 6,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 3,
  },
  primaryButtonPressed: {
    backgroundColor: colors.brandPressed,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginVertical: 19,
  },
  divider: {
    backgroundColor: colors.borderStrong,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surfacePressed,
  },
  secondaryButtonText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  footer: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 24,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
