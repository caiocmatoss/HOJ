import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { resolveBackendMediaUrl } from "@/services/api";
import { useMeQuery, useUpdateProfileMutation, useUploadAvatarMutation } from "@/services/api/resources/profile";
import { MAIN_TAB_BAR_HEIGHT } from "@/features/navigation/tabBarMetrics";
import { useUserStore } from "@/store/user-store";
import { colors, fonts } from "@/theme/tokens";
import { formatBrazilianPhone, formatBrazilianPhoneInput, normalizeCityWithUf, normalizePhone } from "@/utils/profileFormat";
import { getProfileCover, setProfileCover } from "@/services/profile/profile-cover-storage";

const EDIT_PROFILE_BOTTOM_GAP = 24;

export default function FigmaEditProfileExperience() {
  const legacyUser = useUserStore((s) => s.user);
  const meQuery = useMeQuery();
  const user = meQuery.data ?? legacyUser;
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const setUser = useUserStore((s) => s.setUser);
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [phone, setPhone] = useState(formatBrazilianPhone(user?.phone));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  useEffect(() => { if (user?.id) void getProfileCover(user.id).then(setCoverUri); }, [user?.id]);
  useEffect(() => { if (user) { setName(user.name ?? ""); setUsername(user.username ?? ""); setBio(user.bio ?? ""); setCity(user.city ?? ""); setPhone(formatBrazilianPhone(user.phone)); } }, [user]);
  if (!user) return null;
  const save = async () => {
    const value = name.trim();
    if (!value) { setError("Digite seu nome para continuar."); return; }
    const normalizedUsername = username.trim().replace(/^@+/, "").toLowerCase();
    if (normalizedUsername && !/^[a-z0-9._]{3,30}$/.test(normalizedUsername)) { setError("Use um nome de usuário com 3 a 30 caracteres: letras, números, ponto ou _. "); return; }
    let normalizedCity: string | null;
    let normalizedPhone: string;
    try { normalizedCity = normalizeCityWithUf(city); normalizedPhone = normalizePhone(phone); }
    catch (validationError) { setError(validationError instanceof Error ? validationError.message : "Confira os dados informados."); return; }
    if (normalizedPhone && !/^\+?[0-9]{8,20}$/.test(normalizedPhone)) { setError("Digite um telefone válido."); return; }
    setSaving(true); setError("");
    try { const updated = await updateProfileMutation.mutateAsync({ name: value, username: normalizedUsername || null, bio: bio.trim(), city: normalizedCity, phone: normalizedPhone || null }); setUser(updated); router.replace("/(main)/profile"); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível salvar as alterações."); }
    finally { setSaving(false); }
  };
  const pickAvatar = async () => {
    if (uploadingAvatar) return;
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setError("Permissão para acessar suas fotos não foi concedida."); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled || !result.assets[0]) return;
    setUploadingAvatar(true); setError("");
    try {
      const asset = result.assets[0];
      setUser(await uploadAvatarMutation.mutateAsync({
        uri: asset.uri,
        fileName: asset.fileName ?? asset.file?.name ?? null,
        mimeType: asset.mimeType ?? asset.file?.type ?? null,
        file: asset.file ?? null,
      }));
    }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar sua foto."); }
    finally { setUploadingAvatar(false); }
  };
  const pickCover = async () => {
    if (!user) return;
    if (Platform.OS !== "web") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { setError("Permissão para acessar suas fotos não foi concedida."); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [3, 1], quality: 0.85 });
    if (result.canceled || !result.assets[0]) return;
    try {
      const asset = result.assets[0];
      const persistedUri = await setProfileCover(user.id, {
        uri: asset.uri,
        file: asset.file ?? null,
      });
      setCoverUri(persistedUri);
      setError("");
    }
    catch { setError("Não foi possível atualizar sua capa."); }
  };
  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.root}>
    <View style={styles.header}><Pressable accessibilityLabel="Voltar" disabled={saving} onPress={() => router.replace(returnTo === "privacy" ? "/(main)/privacy" : "/(main)/profile")} style={styles.back}><Ionicons name="arrow-back" size={20} color={colors.brand} /></Pressable><Text style={styles.headerTitle}>Editar perfil</Text></View>
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: MAIN_TAB_BAR_HEIGHT + EDIT_PROFILE_BOTTOM_GAP }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.avatarSection}>
        <Avatar
          name={name || user.name}
          uri={resolveBackendMediaUrl(user.avatar)}
          uploading={uploadingAvatar}
          onPress={pickAvatar}
        />
        <Pressable disabled={uploadingAvatar} onPress={() => void pickAvatar()}>
          <Text style={styles.changePhoto}>Trocar foto</Text>
        </Pressable>
        <Pressable onPress={() => void pickCover()} style={styles.coverAction}>
          <Ionicons name="image-outline" size={15} color={colors.brand} />
          <Text style={styles.coverActionText}>{coverUri ? "Alterar capa" : "Adicionar capa"}</Text>
        </Pressable>
      </View>
      <SectionTitle>Informações pessoais</SectionTitle>
      <Field label="Nome completo" value={name} onChangeText={(v) => { setName(v); setError(""); }} placeholder="Seu nome" />
      <Field label="Nome de usuário" value={username ? `@${username.replace(/^@+/, "")}` : ""} onChangeText={(v) => { setUsername(v); setError(""); }} placeholder="@username" autoCapitalize="none" />
      <Field label="Bio" value={bio} onChangeText={setBio} placeholder="Conte um pouco sobre você…" multiline />
      <SectionTitle>Contato</SectionTitle>
      <Field label="Cidade, UF" value={city} onChangeText={setCity} placeholder="Sua cidade, UF" />
      <Field label="Telefone" value={phone} onChangeText={(v) => setPhone(formatBrazilianPhoneInput(v, phone))} placeholder="" keyboardType="phone-pad" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" disabled={saving} onPress={() => void save()} style={[styles.save, saving && styles.saveDisabled]}>{saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveText}>Salvar</Text>}</Pressable>
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Avatar({ name, uri, uploading, onPress }: { name: string; uri?: string | null; uploading: boolean; onPress: () => void }) { const [failed, setFailed] = useState(false); useEffect(() => { setFailed(false); }, [uri]); const content = uri && !failed ? <View style={styles.avatarBorder}><Image onError={() => setFailed(true)} source={{ uri }} style={styles.avatarImage} /></View> : <LinearGradient colors={[colors.brand, colors.brandSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}><Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text></LinearGradient>; return <View style={styles.avatarWrap}><Pressable disabled={uploading} onPress={onPress}>{content}</Pressable><Pressable disabled={uploading} onPress={onPress} style={styles.camera}><Ionicons name="camera" size={14} color={colors.background} /></Pressable>{uploading ? <View style={styles.avatarLoading}><ActivityIndicator color={colors.background} size="small" /></View> : null}</View>; }
function SectionTitle({ children }: { children: string }) { return <Text style={styles.sectionTitle}>{children}</Text>; }
function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, autoCapitalize }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: "phone-pad"; autoCapitalize?: "none" }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput autoCapitalize={autoCapitalize} keyboardType={keyboardType} multiline={multiline} numberOfLines={multiline ? 3 : 1} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={[styles.input, multiline && styles.bio]} textAlignVertical={multiline ? "top" : "center"} value={value} /></View>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { height: 47, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.06)" },
  back: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 20 },
  avatarSection: { alignItems: "center", paddingTop: 20, paddingBottom: 24 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.elevated },
  avatarBorder: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: colors.elevated, overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%", backgroundColor: colors.surface },
  avatarInitial: { color: colors.background, fontFamily: fonts.bold, fontSize: 30 },
  avatarWrap: { position: "relative" },
  camera: { position: "absolute", right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.brand, borderWidth: 2, borderColor: colors.background },
  avatarLoading: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  changePhoto: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 13, marginTop: 10 },
  coverAction: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 12 },
  coverActionText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 12 },
  sectionTitle: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.1, marginTop: 20, marginBottom: 8, textTransform: "uppercase" },
  field: { gap: 5, marginBottom: 10 },
  label: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.36 },
  input: { height: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.regular, fontSize: 15, paddingHorizontal: 16 },
  bio: { height: 104, paddingTop: 12, paddingBottom: 12 },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  save: { height: 50, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: colors.brand, marginTop: 24 },
  saveDisabled: { backgroundColor: "#C9A235" },
  saveText: { color: colors.background, fontFamily: fonts.bold, fontSize: 15 },
});