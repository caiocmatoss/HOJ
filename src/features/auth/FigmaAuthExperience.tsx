import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { login, register } from "@/services/api/auth";
import { connectSocket } from "@/services/socket";
import { useUserStore } from "@/store/user-store";
import { colors, fonts } from "@/theme/tokens";

export type AuthMode = "login" | "signup";

type Props = { mode: AuthMode };
type Errors = Partial<Record<"name" | "email" | "password" | "general", string>>;

const BACKGROUND_IMAGE =
  "https://images.unsplash.com/photo-1544411047-c491e34a24e0?w=780&h=1688&fit=crop&auto=format";

export default function FigmaAuthExperience({ mode }: Props) {
  const insets = useSafeAreaInsets();
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const clearError = (field: keyof Errors) => {
    if (!errors[field] && !errors.general) return;
    setErrors((current) => ({ ...current, [field]: undefined, general: undefined }));
  };

  const submit = async () => {
    if (loading) return;
    const next: Errors = {};
    const normalizedEmail = email.trim().toLowerCase();
    if (!isLogin && name.trim().length < 2) next.name = "Informe seu nome completo.";
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) next.email = "Digite um e-mail válido.";
    if (!password) next.password = "Informe sua senha.";
    else if (password.length < 6) next.password = "A senha precisa ter pelo menos 6 caracteres.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    try {
      setLoading(true);
      setErrors({});
      const result = isLogin
        ? await login(normalizedEmail, password)
        : await register(name.trim(), normalizedEmail, password);
      if (!result.user || !result.accessToken) throw new Error("Não foi possível concluir a autenticação.");
      connectSocket();
      router.replace("/(main)/home");
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : "Não foi possível concluir. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Image source={{ uri: BACKGROUND_IMAGE }} style={[StyleSheet.absoluteFill, styles.backgroundImage]} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(11,13,15,0.30)", "rgba(11,13,15,0.55)", "rgba(11,13,15,0.96)", colors.background]}
        locations={[0, 0.35, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.hero}>
              <View testID="auth-wordmark" style={styles.wordmark}>
                <View style={styles.wordmarkRow}><View style={styles.dot} /><Text style={styles.wordmarkText}>hoje é onde</Text><View style={styles.dot} /></View>
                <Text testID="auth-headline" style={styles.headline}>O que está{"\n"}<Text style={styles.highlight}>acontecendo</Text>{"\n"}aí fora?</Text>
              </View>
            </View>
            <View style={[styles.formArea, { paddingBottom: Math.max(28, insets.bottom) }]}>
              <View testID="auth-segmented" style={styles.segmented}>
                {(["login", "signup"] as AuthMode[]).map((item) => (
                  <Pressable key={item} onPress={() => router.replace(item === "login" ? "/(auth)/login" : "/(auth)/register")} style={[styles.segment, item === mode && styles.segmentActive]}>
                    <Text style={[styles.segmentText, item === mode && styles.segmentTextActive]}>{item === "login" ? "Entrar" : "Criar conta"}</Text>
                  </Pressable>
                ))}
              </View>
              {errors.general ? <Text style={styles.generalError}>{errors.general}</Text> : null}
              {!isLogin ? <Field label="Nome completo" value={name} onChange={(v) => { setName(v); clearError("name"); }} placeholder="Como você se chama?" error={errors.name} /> : null}
              <Field label="E-mail" value={email} onChange={(v) => { setEmail(v); clearError("email"); }} placeholder="seu@email.com" keyboardType="email-address" error={errors.email} />
              <Field label="Senha" value={password} onChange={(v) => { setPassword(v); clearError("password"); }} placeholder={isLogin ? "••••••••" : "Mínimo 8 caracteres"} secure={!showPassword} error={errors.password} onToggle={() => setShowPassword((v) => !v)} />
              {isLogin ? <>
                <Pressable accessibilityRole="button" onPress={() => Alert.alert("Recuperação de senha", "Recuperação de senha ainda não está disponível.")} style={styles.forgotButton}>
                  <Text style={styles.forgotText}>Esqueceu a senha?</Text>
                </Pressable>
              </> : null}
              <Pressable testID="auth-submit" disabled={loading} onPress={() => void submit()} style={[styles.submit, loading && styles.submitLoading]}>
                {loading ? <ActivityIndicator color={colors.background} size="small" /> : <Text style={styles.submitText}>{isLogin ? "Entrar agora" : "Criar minha conta"}</Text>}
              </Pressable>
              <Text style={styles.legal}>Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChange, placeholder, secure, onToggle, error, keyboardType }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; secure?: boolean; onToggle?: () => void; error?: string; keyboardType?: "email-address" | "default" }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={[styles.inputWrap, error && styles.inputError]}><TextInput autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"} autoCorrect={false} keyboardType={keyboardType} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textMuted} secureTextEntry={secure} style={styles.input} value={value} />{onToggle ? <Pressable accessibilityLabel={secure ? "Mostrar senha" : "Ocultar senha"} onPress={onToggle} style={styles.eye}><Ionicons color={colors.textMuted} name={secure ? "eye-outline" : "eye-off-outline"} size={18} /></Pressable> : null}</View>{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: "hidden" },
  backgroundImage: { opacity: 0.45 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  content: { flex: 1, minHeight: 844, paddingHorizontal: 28 },
  hero: { flex: 1, minHeight: 360, alignItems: "center", justifyContent: "flex-end", paddingBottom: 36 },
  wordmark: { alignItems: "center", gap: 6 },
  wordmarkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { display: "none", width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand },
  wordmarkText: { color: colors.brand, fontFamily: fonts.display, fontSize: 11, fontWeight: "400", letterSpacing: 2.4, textTransform: "uppercase" },
  headline: { color: colors.text, fontFamily: fonts.display, fontSize: 42, lineHeight: 42, letterSpacing: -1, textAlign: "center" },
  highlight: { color: colors.brand },
  formArea: {},
  segmented: { flexDirection: "row", padding: 4, marginBottom: 20, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  segment: { flex: 1, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  segmentActive: { backgroundColor: colors.elevated },
  segmentText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 14 },
  segmentTextActive: { color: colors.text, fontFamily: fonts.semibold },
  generalError: { color: colors.danger, fontFamily: fonts.regular, fontSize: 12, marginBottom: 8 },
  field: { gap: 5, marginBottom: 10 },
  forgotButton: { alignSelf: "flex-end", marginBottom: 6, paddingVertical: 2 },
  forgotText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 13 },
  label: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.36 },
  inputWrap: { height: 50, flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  inputError: { borderColor: colors.danger },
  input: { flex: 1, height: "100%", paddingHorizontal: 16, color: colors.text, fontFamily: fonts.regular, fontSize: 15 },
  eye: { width: 42, height: "100%", alignItems: "center", justifyContent: "center" },
  eyeText: { color: colors.textMuted, fontSize: 18 },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 11 },
  submit: { height: 52, alignItems: "center", justifyContent: "center", marginTop: 10, borderRadius: 16, backgroundColor: colors.brand },
  submitLoading: { backgroundColor: "#C9A235" },
  submitText: { color: colors.background, fontFamily: fonts.bold, fontSize: 16 },
  legal: { marginTop: 20, color: colors.textMuted, fontFamily: fonts.regular, fontSize: 11, lineHeight: 17, textAlign: "center" },
});
