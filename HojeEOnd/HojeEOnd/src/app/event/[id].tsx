import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { getEvent, type ApiEvent } from "@/services/api";

export default function EventDetailsScreen() {
  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const eventId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [
    event,
    setEvent,
  ] = useState<ApiEvent | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const loadEvent =
      async () => {
        if (!eventId) {
          if (mounted) {
            setError(
              "Evento inválido.",
            );
            setIsLoading(false);
          }

          return;
        }

        try {
          setIsLoading(true);
          setError(null);

          const response =
            await getEvent(eventId);

          if (!mounted) {
            return;
          }

          setEvent(response);
        } catch {
          if (!mounted) {
            return;
          }

          setError(
            "Não foi possível carregar os detalhes do evento.",
          );
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    loadEvent();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#FFC400"
        />

        <Text
          style={styles.loadingText}
        >
          Carregando evento...
        </Text>
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.center}>
        <Text
          style={styles.errorTitle}
        >
          Não foi possível abrir o evento
        </Text>

        <Text
          style={styles.errorText}
        >
          {error ??
            "Evento não encontrado."}
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={styles.backButtonText}
          >
            Voltar
          </Text>
        </Pressable>
      </View>
    );
  }

  const venue =
    event.venue;

  const venueName =
    event.venueName ??
    venue?.name ??
    "Local não informado";

  const price =
    event.price !== null &&
    event.price !== undefined
      ? Number(event.price)
      : 0;

  const formattedPrice =
    price > 0
      ? `R$ ${price
          .toFixed(2)
          .replace(".", ",")}`
      : "Gratuito";

  const formattedDate =
    formatDate(event.date);

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={styles.header}
        >
          <Pressable
            style={styles.backCircle}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={styles.backIcon}
            >
              ‹
            </Text>
          </Pressable>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            Evento
          </Text>

          <View
            style={styles.headerSpacer}
          />
        </View>

        <View
          style={styles.hero}
        >
          {event.image ? (
            <Image
              source={{
                uri: event.image,
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.heroFallback
              }
            >
              <Text
                style={
                  styles.heroFallbackText
                }
              >
                HOJÉ OND
              </Text>
            </View>
          )}

          {event.isLive && (
            <View
              style={styles.liveBadge}
            >
              <Text
                style={styles.liveText}
              >
                AO VIVO
              </Text>
            </View>
          )}
        </View>

        <View
          style={styles.body}
        >
          <Text
            style={styles.category}
          >
            {event.category}
          </Text>

          <Text
            style={styles.title}
          >
            {event.title}
          </Text>

          <View
            style={styles.infoCard}
          >
            <InfoRow
              icon="📅"
              label="Data"
              value={
                formattedDate
              }
            />

            <InfoRow
              icon="🕐"
              label="Horário"
              value={
                event.time
              }
            />

            <InfoRow
              icon="📍"
              label="Local"
              value={
                venueName
              }
            />

            <InfoRow
              icon="👥"
              label="Pessoas"
              value={`${event.attendees.toLocaleString(
                "pt-BR",
              )} pessoas`}
            />

            <InfoRow
              icon="🎟️"
              label="Entrada"
              value={
                formattedPrice
              }
            />
          </View>

          {event.description ? (
            <>
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
            </>
          ) : null}

          {venue ? (
            <>
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Sobre o local
              </Text>

              <Pressable
                style={
                  styles.venueCard
                }
                onPress={() =>
                  router.push(
                    `/venue/${venue.id}`,
                  )
                }
              >
                {venue.image ? (
                  <Image
                    source={{
                      uri: venue.image,
                    }}
                    style={
                      styles.venueImage
                    }
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={
                      styles.venueImageFallback
                    }
                  >
                    <Text
                      style={
                        styles.venueFallbackText
                      }
                    >
                      HOJÉ OND
                    </Text>
                  </View>
                )}

                <View
                  style={
                    styles.venueContent
                  }
                >
                  <Text
                    style={
                      styles.venueName
                    }
                    numberOfLines={1}
                  >
                    {venue.name}
                  </Text>

                  <Text
                    style={
                      styles.venueCategory
                    }
                  >
                    {venue.category}
                  </Text>

                  <Text
                    style={
                      styles.venueAddress
                    }
                    numberOfLines={2}
                  >
                    {venue.address}
                  </Text>

                  {venue.rating !==
                    null &&
                    venue.rating !==
                      undefined && (
                      <Text
                        style={
                          styles.rating
                        }
                      >
                        ★{" "}
                        {Number(
                          venue.rating,
                        ).toFixed(
                          1,
                        )}
                      </Text>
                    )}
                </View>
              </Pressable>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.infoRow}
    >
      <Text
        style={styles.infoIcon}
      >
        {icon}
      </Text>

      <View
        style={styles.infoText}
      >
        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#090909",
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingBottom: 50,
  },

  header: {
    height: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1B1B1B",
    borderWidth: 1,
    borderColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  backIcon: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
  },

  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginHorizontal: 12,
  },

  headerSpacer: {
    width: 42,
  },

  hero: {
    width: "100%",
    height: 260,
    backgroundColor: "#1B1B1B",
    position: "relative",
    overflow: "hidden",
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  heroFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202020",
  },

  heroFallbackText: {
    color: "#FFC400",
    fontSize: 26,
    fontWeight: "900",
  },

  liveBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },

  liveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  category: {
    color: "#FFC400",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 8,
  },

  infoCard: {
    marginTop: 22,
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 16,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoIcon: {
    width: 34,
    fontSize: 18,
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    color: "#777777",
    fontSize: 11,
    fontWeight: "700",
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 3,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 28,
    marginBottom: 10,
  },

  description: {
    color: "#AAAAAA",
    fontSize: 15,
    lineHeight: 23,
  },

  venueCard: {
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#292929",
    overflow: "hidden",
    flexDirection: "row",
  },

  venueImage: {
    width: 120,
    height: 130,
  },

  venueImageFallback: {
    width: 120,
    height: 130,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
  },

  venueFallbackText: {
    color: "#FFC400",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  venueContent: {
    flex: 1,
    padding: 14,
  },

  venueName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  venueCategory: {
    color: "#FFC400",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  venueAddress: {
    color: "#999999",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  rating: {
    color: "#FFC400",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },

  center: {
    flex: 1,
    backgroundColor: "#090909",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 12,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  errorText: {
    color: "#999999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
  },

  backButton: {
    marginTop: 24,
    backgroundColor: "#FFC400",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  backButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "900",
  },
});