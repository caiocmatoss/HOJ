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
import { register } from "@/services/api/auth";
import { connectSocket } from "@/services/socket";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";

type RegisterErrors = Partial<
  Record<"name" | "email" | "password" | "confirmPassword" | "general", string>
>;

export default function RegisterExperience() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const clearError = (field: keyof RegisterErrors) => {
    if (!errors[field] && !errors.general) return;

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }));
  };

  const validateForm = () => {
    const nextErrors: RegisterErrors = {};
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      nextErrors.name = "Informe seu nome.";
    } else if (normalizedName.length < 2) {
      nextErrors.name = "O nome precisa ter pelo menos 2 caracteres.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Informe seu email.";
    } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      nextErrors.email = "Digite um email válido.";
    }

    if (!password) {
      nextErrors.password = "Informe uma senha.";
    } else if (password.length < 6) {
      nextErrors.password = "A senha precisa ter pelo menos 6 caracteres.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Confirme sua senha.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "As senhas não coincidem.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (loading || !validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const result = await register(
        name.trim(),
        email.trim().toLowerCase(),
        password,
      );

      if (!result.user || !result.accessToken) {
        throw new Error("Resposta de cadastro inválida.");
      }

      connectSocket();
      router.replace("/(main)/home");
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Não foi possível criar sua conta.",
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
              <BrandMark compact tagline="Seu agora começa aqui" />

              <View style={styles.intro}>
                <Text style={styles.eyebrow}>ENTRE PARA A COMUNIDADE</Text>
                <Text style={styles.title}>Crie sua conta.</Text>
                <Text style={styles.subtitle}>
                  Encontre os melhores lugares e as pessoas que fazem a noite acontecer.
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
                  <Text style={styles.label}>Nome</Text>
                  <View style={[styles.inputShell, errors.name && styles.inputShellError]}>
                    <Ionicons color={colors.textMuted} name="person-outline" size={19} />
                    <TextInput
                      accessibilityLabel="Nome"
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect={false}
                      editable={!loading}
                      onChangeText={(value) => {
                        setName(value);
                        clearError("name");
                      }}
                      placeholder="Como você quer ser chamado?"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="next"
                      style={styles.input}
                      value={name}
                    />
                  </View>
                  {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputShell, errors.email && styles.inputShellError]}>
                    <Ionicons color={colors.textMuted} name="mail-outline" size={19} />
                    <TextInput
                      accessibilityLabel="Email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!loading}
                      keyboardType="email-address"
                      onChangeText={(value) => {
                        setEmail(value);
                        clearError("email");
                      }}
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
                      accessibilityLabel="Senha"
                      autoComplete="new-password"
                      editable={!loading}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearError("password");
                        if (errors.confirmPassword) clearError("confirmPassword");
                      }}
                      placeholder="Crie uma senha"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="next"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      value={password}
                    />
                    <Pressable
                      accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      accessibilityRole="button"
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

                <View style={styles.fieldLast}>
                  <Text style={styles.label}>Confirmar senha</Text>
                  <View
                    style={[
                      styles.inputShell,
                      errors.confirmPassword && styles.inputShellError,
                    ]}
                  >
                    <Ionicons color={colors.textMuted} name="shield-checkmark-outline" size={19} />
                    <TextInput
                      accessibilityLabel="Confirmar senha"
                      autoComplete="new-password"
                      editable={!loading}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        clearError("confirmPassword");
                      }}
                      onSubmitEditing={() => void handleRegister()}
                      placeholder="Digite a senha novamente"
                      placeholderTextColor={colors.textMuted}
                      returnKeyType="go"
                      secureTextEntry={!showConfirmPassword}
                      style={styles.input}
                      value={confirmPassword}
                    />
                    <Pressable
                      accessibilityLabel={
                        showConfirmPassword
                          ? "Ocultar confirmação de senha"
                          : "Mostrar confirmação de senha"
                      }
                      accessibilityRole="button"
                      hitSlop={10}
                      onPress={() => setShowConfirmPassword((current) => !current)}
                      style={styles.visibilityButton}
                    >
                      <Ionicons
                        color={colors.textSecondary}
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                      />
                    </Pressable>
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.fieldError}>{errors.confirmPassword}</Text>
                  ) : null}
                </View>

                <Pressable
                  accessibilityLabel="Criar conta"
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={() => void handleRegister()}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    loading && styles.buttonDisabled,
                    pressed && !loading && styles.primaryButtonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? "Criando conta..." : "Criar minha conta"}
                  </Text>
                  <Ionicons color={colors.background} name="arrow-forward" size={19} />
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>Já faz parte?</Text>
                  <View style={styles.divider} />
                </View>

                <Pressable
                  accessibilityLabel="Voltar para o login"
                  accessibilityRole="button"
                  disabled={loading}
                  onPress={() => router.push("/(auth)/login")}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && !loading && styles.secondaryButtonPressed,
                  ]}
                >
                  <Ionicons color={colors.textSecondary} name="log-in-outline" size={18} />
                  <Text style={styles.secondaryButtonText}>Entrar na minha conta</Text>
                </Pressable>
              </View>

              <Text style={styles.footer}>
                Ao criar sua conta, você confirma que tem pelo menos 18 anos.
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
    paddingBottom: 34,
    paddingTop: 32,
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
    marginBottom: 22,
    marginTop: 24,
  },
  eyebrow: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 38,
    lineHeight: 43,
    marginTop: 7,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 420,
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
    marginBottom: 15,
  },
  fieldLast: {
    marginBottom: 18,
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
    minHeight: 52,
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
    minHeight: 50,
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
    marginVertical: 17,
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
    flexDirection: "row",
    gap: 8,
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
    lineHeight: 15,
    marginTop: 20,
    textAlign: "center",
  },
});
