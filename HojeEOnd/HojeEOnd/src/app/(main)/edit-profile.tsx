import {
  useState,
} from "react";

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

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

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
  ] = useState(
    user.name,
  );

  const [
    bio,
    setBio,
  ] = useState(
    user.bio,
  );

  const [
    avatar,
    setAvatar,
  ] = useState(
    user.avatar,
  );

  const [
    saving,
    setSaving,
  ] = useState(
    false,
  );

  const [
    error,
    setError,
  ] = useState("");

  const handleBackToProfile = () => {
    router.replace(
      "/(main)/profile",
    );
  };

  const handleSave = () => {
    const trimmedName =
      name.trim();

    const trimmedBio =
      bio.trim();

    const trimmedAvatar =
      avatar.trim();

    if (!trimmedName) {
      setError(
        "Digite seu nome.",
      );

      return;
    }

    setError("");
    setSaving(true);

    updateName(
      trimmedName,
    );

    updateBio(
      trimmedBio,
    );

    if (trimmedAvatar) {
      updateAvatar(
        trimmedAvatar,
      );
    }

    setTimeout(() => {
      setSaving(false);

      router.replace(
        "/(main)/profile",
      );
    }, 300);
  };

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.scrollContent
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={
        false
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
          <Pressable
            onPress={
              handleBackToProfile
            }
            disabled={
              saving
            }
            style={({
              pressed,
            }) => [
              styles.topBackButton,

              pressed &&
                !saving &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.topBackButtonText
              }
            >
              ← Voltar para o perfil
            </Text>
          </Pressable>

          <Text
            style={
              styles.title
            }
          >
            Editar perfil
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Atualize suas informações e escolha
            como você aparece para seus amigos.
          </Text>

          <View
            style={
              styles.formCard
            }
          >
            <Text
              style={
                styles.label
              }
            >
              Nome
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                name
              }
              onChangeText={(
                value,
              ) => {
                setName(
                  value,
                );

                if (error) {
                  setError("");
                }
              }}
              placeholder="Digite seu nome"
              placeholderTextColor="#777777"
              maxLength={50}
              autoCapitalize="words"
            />

            <Text
              style={
                styles.counter
              }
            >
              {name.length}/50
            </Text>

            <Text
              style={
                styles.label
              }
            >
              Bio
            </Text>

            <TextInput
              style={
                styles.bioInput
              }
              value={
                bio
              }
              onChangeText={
                setBio
              }
              placeholder="Conte um pouco sobre você..."
              placeholderTextColor="#777777"
              multiline
              maxLength={160}
              textAlignVertical="top"
            />

            <Text
              style={
                styles.counter
              }
            >
              {bio.length}/160
            </Text>

            <Text
              style={
                styles.label
              }
            >
              Avatar
            </Text>

            <TextInput
              style={
                styles.input
              }
              value={
                avatar
              }
              onChangeText={
                setAvatar
              }
              placeholder="URL da imagem"
              placeholderTextColor="#777777"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View
            style={
              styles.sectionCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Localização
            </Text>

            <View
              style={
                styles.infoCard
              }
            >
              <Text
                style={
                  styles.infoTitle
                }
              >
                Localização atual
              </Text>

              <Text
                style={
                  styles.infoText
                }
              >
                {latitude !== null &&
                longitude !== null
                  ? `${latitude.toFixed(
                      4,
                    )}, ${longitude.toFixed(
                      4,
                    )}`
                  : "Localização não disponível"}
              </Text>
            </View>

            <Text
              style={
                styles.helperText
              }
            >
              A localização é atualizada
              automaticamente pelo sistema de
              localização do aplicativo.
            </Text>
          </View>

          <View
            style={
              styles.sectionCard
            }
          >
            <View
              style={
                styles.visibilityRow
              }
            >
              <View
                style={
                  styles.visibilityInfo
                }
              >
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Visibilidade
                </Text>

                <Text
                  style={
                    styles.helperTextNoMargin
                  }
                >
                  Permitir que seus amigos vejam sua
                  presença.
                </Text>
              </View>

              <Switch
                value={
                  visible
                }
                onValueChange={
                  setVisible
                }
                trackColor={{
                  false:
                    "#333333",

                  true:
                    "#8C7000",
                }}
                thumbColor={
                  visible
                    ? "#FFC400"
                    : "#AAAAAA"
                }
              />
            </View>

            <View
              style={
                styles.statusCard
              }
            >
              <Text
                style={
                  styles.infoTitle
                }
              >
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
            <View
              style={
                styles.feedbackWrapper
              }
            >
              <FeedbackMessage
                type="error"
                title="Não foi possível salvar"
                message={
                  error
                }
              />
            </View>
          ) : null}

          <Pressable
            onPress={
              handleSave
            }
            disabled={
              saving
            }
            style={({
              pressed,
            }) => [
              styles.saveButton,

              pressed &&
                !saving &&
                styles.pressed,

              saving &&
                styles.disabledButton,
            ]}
          >
            <Text
              style={
                styles.saveButtonText
              }
            >
              {saving
                ? "Salvando..."
                : "Salvar alterações"}
            </Text>
          </Pressable>

          <Pressable
            onPress={
              handleBackToProfile
            }
            disabled={
              saving
            }
            style={({
              pressed,
            }) => [
              styles.cancelButton,

              pressed &&
                !saving &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.cancelButtonText
              }
            >
              Cancelar
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#090909",
    },

    scrollContent: {
      paddingTop: 20,
      paddingBottom: 50,
    },

    content: {
      width: "100%",
    },

    topBackButton: {
      alignSelf:
        "flex-start",

      paddingVertical: 8,
      paddingHorizontal: 4,
      marginBottom: 10,
    },

    topBackButtonText: {
      color:
        "#FFFFFF",

      fontSize: 15,
      fontWeight: "700",
    },

    title: {
      color:
        "#FFC400",

      fontSize: 30,
      fontWeight: "800",
    },

    subtitle: {
      color:
        "#888888",

      fontSize: 14,
      lineHeight: 20,

      marginTop: 6,
      marginBottom: 22,
    },

    formCard: {
      backgroundColor:
        "#1B1B1B",

      borderRadius: 18,

      borderWidth: 1,
      borderColor:
        "#292929",

      padding: 18,
    },

    label: {
      color:
        "#FFFFFF",

      fontSize: 15,
      fontWeight: "700",

      marginBottom: 8,
      marginTop: 16,
    },

    input: {
      backgroundColor:
        "#151515",

      borderRadius: 14,

      paddingHorizontal: 16,
      paddingVertical: 14,

      color:
        "#FFFFFF",

      borderWidth: 1,
      borderColor:
        "#292929",

      fontSize: 16,
    },

    bioInput: {
      backgroundColor:
        "#151515",

      borderRadius: 14,

      paddingHorizontal: 16,
      paddingVertical: 14,

      color:
        "#FFFFFF",

      borderWidth: 1,
      borderColor:
        "#292929",

      minHeight: 130,

      fontSize: 16,
    },

    counter: {
      color:
        "#666666",

      fontSize: 11,

      textAlign:
        "right",

      marginTop: 5,
    },

    sectionCard: {
      backgroundColor:
        "#1B1B1B",

      borderRadius: 18,

      padding: 18,

      marginTop: 18,

      borderWidth: 1,
      borderColor:
        "#292929",
    },

    sectionTitle: {
      color:
        "#FFFFFF",

      fontSize: 18,
      fontWeight: "800",

      marginBottom: 8,
    },

    infoCard: {
      backgroundColor:
        "#151515",

      borderRadius: 16,

      padding: 16,

      borderWidth: 1,
      borderColor:
        "#292929",
    },

    infoTitle: {
      color:
        "#FFC400",

      fontSize: 14,
      fontWeight: "800",

      marginBottom: 6,
    },

    infoText: {
      color:
        "#FFFFFF",

      fontSize: 15,
    },

    helperText: {
      color:
        "#888888",

      fontSize: 13,
      lineHeight: 19,

      marginTop: 8,
    },

    helperTextNoMargin: {
      color:
        "#888888",

      fontSize: 13,
      lineHeight: 19,
    },

    visibilityRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      gap: 16,
    },

    visibilityInfo: {
      flex: 1,
    },

    statusCard: {
      backgroundColor:
        "#151515",

      borderRadius: 16,

      padding: 16,

      marginTop: 16,

      borderWidth: 1,
      borderColor:
        "#292929",
    },

    statusText: {
      fontSize: 15,
      fontWeight: "700",
    },

    visible: {
      color:
        "#4CAF50",
    },

    hidden: {
      color:
        "#FF9800",
    },

    feedbackWrapper: {
      marginTop: 20,
    },

    saveButton: {
      backgroundColor:
        "#FFC400",

      borderRadius: 14,

      paddingVertical: 16,

      alignItems:
        "center",

      marginTop: 24,
    },

    disabledButton: {
      opacity: 0.5,
    },

    saveButtonText: {
      color:
        "#000000",

      fontSize: 16,
      fontWeight: "800",
    },

    cancelButton: {
      backgroundColor:
        "#151515",

      borderWidth: 1,
      borderColor:
        "#333333",

      borderRadius: 14,

      paddingVertical: 16,

      alignItems:
        "center",

      marginTop: 12,
    },

    cancelButtonText: {
      color:
        "#FFFFFF",

      fontSize: 16,
      fontWeight: "700",
    },

    pressed: {
      opacity: 0.8,
    },
  });