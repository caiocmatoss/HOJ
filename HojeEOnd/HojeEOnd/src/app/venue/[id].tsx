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

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import {
  ApiVenue,
  getVenue,
} from "@/services/api";

import { ScreenContainer } from "@/components/ui/ScreenContainer";

import { useCheckinStore } from "@/store/checkin-store";
import { useFavoriteStore } from "@/store/favorite-store";

export default function VenueDetailsScreen() {
  const params =
    useLocalSearchParams<{
      id?: string | string[];
    }>();

  const venueId =
    Array.isArray(params.id)
      ? params.id[0]
      : params.id;

  const [
    venue,
    setVenue,
  ] = useState<ApiVenue | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [favoriteActionError, setFavoriteActionError] = useState<string | null>(null);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const favorites = useFavoriteStore((state) => state.favorites);
  const toggleFavorite = useFavoriteStore((state) => state.toggleFavorite);
  const loadFavorites = useFavoriteStore((state) => state.loadFavorites);
  const isFavoriteProcessing = useFavoriteStore((state) => state.isProcessing);

  const {
    currentVenue,
    checkin,
    checkout,
    loadCurrentCheckin,
    processing: checkinProcessing,
    error: checkinError,
  } = useCheckinStore();

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    void loadCurrentCheckin();
  }, [loadCurrentCheckin]);

  useEffect(() => {
    let mounted = true;

    const loadVenue =
      async () => {
        if (!venueId) {
          if (mounted) {
            setError(
              "Local inválido.",
            );

            setIsLoading(false);
          }

          return;
        }

        try {
          setIsLoading(true);
          setError(null);

          const response =
            await getVenue(
              venueId,
            );

          if (!mounted) {
            return;
          }

          setVenue(response);
        } catch (requestError) {
          if (!mounted) {
            return;
          }

          const message =
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar o local.";

          setError(message);
          setVenue(null);
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void loadVenue();

    return () => {
      mounted = false;
    };
  }, [venueId]);

  const handleBack = () => {
    router.back();
  };

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
          Carregando local...
        </Text>
      </View>
    );
  }

  if (error || !venue) {
    return (
      <View style={styles.errorScreen}>
        <ScreenContainer maxWidth={760}>
          <View
            style={
              styles.errorContainer
            }
          >
            <Text
              style={styles.errorIcon}
            >
              📍
            </Text>

            <Text
              style={styles.errorTitle}
            >
              Não foi possível abrir o local
            </Text>

            <Text
              style={styles.errorText}
            >
              {error ??
                "Local não encontrado."}
            </Text>

            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.errorButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.errorButtonText
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

  const favorite =
    venueId !== undefined &&
    favorites.includes(venueId);

  const isCurrentlyCheckedIn =
    venueId !== undefined &&
    currentVenue === venueId;

  const isOpen =
    venue.status === "open" ||
    venue.status === "OPEN";

  const occupancy =
    Number(venue.occupancy) || 0;

  const rating =
    venue.rating !== null &&
    venue.rating !== undefined
      ? Number(venue.rating)
      : 0;

  const handleFavorite = async () => {
    if (!venueId || isFavoriteProcessing(venueId)) {
      return;
    }

    setFavoriteActionError(null);
    try {
      await toggleFavorite(venueId);
    } catch (requestError) {
      setFavoriteActionError(requestError instanceof Error ? requestError.message : "Não foi possível atualizar o favorito.");
    }
  };

  const handleCheckin = async () => {
    if (!venueId || checkinProcessing) return;
    try {
      if (isCurrentlyCheckedIn) {
        await checkout();
      } else {
        await checkin(venueId);
      }
    } catch {
      // The store exposes the API error for the UI below.
    }
  };
  const handleOpenGroups = () => {
    router.push(
      "/(main)/groups",
    );
  };

  return (
    <View style={styles.page}>
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
                styles.backButtonTop,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.backButtonTopText
                }
              >
                ← Voltar
              </Text>
            </Pressable>

            {venue.image ? (
              <Image
                source={{
                  uri: venue.image,
                }}
                style={
                  styles.heroImage
                }
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

            <View
              style={styles.headerRow}
            >
              <View
                style={styles.headerInfo}
              >
                <Text
                  style={styles.title}
                >
                  {venue.name}
                </Text>

                <Text
                  style={styles.category}
                >
                  {venue.category}
                </Text>

                <Text
                  style={styles.address}
                >
                  📍 {venue.address}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  isOpen
                    ? styles.statusOpen
                    : styles.statusClosed,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isOpen
                      ? styles.statusOpenText
                      : styles.statusClosedText,
                  ]}
                >
                  {isOpen
                    ? "Aberto"
                    : "Fechado"}
                </Text>
              </View>
            </View>

            <View
              style={styles.actionRow}
            >
              <Pressable
                onPress={() => { void handleFavorite(); }}
                disabled={venueId ? isFavoriteProcessing(venueId) : false}
                style={({ pressed }) => [
                  styles.actionButton,

                  favorite &&
                    styles.favoriteActive,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.actionIcon,
                    favorite &&
                      styles.favoriteIconActive,
                  ]}
                >
                  {favorite
                    ? "♥"
                    : "♡"}
                </Text>

                <Text
                  style={[
                    styles.actionText,
                    favorite &&
                      styles.favoriteTextActive,
                  ]}
                >
                  {favorite
                    ? "Favoritado"
                    : "Favoritar"}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => { void handleCheckin(); }}
                disabled={checkinProcessing}
                style={({ pressed }) => [
                  styles.actionButton,

                  isCurrentlyCheckedIn &&
                    styles.checkinActive,

                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.actionIcon,
                    isCurrentlyCheckedIn &&
                      styles.checkinIconActive,
                  ]}
                >
                  {isCurrentlyCheckedIn
                    ? "✓"
                    : "📍"}
                </Text>

                <Text
                  style={[
                    styles.actionText,
                    isCurrentlyCheckedIn &&
                      styles.checkinTextActive,
                  ]}
                >
                  {isCurrentlyCheckedIn
                    ? "Você está aqui"
                    : "Check-in"}
                </Text>
              </Pressable>
            </View>

            {checkinError && (
              <Text style={styles.errorText}>{checkinError}</Text>
            )}

            {favoriteActionError && (
              <Text style={styles.errorText}>{favoriteActionError}</Text>
            )}

            {isCurrentlyCheckedIn && (
              <View
                style={
                  styles.checkedInBanner
                }
              >
                <Text
                  style={
                    styles.checkedInBannerText
                  }
                >
                  ✓ Você está fazendo check-in neste
                  local
                </Text>
              </View>
            )}

            <View
              style={styles.statsCard}
            >
              <View
                style={styles.statItem}
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {occupancy}%
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Ocupação
                </Text>
              </View>

              <View
                style={
                  styles.statDivider
                }
              />

              <View
                style={styles.statItem}
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {venue.distance ||
                    "—"}
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Distância
                </Text>
              </View>

              <View
                style={
                  styles.statDivider
                }
              />

              <View
                style={styles.statItem}
              >
                <Text
                  style={
                    styles.statValue
                  }
                >
                  {venue.people}
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }
                >
                  Pessoas
                </Text>
              </View>
            </View>

            <View
              style={styles.infoCard}
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Informações
              </Text>

              <InfoRow
                icon="📍"
                label="Endereço"
                value={
                  venue.address ||
                  "Não informado"
                }
              />

              <InfoRow
                icon="🚪"
                label="Status"
                value={
                  isOpen
                    ? "Aberto"
                    : "Fechado"
                }
              />

              <InfoRow
                icon="🎧"
                label="DJ"
                value={
                  venue.dj ||
                  "Não informado"
                }
              />

              <InfoRow
                icon="🎵"
                label="Playlist"
                value={
                  venue.playlist ||
                  "Não informado"
                }
              />

              <InfoRow
                icon="🎟️"
                label="Promoção"
                value={
                  venue.promotion ||
                  "Nenhuma promoção"
                }
              />

              <InfoRow
                icon="⭐"
                label="Avaliação"
                value={
                  rating > 0
                    ? rating.toFixed(1)
                    : "Sem avaliação"
                }
              />
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
                Sobre o local
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                {venue.description ||
                  "Nenhuma descrição disponível."}
              </Text>
            </View>

            {venue.gallery &&
              venue.gallery.length >
                0 && (
                <View
                  style={
                    styles.gallerySection
                  }
                >
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Galeria
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.galleryContent
                    }
                  >
                    {venue.gallery.map(
                      (
                        photo,
                        index,
                      ) => (
                        <Image
                          key={`${venue.id}-${index}`}
                          source={{
                            uri: photo,
                          }}
                          style={
                            styles.galleryImage
                          }
                          resizeMode="cover"
                        />
                      ),
                    )}
                  </ScrollView>
                </View>
              )}

            <Pressable
              onPress={
                handleOpenGroups
              }
              style={({ pressed }) => [
                styles.groupButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <Text
                style={
                  styles.groupButtonText
                }
              >
                🎉 Criar grupo neste local
              </Text>
            </Pressable>

            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
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
      <View
        style={styles.infoLabel}
      >
        <Text
          style={styles.infoIcon}
        >
          {icon}
        </Text>

        <Text
          style={
            styles.infoLabelText
          }
        >
          {label}
        </Text>
      </View>

      <Text
        style={styles.infoValue}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#090909",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 50,
  },

  content: {
    width: "100%",
  },

  backButtonTop: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },

  backButtonTopText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  heroImage: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    backgroundColor: "#1B1B1B",
  },

  heroFallback: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
  },

  heroFallbackText: {
    color: "#FFC400",
    fontSize: 28,
    fontWeight: "900",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 18,
  },

  headerInfo: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  category: {
    color: "#FFC400",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },

  address: {
    color: "#888888",
    fontSize: 13,
    marginTop: 7,
  },

  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusOpen: {
    backgroundColor: "#17351D",
  },

  statusClosed: {
    backgroundColor: "#351414",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  statusOpenText: {
    color: "#4CAF50",
  },

  statusClosedText: {
    color: "#FF6B6B",
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },

  actionButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFC400",
    backgroundColor: "#151515",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  favoriteActive: {
    backgroundColor: "#FFC400",
  },

  checkinActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },

  actionIcon: {
    color: "#FFC400",
    fontSize: 22,
    marginBottom: 3,
  },

  favoriteIconActive: {
    color: "#000000",
  },

  checkinIconActive: {
    color: "#FFFFFF",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },

  favoriteTextActive: {
    color: "#000000",
  },

  checkinTextActive: {
    color: "#FFFFFF",
  },

  checkedInBanner: {
    backgroundColor: "#17351D",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#245C2D",
  },

  checkedInBannerText: {
    color: "#4CAF50",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },

  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    paddingVertical: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    color: "#FFC400",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },

  statLabel: {
    color: "#888888",
    fontSize: 12,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#333333",
  },

  infoCard: {
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

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },

  infoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 105,
  },

  infoIcon: {
    fontSize: 16,
  },

  infoLabelText: {
    color: "#999999",
    fontSize: 14,
    fontWeight: "600",
  },

  infoValue: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
  },

  descriptionCard: {
    backgroundColor: "#1B1B1B",
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },

  description: {
    color: "#CCCCCC",
    fontSize: 15,
    lineHeight: 24,
  },

  gallerySection: {
    marginTop: 22,
  },

  galleryContent: {
    paddingRight: 20,
  },

  galleryImage: {
    width: 230,
    height: 160,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: "#1B1B1B",
  },

  groupButton: {
    backgroundColor: "#FFC400",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },

  groupButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  backButton: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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

  errorScreen: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
  },

  errorContainer: {
    width: "100%",
    backgroundColor: "#1B1B1B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 24,
    alignItems: "center",
  },

  errorIcon: {
    fontSize: 42,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 14,
    textAlignVertical: "center",
  },

  errorText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  errorButton: {
    backgroundColor: "#FFC400",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 20,
  },

  errorButtonText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.8,
  },
});