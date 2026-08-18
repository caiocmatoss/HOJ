import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { events } from "@/data/events";

export default function EventDetailScreen() {
  const { id } =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const eventId =
    Array.isArray(id)
      ? id[0]
      : id;

  const event = events.find(
    (item) =>
      item.id === eventId,
  );

  const handleBack = () => {
    router.back();
  };

  if (!event) {
    return (
      <View
        style={
          styles.notFoundScreen
        }
      >
        <ScreenContainer maxWidth={760}>
          <View
            style={
              styles.notFoundContainer
            }
          >
            <Text
              style={
                styles.notFoundIcon
              }
            >
              🎉
            </Text>

            <Text
              style={
                styles.notFoundTitle
              }
            >
              Evento não encontrado
            </Text>

            <Text
              style={
                styles.notFoundText
              }
            >
              Este evento pode ter sido removido ou não está mais disponível.
            </Text>

            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.backButtonText
                }
              >
                Voltar
              </Text>
            </Pressable>
          </View>
        </ScreenContainer>
      </View>
    );
  }

  const formattedPrice =
    event.price !== undefined &&
    event.price > 0
      ? `R$ ${event.price
          .toFixed(2)
          .replace(".", ",")}`
      : "Gratuito";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.scrollContent
      }
      showsVerticalScrollIndicator={
        false
      }
    >
      <ScreenContainer maxWidth={900}>
        <View style={styles.content}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.topBackButton,
              pressed &&
                styles.buttonPressed,
            ]}
          >
            <Text
              style={
                styles.topBackButtonText
              }
            >
              ← Voltar
            </Text>
          </Pressable>

          <View
            style={
              styles.imageContainer
            }
          >
            <Image
              source={{
                uri: event.image,
              }}
              style={styles.image}
              resizeMode="cover"
            />

            {event.isLive && (
              <View
                style={
                  styles.liveBadge
                }
              >
                <Text
                  style={
                    styles.liveBadgeText
                  }
                >
                  AO VIVO
                </Text>
              </View>
            )}
          </View>

          <View style={styles.heroCard}>
            <Text
              style={
                styles.category
              }
            >
              {event.category}
            </Text>

            <Text style={styles.title}>
              {event.title}
            </Text>

            <Text style={styles.venue}>
              📍 {event.venueName}
            </Text>

            <View
              style={styles.infoGrid}
            >
              <View
                style={
                  styles.infoItem
                }
              >
                <Text
                  style={
                    styles.infoIcon
                  }
                >
                  📅
                </Text>

                <View
                  style={
                    styles.infoContent
                  }
                >
                  <Text
                    style={
                      styles.infoLabel
                    }
                  >
                    Data
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }
                  >
                    {event.date}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.infoItem
                }
              >
                <Text
                  style={
                    styles.infoIcon
                  }
                >
                  🕒
                </Text>

                <View
                  style={
                    styles.infoContent
                  }
                >
                  <Text
                    style={
                      styles.infoLabel
                    }
                  >
                    Horário
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }
                  >
                    {event.time}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.infoItem
                }
              >
                <Text
                  style={
                    styles.infoIcon
                  }
                >
                  📍
                </Text>

                <View
                  style={
                    styles.infoContent
                  }
                >
                  <Text
                    style={
                      styles.infoLabel
                    }
                  >
                    Distância
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }
                  >
                    {event.distance}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.infoItem
                }
              >
                <Text
                  style={
                    styles.infoIcon
                  }
                >
                  👥
                </Text>

                <View
                  style={
                    styles.infoContent
                  }
                >
                  <Text
                    style={
                      styles.infoLabel
                    }
                  >
                    Participantes
                  </Text>

                  <Text
                    style={
                      styles.infoValue
                    }
                  >
                    {event.attendees.toLocaleString(
                      "pt-BR",
                    )}{" "}
                    pessoas
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={
              styles.priceContainer
            }
          >
            <View>
              <Text
                style={
                  styles.priceLabel
                }
              >
                Ingresso
              </Text>

              <Text
                style={
                  styles.priceHint
                }
              >
                Valor atual
              </Text>
            </View>

            <Text style={styles.price}>
              {formattedPrice}
            </Text>
          </View>

          <View
            style={
              styles.descriptionCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Sobre o evento
            </Text>

            <Text
              style={
                styles.description
              }
            >
              {event.description}
            </Text>
          </View>

          <View
            style={
              styles.actionsCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Ações
            </Text>

            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    "/venue/[id]",
                  params: {
                    id: event.venueId,
                  },
                })
              }
              style={({ pressed }) => [
                styles.primaryButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.primaryButtonText
                }
              >
                📍 Ver local
              </Text>
            </Pressable>

            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.secondaryButton,

                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Voltar
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 50,
  },

  content: {
    width: "100%",
  },

  topBackButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  topBackButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#1B1B1B",
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  liveBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  heroCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  category: {
    color: "#FFC400",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },

  venue: {
    color: "#CCCCCC",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10,
  },

  infoGrid: {
    marginTop: 20,
    gap: 10,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#151515",
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: "#292929",
  },

  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  priceLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  priceHint: {
    color: "#777777",
    fontSize: 11,
    marginTop: 3,
  },

  price: {
    color: "#FFC400",
    fontSize: 22,
    fontWeight: "800",
  },

  descriptionCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },

  description: {
    color: "#C7C7C7",
    fontSize: 15,
    lineHeight: 24,
  },

  actionsCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  primaryButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#3A3A3A",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  notFoundScreen: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
  },

  notFoundContainer: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 24,
    alignItems: "center",
  },

  notFoundIcon: {
    fontSize: 42,
  },

  notFoundTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center",
  },

  notFoundText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  backButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 20,
  },

  backButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },
});