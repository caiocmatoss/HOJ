import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import {
  useState,
} from "react";

import {
  useUserStore,
} from "@/store/user-store";

import {
  useLocationStore,
} from "@/store/location-store";

import {
  usePresenceStore,
} from "@/store/presence-store";

export default function EditProfileScreen() {
  const {
    user,
    updateName,
    updateBio,
    updateAvatar,
  } = useUserStore();

  const {
    latitude,
    longitude,
  } = useLocationStore();

  const {
    visible,
    setVisible,
  } = usePresenceStore();

  const [
    name,
    setName,
  ] = useState(user.name);

  const [
    bio,
    setBio,
  ] = useState(user.bio);

  const [
    avatar,
    setAvatar,
  ] = useState(user.avatar);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const handleSave = () => {
    const trimmedName = name.trim();
    const trimmedBio = bio.trim();
    const trimmedAvatar = avatar.trim();

    if (!trimmedName) {
      setError("Digite seu nome.");
      return;
    }

    setError("");
    setSaving(true);

    updateName(trimmedName);
    updateBio(trimmedBio);

    if (trimmedAvatar) {
      updateAvatar(trimmedAvatar);
    }

    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 300);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>
        Editar perfil
      </Text>

      <Text style={styles.label}>
        Nome
      </Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Digite seu nome"
        placeholderTextColor="#777777"
        maxLength={50}
        autoCapitalize="words"
      />

      <Text style={styles.label}>
        Bio
      </Text>

      <TextInput
        style={styles.bioInput}
        value={bio}
        onChangeText={setBio}
        placeholder="Conte um pouco sobre você..."
        placeholderTextColor="#777777"
        multiline
        maxLength={160}
        textAlignVertical="top"
      />

      <Text style={styles.label}>
        Avatar
      </Text>

      <TextInput
        style={styles.input}
        value={avatar}
        onChangeText={setAvatar}
        placeholder="URL da imagem"
        placeholderTextColor="#777777"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Localização
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            Localização atual
          </Text>

          <Text style={styles.infoText}>
            {latitude !== null &&
            longitude !== null
              ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              : "Localização não disponível"}
          </Text>
        </View>

        <Text style={styles.helperText}>
          A localização é atualizada pelo sistema
          de localização do aplicativo.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.visibilityRow}>
          <View style={styles.visibilityInfo}>
            <Text style={styles.sectionTitle}>
              Visibilidade
            </Text>

            <Text style={styles.helperText}>
              Permitir que seus amigos vejam sua
              presença.
            </Text>
          </View>

          <Switch
            value={visible}
            onValueChange={setVisible}
            trackColor={{
              false: "#333333",
              true: "#8C7000",
            }}
            thumbColor={
              visible
                ? "#FFC400"
                : "#AAAAAA"
            }
          />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.infoTitle}>
            Status atual
          </Text>

          <Text
            style={[
              styles.statusText,
              visible
                ? styles.visible
                : styles.hidden,
            ]}
          >
            {visible
              ? "Visível para amigos"
              : "Oculto para amigos"}
          </Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        style={({ pressed }) => [
          styles.saveButton,
          pressed &&
            !saving &&
            styles.pressed,
          saving &&
            styles.disabledButton,
        ]}
      >
        <Text style={styles.saveButtonText}>
          {saving
            ? "Salvando..."
            : "Salvar alterações"}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        disabled={saving}
        style={({ pressed }) => [
          styles.cancelButton,
          pressed &&
            !saving &&
            styles.pressed,
        ]}
      >
        <Text style={styles.cancelButtonText}>
          Cancelar
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    color: "#FFC400",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 26,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    backgroundColor: "#1B1B1B",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#292929",
    fontSize: 16,
  },

  bioInput: {
    backgroundColor: "#1B1B1B",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#292929",
    height: 130,
    fontSize: 16,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  infoCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#292929",
  },

  infoTitle: {
    color: "#FFC400",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },

  infoText: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  helperText: {
    color: "#888888",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  visibilityInfo: {
    flex: 1,
  },

  statusCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#292929",
  },

  statusText: {
    fontSize: 15,
    fontWeight: "700",
  },

  visible: {
    color: "#4CAF50",
  },

  hidden: {
    color: "#FF9800",
  },

  errorContainer: {
    backgroundColor: "#351414",
    borderRadius: 14,
    padding: 14,
    marginTop: 20,
  },

  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },

  saveButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },

  cancelButton: {
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.8,
  },
});