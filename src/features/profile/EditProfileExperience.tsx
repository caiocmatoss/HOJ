import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { updateMyUser } from "@/services/api";
import { useLocationStore } from "@/store/location-store";
import { usePresenceStore } from "@/store/presence-store";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";

export default function EditProfileExperience() {
  const { user, setUser } = useUserStore();
  const { latitude, longitude } = useLocationStore();
  const storedVisible = usePresenceStore((state) => state.visible);
  const setStoredVisible = usePresenceStore((state) => state.setVisible);

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [visible, setVisible] = useState(storedVisible);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }

    setName(user.name ?? "");
    setBio(user.bio ?? "");
    setAvatar(user.avatar ?? "");
  }, [user]);

  useEffect(() => {
    setVisible(storedVisible);
  }, [storedVisible, user?.id]);

  const locationLabel = useMemo(() => {
    if (latitude === null || longitude === null) {
      return "Localização ainda não disponível";
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }, [latitude, longitude]);

  if (!user) {
    return null;
  }

  const handleBackToProfile = () => {
    if (!saving) {
      router.replace("/(main)/profile");
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedBio = bio.trim();

    if (!trimmedName) {
      setError("Digite seu nome para continuar.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const updatedUser = await updateMyUser({
        name: trimmedName,
        bio: trimmedBio,
      });

      setStoredVisible(visible);
      setUser(updatedUser);
      router.replace("/(main)/profile");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setSaving(false);
    }
  };

  const previewAvatar = avatar.trim() || user.avatar || null;
  const previewName = name.trim() || user.name || "Seu nome";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <ScreenContainer maxWidth={760}>
          <ScreenHeading
            action={
              <Pressable
                accessibilityLabel="Voltar para o perfil"
                accessibilityRole="button"
                accessibilityState={{ disabled: saving }}
                disabled={saving}
                hitSlop={10}
                onPress={handleBackToProfile}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && !saving && styles.pressed,
                ]}
              >
                <Ionicons color={colors.text} name="close" size={22} />
              </Pressable>
            }
            eyebrow="Seu perfil"
            subtitle="Ajuste como seu perfil aparece para amigos e pessoas por perto."
            title="Editar perfil"
          />

          <View style={styles.previewCard}>
            <View style={styles.avatarRing}>
              <UserAvatar name={previewName} size={88} uri={previewAvatar} />
              <View style={styles.cameraBadge}>
                <Ionicons color={colors.background} name="camera" size={15} />
              </View>
            </View>

            <View style={styles.previewCopy}>
              <Text numberOfLines={1} style={styles.previewName}>
                {previewName}
              </Text>
              <Text numberOfLines={2} style={styles.previewBio}>
                {bio.trim() || "Conte um pouco sobre você."}
              </Text>
              <Text style={styles.previewHint}>Prévia do seu perfil</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons color={colors.brand} name="person-outline" size={18} />
              </View>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Informações pessoais</Text>
                <Text style={styles.sectionSubtitle}>
                  Essas informações ficam visíveis no seu perfil.
                </Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Nome</Text>
                <Text style={styles.counter}>{name.length}/50</Text>
              </View>
              <View style={styles.inputShell}>
                <Ionicons color={colors.textMuted} name="person-outline" size={19} />
                <TextInput
                  accessibilityLabel="Nome"
                  autoCapitalize="words"
                  maxLength={50}
                  onChangeText={(value) => {
                    setName(value);
                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Como você quer ser chamado?"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                  style={styles.input}
                  value={name}
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Bio</Text>
                <Text style={styles.counter}>{bio.length}/160</Text>
              </View>
              <TextInput
                accessibilityLabel="Biografia"
                maxLength={160}
                multiline
                onChangeText={setBio}
                placeholder="Conte sobre você, seus rolês e o que gosta de fazer."
                placeholderTextColor={colors.textMuted}
                style={styles.bioInput}
                textAlignVertical="top"
                value={bio}
              />
            </View>

            <View style={styles.fieldLast}>
              <Text style={styles.label}>Foto de perfil</Text>
              <View style={styles.inputShell}>
                <Ionicons color={colors.textMuted} name="image-outline" size={19} />
                <TextInput
                  accessibilityLabel="Endereço da foto de perfil"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  onChangeText={setAvatar}
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  value={avatar}
                />
              </View>
              <Text style={styles.helperText}>
                Cole o endereço de uma imagem. Se deixar vazio, sua foto atual será mantida.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons color={colors.brand} name="location-outline" size={18} />
              </View>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Localização e presença</Text>
                <Text style={styles.sectionSubtitle}>
                  Controle quando seus amigos podem encontrar você.
                </Text>
              </View>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons color={colors.textSecondary} name="navigate-outline" size={19} />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Localização atual</Text>
                <Text style={styles.settingDescription}>{locationLabel}</Text>
              </View>
              <View style={styles.automaticBadge}>
                <Text style={styles.automaticText}>Automática</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  visible ? styles.settingIconActive : styles.settingIconInactive,
                ]}
              >
                <Ionicons
                  color={visible ? colors.brand : colors.textMuted}
                  name={visible ? "eye-outline" : "eye-off-outline"}
                  size={19}
                />
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Visível para amigos</Text>
                <Text style={styles.settingDescription}>
                  {visible
                    ? "Seus amigos podem ver sua presença."
                    : "Sua presença está oculta no momento."}
                </Text>
              </View>
              <Switch
                accessibilityLabel="Visibilidade para amigos"
                accessibilityRole="switch"
                accessibilityState={{ checked: visible }}
                ios_backgroundColor={colors.elevated}
                onValueChange={setVisible}
                thumbColor={visible ? colors.brand : colors.textSecondary}
                trackColor={{ false: colors.elevated, true: colors.brandBorder }}
                value={visible}
              />
            </View>

            <View style={styles.locationNote}>
              <Ionicons color={colors.textMuted} name="information-circle-outline" size={17} />
              <Text style={styles.locationNoteText}>
                A localização é atualizada automaticamente pelas permissões do aplicativo.
              </Text>
            </View>
          </View>

          {error ? (
            <View accessibilityLiveRegion="polite" style={styles.feedbackWrapper}>
              <FeedbackMessage
                message={error}
                title="Não foi possível salvar"
                type="error"
              />
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Salvar alterações do perfil"
              accessibilityRole="button"
              accessibilityState={{ busy: saving, disabled: saving }}
              disabled={saving}
              onPress={() => {
                void handleSave();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && !saving && styles.saveButtonPressed,
                saving && styles.disabledButton,
              ]}
            >
              {saving ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Ionicons color={colors.background} name="checkmark" size={20} />
              )}
              <Text style={styles.saveButtonText}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Cancelar edição do perfil"
              accessibilityRole="button"
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={handleBackToProfile}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && !saving && styles.pressed,
              ]}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 56,
    paddingTop: 24,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  pressed: {
    opacity: 0.72,
  },
  previewCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 24,
    padding: 20,
    ...shadows.floating,
  },
  avatarRing: {
    borderColor: colors.brandBorder,
    borderRadius: 50,
    borderWidth: 2,
    padding: 4,
    position: "relative",
  },
  cameraBadge: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderColor: colors.surface,
    borderRadius: 15,
    borderWidth: 3,
    bottom: 0,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 30,
  },
  previewCopy: {
    flex: 1,
    marginLeft: 18,
    minWidth: 0,
  },
  previewName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 27,
  },
  previewBio: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  previewHint: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 1.15,
    marginTop: 10,
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 18,
    padding: 20,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 20,
  },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sectionCopy: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 21,
  },
  sectionSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  field: {
    marginBottom: 18,
  },
  fieldLast: {},
  labelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.semibold,
    fontSize: 13,
    marginBottom: 8,
  },
  counter: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginBottom: 8,
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 52,
    paddingHorizontal: 15,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    marginLeft: 11,
    minHeight: 50,
    paddingVertical: 13,
  },
  bioInput: {
    backgroundColor: colors.background,
    borderColor: colors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 116,
    padding: 15,
  },
  helperText: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  settingIcon: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  settingIconActive: {
    backgroundColor: colors.brandSoft,
  },
  settingIconInactive: {
    backgroundColor: colors.elevated,
  },
  settingCopy: {
    flex: 1,
    marginHorizontal: 12,
  },
  settingTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  settingDescription: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  automaticBadge: {
    backgroundColor: colors.elevated,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  automaticText: {
    color: colors.textSecondary,
    fontFamily: fonts.semibold,
    fontSize: 10,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 18,
  },
  locationNote: {
    alignItems: "flex-start",
    backgroundColor: colors.elevated,
    borderRadius: radii.small,
    flexDirection: "row",
    marginTop: 18,
    padding: 12,
  },
  locationNoteText: {
    color: colors.textMuted,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 8,
  },
  feedbackWrapper: {
    marginTop: 18,
  },
  actions: {
    marginTop: 24,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 20,
  },
  saveButtonPressed: {
    backgroundColor: colors.brandPressed,
  },
  disabledButton: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: "center",
    borderRadius: radii.medium,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 48,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
});
