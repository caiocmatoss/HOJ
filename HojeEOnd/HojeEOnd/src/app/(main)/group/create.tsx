import {
  useMemo,
  useState,
} from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  router,
} from "expo-router";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { venues } from "@/data/venues";

import { useGroupStore } from "@/store/group-store";
import { useUserStore } from "@/store/user-store";

export default function CreateGroupScreen() {
  const createGroup =
    useGroupStore(
      (state) =>
        state.createGroup,
    );

  const user =
    useUserStore(
      (state) =>
        state.user,
    );

  const [
    name,
    setName,
  ] = useState("");

  const [
    selectedVenueId,
    setSelectedVenueId,
  ] = useState<string | null>(
    null,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const availableVenues =
    useMemo(
      () => venues,
      [],
    );

  const handleBackToGroups = () => {
    router.replace(
      "/(main)/groups",
    );
  };

  const handleCreate = () => {
    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "Digite um nome para o grupo.",
      );

      return;
    }

    if (!selectedVenueId) {
      setError(
        "Escolha um local para o grupo.",
      );

      return;
    }

    if (!user) {
      setError(
        "Usuário não encontrado.",
      );

      return;
    }

    setError("");
    setSaving(true);

    const newGroup = {
      id:
        `group-${Date.now()}`,

      name:
        trimmedName,

      venueId:
        selectedVenueId,

      members: [
        user.id,
      ],
    };

    createGroup(
      newGroup,
    );

    setSaving(false);

    router.replace(
      "/(main)/groups",
    );
  };

  return (
    <ScrollView
      style={
        styles.container
      }
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
      keyboardShouldPersistTaps="handled"
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
              handleBackToGroups
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
              ← Voltar para grupos
            </Text>
          </Pressable>

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
              Criar grupo
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Escolha um nome e um local para
              organizar sua próxima saída.
            </Text>
          </View>

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
              Nome do grupo
            </Text>

            <TextInput
              value={name}
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
              placeholder="Ex.: Rolê de sexta"
              placeholderTextColor="#777777"
              style={
                styles.input
              }
              maxLength={50}
              autoCapitalize="sentences"
              returnKeyType="done"
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
              Local
            </Text>

            <View
              style={
                styles.venuesList
              }
            >
              {availableVenues.map(
                (venue) => {
                  const selected =
                    selectedVenueId ===
                    venue.id;

                  return (
                    <Pressable
                      key={
                        venue.id
                      }
                      onPress={() => {
                        setSelectedVenueId(
                          venue.id,
                        );

                        if (error) {
                          setError("");
                        }
                      }}
                      style={({
                        pressed,
                      }) => [
                        styles.venueCard,

                        selected &&
                          styles.venueCardSelected,

                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <View
                        style={
                          styles.venueInfo
                        }
                      >
                        <Text
                          style={
                            styles.venueName
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {venue.name}
                        </Text>

                        <Text
                          style={
                            styles.venueMeta
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {venue.category} •{" "}
                          {venue.distance}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.radio,

                          selected &&
                            styles.radioSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={
                              styles.radioInner
                            }
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                },
              )}
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
                title="Não foi possível criar o grupo"
                message={
                  error
                }
              />
            </View>
          ) : null}

          <Pressable
            onPress={
              handleCreate
            }
            disabled={
              saving
            }
            style={({
              pressed,
            }) => [
              styles.createButton,

              saving &&
                styles.disabledButton,

              pressed &&
                !saving &&
                styles.pressed,
            ]}
          >
            <Text
              style={
                styles.createButtonText
              }
            >
              {saving
                ? "Criando..."
                : "Criar grupo"}
            </Text>
          </Pressable>

          <Pressable
            onPress={
              handleBackToGroups
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
      marginBottom: 14,
    },

    topBackButtonText: {
      color:
        "#FFFFFF",

      fontSize: 15,
      fontWeight: "700",
    },

    header: {
      marginBottom: 22,
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
    },

    formCard: {
      backgroundColor:
        "#1B1B1B",

      borderRadius: 20,
      padding: 18,

      borderWidth: 1,
      borderColor:
        "#292929",
    },

    label: {
      color:
        "#FFFFFF",

      fontSize: 15,
      fontWeight: "800",

      marginBottom: 8,
      marginTop: 8,
    },

    input: {
      height: 52,

      backgroundColor:
        "#151515",

      borderRadius: 14,

      borderWidth: 1,
      borderColor:
        "#333333",

      color:
        "#FFFFFF",

      paddingHorizontal: 16,

      fontSize: 16,
    },

    counter: {
      color:
        "#666666",

      fontSize: 11,
      textAlign: "right",
      marginTop: 5,
    },

    venuesList: {
      marginTop: 4,
    },

    venueCard: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#151515",

      borderRadius: 16,

      borderWidth: 1,
      borderColor:
        "#2C2C2C",

      padding: 14,
      marginBottom: 10,
    },

    venueCardSelected: {
      borderColor:
        "#FFC400",

      backgroundColor:
        "#211D08",
    },

    venueInfo: {
      flex: 1,
      minWidth: 0,
      paddingRight: 12,
    },

    venueName: {
      color:
        "#FFFFFF",

      fontSize: 16,
      fontWeight: "800",
    },

    venueMeta: {
      color:
        "#888888",

      fontSize: 12,
      marginTop: 4,
    },

    radio: {
      width: 22,
      height: 22,

      borderRadius: 11,

      borderWidth: 2,
      borderColor:
        "#666666",

      alignItems:
        "center",

      justifyContent:
        "center",
    },

    radioSelected: {
      borderColor:
        "#FFC400",
    },

    radioInner: {
      width: 10,
      height: 10,

      borderRadius: 5,

      backgroundColor:
        "#FFC400",
    },

    feedbackWrapper: {
      marginTop: 16,
    },

    createButton: {
      backgroundColor:
        "#FFC400",

      borderRadius: 14,

      paddingVertical: 16,

      alignItems:
        "center",

      marginTop: 20,
    },

    createButtonText: {
      color:
        "#000000",

      fontSize: 15,
      fontWeight: "800",
    },

    cancelButton: {
      backgroundColor:
        "#151515",

      borderRadius: 14,

      borderWidth: 1,
      borderColor:
        "#333333",

      paddingVertical: 16,

      alignItems:
        "center",

      marginTop: 12,
    },

    cancelButtonText: {
      color:
        "#FFFFFF",

      fontSize: 15,
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.5,
    },

    pressed: {
      opacity: 0.8,
    },
  });