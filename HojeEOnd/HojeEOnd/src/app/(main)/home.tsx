import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { FriendsMap } from "@/components/FriendsMap";
import { BACKEND_URL } from "@/config/backend";
import NearbyFriends from "@/components/NearbyFriends";

import { CategoryChip } from "@/components/home/CategoryChip";
import { EventCard } from "@/components/home/EventCard";
import { FloatingButton } from "@/components/home/FloatingButton";
import { HeaderHome } from "@/components/home/HeaderHome";
import { LiveMapContainer } from "@/components/home/LiveMapContainer";
import { LocationStatusCard } from "@/components/home/LocationStatusCard";
import { SearchBar } from "@/components/home/SearchBar";
import { VenueCard } from "@/components/home/VenueCard";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { LoadingState } from "@/components/ui/LoadingState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";

import {
  ApiEvent,
  ApiVenue,
  getEvents,
  getVenues,
} from "@/services/api";

import { useLocationStore } from "@/store/location-store";

import {
  calculateDistance,
  formatDistance,
} from "@/utils/distance";

const categories = [
  "Todos",
  "Festival",
  "Música",
  "Festa",
  "Gastronomia",
  "Cinema",
  "Comida",
  "Bar",
  "Show",
];

export default function HomeScreen() {
  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("Todos");

  const [
    backendVenues,
    setBackendVenues,
  ] = useState<ApiVenue[]>([]);

  const [
    backendEvents,
    setBackendEvents,
  ] = useState<ApiEvent[]>([]);

  const [
    isLoadingCatalog,
    setIsLoadingCatalog,
  ] = useState(true);

  const [
    catalogError,
    setCatalogError,
  ] = useState<string | null>(null);

  const latitude =
    useLocationStore(
      (state) => state.latitude,
    );

  const longitude =
    useLocationStore(
      (state) => state.longitude,
    );

  const locationStatus =
    useLocationStore(
      (state) => state.status,
    );

  const hasUserLocation =
    latitude !== null &&
    longitude !== null;

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        setIsLoadingCatalog(true);
        setCatalogError(null);

        const [
          venuesResponse,
          eventsResponse,
        ] = await Promise.all([
          getVenues(),
          getEvents(),
        ]);

        if (!isMounted) {
          return;
        }

        setBackendVenues(
          Array.isArray(
            venuesResponse,
          )
            ? venuesResponse
            : [],
        );

        setBackendEvents(
          Array.isArray(
            eventsResponse,
          )
            ? eventsResponse
            : [],
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o catálogo.";

        setCatalogError(message);

        setBackendVenues([]);
        setBackendEvents([]);
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedQuery =
    searchQuery
      .trim()
      .toLowerCase();

  const venuesWithRealDistance =
    useMemo(() => {
      return backendVenues.map(
        (venue) => {
          const venueLatitude =
            Number(
              venue.latitude,
            );

          const venueLongitude =
            Number(
              venue.longitude,
            );

          if (
            !hasUserLocation ||
            !Number.isFinite(
              venueLatitude,
            ) ||
            !Number.isFinite(
              venueLongitude,
            )
          ) {
            return {
              ...venue,
              calculatedDistance:
                null as number | null,
              displayDistance:
                venue.distance &&
                venue.distance.length > 0
                  ? venue.distance
                  : "Distância indisponível",
            };
          }

          const distance =
            calculateDistance(
              latitude,
              longitude,
              venueLatitude,
              venueLongitude,
            );

          return {
            ...venue,
            calculatedDistance:
              distance,
            displayDistance:
              formatDistance(
                distance,
              ),
          };
        },
      );
    }, [
      backendVenues,
      hasUserLocation,
      latitude,
      longitude,
    ]);

  const filteredEvents =
    useMemo(() => {
      return backendEvents.filter(
        (event) => {
          const title =
            event.title
              .toLowerCase();

          const venueName =
            (
              event.venueName ??
              event.venue?.name ??
              ""
            ).toLowerCase();

          const category =
            event.category
              .toLowerCase();

          const matchesSearch =
            normalizedQuery.length ===
              0 ||
            title.includes(
              normalizedQuery,
            ) ||
            venueName.includes(
              normalizedQuery,
            ) ||
            category.includes(
              normalizedQuery,
            );

          const matchesCategory =
            selectedCategory ===
              "Todos" ||
            event.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      backendEvents,
      normalizedQuery,
      selectedCategory,
    ]);

  const filteredVenues =
    useMemo(() => {
      return venuesWithRealDistance.filter(
        (venue) => {
          const name =
            venue.name
              .toLowerCase();

          const category =
            venue.category
              .toLowerCase();

          const address =
            venue.address
              .toLowerCase();

          const matchesSearch =
            normalizedQuery.length ===
              0 ||
            name.includes(
              normalizedQuery,
            ) ||
            category.includes(
              normalizedQuery,
            ) ||
            address.includes(
              normalizedQuery,
            );

          const matchesCategory =
            selectedCategory ===
              "Todos" ||
            venue.category ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      normalizedQuery,
      selectedCategory,
      venuesWithRealDistance,
    ]);

  const liveEvents =
    filteredEvents.filter(
      (event) =>
        event.isLive,
    );

  const upcomingEvents =
    filteredEvents
      .filter(
        (event) =>
          !event.isLive,
      )
      .slice(0, 6);

  const popularVenues =
    useMemo(() => {
      return [
        ...filteredVenues,
      ]
        .sort(
          (a, b) =>
            b.occupancy -
            a.occupancy,
        )
        .slice(0, 6);
    }, [
      filteredVenues,
    ]);

  const nearbyVenues =
    useMemo(() => {
      return [
        ...filteredVenues,
      ]
        .sort((a, b) => {
          if (
            a.calculatedDistance ===
              null &&
            b.calculatedDistance ===
              null
          ) {
            return 0;
          }

          if (
            a.calculatedDistance ===
            null
          ) {
            return 1;
          }

          if (
            b.calculatedDistance ===
            null
          ) {
            return -1;
          }

          return (
            a.calculatedDistance -
            b.calculatedDistance
          );
        })
        .slice(0, 6);
    }, [
      filteredVenues,
    ]);

  const renderCatalogError =
    catalogError !== null &&
    !isLoadingCatalog;

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
        <ScreenContainer>
          <View style={styles.content}>
            <HeaderHome />

            <Text
              style={
                styles.greeting
              }
            >
              Qual vai ser sua noite?
            </Text>

            <SearchBar
              value={searchQuery}
              onChangeText={
                setSearchQuery
              }
            />

            <Text
              style={
                styles.section
              }
            >
              Categorias
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.horizontalContent
              }
            >
              {categories.map(
                (category) => (
                  <CategoryChip
                    key={
                      category
                    }
                    title={
                      category
                    }
                    active={
                      selectedCategory ===
                      category
                    }
                    onPress={() =>
                      setSelectedCategory(
                        category,
                      )
                    }
                  />
                ),
              )}
            </ScrollView>

            <Text
              style={
                styles.section
              }
            >
              Localização
            </Text>

            <LocationStatusCard />

            <Text
              style={
                styles.section
              }
            >
              Mapa ao vivo
            </Text>

            <LiveMapContainer />

            {isLoadingCatalog ? (
              <View
                style={
                  styles.catalogLoading
                }
              >
                <LoadingState
                  message="Carregando locais e eventos..."
                />
              </View>
            ) : renderCatalogError ? (
              <View
                style={
                  styles.catalogError
                }
              >
                <FeedbackMessage
                  type="error"
                  title="Não foi possível carregar o catálogo"
                  message={
                    catalogError ??
                    `Verifique se o backend está rodando em ${BACKEND_URL}.`
                  }
                />
              </View>
            ) : (
              <>
                <Text
                  style={
                    styles.section
                  }
                >
                  Eventos acontecendo agora
                </Text>

                {liveEvents.length >
                0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.horizontalContent
                    }
                  >
                    {liveEvents.map(
                      (event) => (
                        <EventCard
                          key={
                            event.id
                          }
                          id={
                            event.id
                          }
                          title={
                            event.title
                          }
                          image={
                            event.image
                          }
                          venueName={
                            event.venueName ??
                            event.venue
                              ?.name ??
                            "Local"
                          }
                          time={
                            event.time
                          }
                          category={
                            event.category
                          }
                          price={
                            event.price
                          }
                          attendees={
                            event.attendees
                          }
                          isLive={
                            event.isLive
                          }
                        />
                      ),
                    )}
                  </ScrollView>
                ) : (
                  <EmptyMessage
                    text="Nenhum evento ao vivo no momento."
                  />
                )}

                <Text
                  style={
                    styles.section
                  }
                >
                  Eventos próximos
                </Text>

                {upcomingEvents.length >
                0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.horizontalContent
                    }
                  >
                    {upcomingEvents.map(
                      (event) => (
                        <EventCard
                          key={
                            event.id
                          }
                          id={
                            event.id
                          }
                          title={
                            event.title
                          }
                          image={
                            event.image
                          }
                          venueName={
                            event.venueName ??
                            event.venue
                              ?.name ??
                            "Local"
                          }
                          time={
                            event.time
                          }
                          category={
                            event.category
                          }
                          price={
                            event.price
                          }
                          attendees={
                            event.attendees
                          }
                          isLive={
                            event.isLive
                          }
                        />
                      ),
                    )}
                  </ScrollView>
                ) : (
                  <EmptyMessage
                    text="Nenhum evento encontrado."
                  />
                )}

                <Text
                  style={
                    styles.section
                  }
                >
                  Locais próximos
                </Text>

                {nearbyVenues.length >
                0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.horizontalContent
                    }
                  >
                    {nearbyVenues.map(
                      (venue) => (
                        <VenueCard
                          key={
                            venue.id
                          }
                          id={
                            venue.id
                          }
                          name={
                            venue.name
                          }
                          category={
                            venue.category
                          }
                          distance={
                            venue.displayDistance
                          }
                          occupancy={
                            venue.occupancy
                          }
                          status={
                            venue.status
                          }
                          image={
                            venue.image
                          }
                        />
                      ),
                    )}
                  </ScrollView>
                ) : (
                  <EmptyMessage
                    text="Nenhum local encontrado."
                  />
                )}

                <Text
                  style={
                    styles.section
                  }
                >
                  Locais populares
                </Text>

                {popularVenues.length >
                0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                      false
                    }
                    contentContainerStyle={
                      styles.horizontalContent
                    }
                  >
                    {popularVenues.map(
                      (venue) => (
                        <VenueCard
                          key={
                            venue.id
                          }
                          id={
                            venue.id
                          }
                          name={
                            venue.name
                          }
                          category={
                            venue.category
                          }
                          distance={
                            venue.displayDistance
                          }
                          occupancy={
                            venue.occupancy
                          }
                          status={
                            venue.status
                          }
                          image={
                            venue.image
                          }
                        />
                      ),
                    )}
                  </ScrollView>
                ) : (
                  <EmptyMessage
                    text="Nenhum local popular encontrado."
                  />
                )}

                <Text
                  style={
                    styles.section
                  }
                >
                  Amigos próximos
                </Text>

                <NearbyFriends />

                <Text
                  style={
                    styles.section
                  }
                >
                  Amigos no mapa
                </Text>

                {locationStatus ===
                "requesting" ? (
                  <View
                    style={
                      styles.stateWrapper
                    }
                  >
                    <LoadingState
                      message="Obtendo sua localização para carregar o mapa de amigos..."
                    />
                  </View>
                ) : locationStatus ===
                  "denied" ? (
                  <FeedbackMessage
                    type="warning"
                    title="Mapa indisponível"
                    message="O mapa de amigos precisa da sua localização para calcular a proximidade."
                  />
                ) : locationStatus ===
                  "error" ? (
                  <FeedbackMessage
                    type="error"
                    title="Mapa indisponível"
                    message="Não foi possível obter sua localização para carregar o mapa de amigos."
                  />
                ) : (
                  <FriendsMap />
                )}
              </>
            )}
          </View>
        </ScreenContainer>
      </ScrollView>

      <FloatingButton />
    </View>
  );
}

function EmptyMessage({
  text,
}: {
  text: string;
}) {
  return (
    <View
      style={
        styles.emptyContainer
      }
    >
      <Text
        style={
          styles.emptyText
        }
      >
        {text}
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
    paddingBottom: 120,
  },

  content: {
    width: "100%",
  },

  greeting: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 24,
  },

  section: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 30,
    marginBottom: 14,
  },

  horizontalContent: {
    paddingRight: 20,
  },

  catalogLoading: {
    marginTop: 30,
    backgroundColor: "#151515",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 18,
  },

  catalogError: {
    marginTop: 30,
  },

  emptyContainer: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#242424",
  },

  emptyText: {
    color: "#999999",
    fontSize: 14,
    lineHeight: 20,
  },

  stateWrapper: {
    backgroundColor: "#151515",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#292929",
  },
});