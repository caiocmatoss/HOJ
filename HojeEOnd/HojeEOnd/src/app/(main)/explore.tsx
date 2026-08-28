import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CategoryChip } from "@/components/home/CategoryChip";
import { BACKEND_URL } from "@/config/backend";
import { EventCard } from "@/components/home/EventCard";
import { SearchBar } from "@/components/home/SearchBar";
import { VenueCard } from "@/components/home/VenueCard";

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

type SortOption =
  | "nearest"
  | "popular"
  | "recent";

const categories = [
  "Todos",
  "Bar",
  "Festa",
  "Música",
  "Festival",
  "Show",
  "Gastronomia",
  "Cinema",
  "Comida",
  "Bares",
  "Baladas",
  "Shows",
  "Festivais",
  "Restaurantes",
];

const sortOptions: {
  value: SortOption;
  label: string;
}[] = [
  {
    value: "nearest",
    label: "Mais próximos",
  },
  {
    value: "popular",
    label: "Mais populares",
  },
  {
    value: "recent",
    label: "Mais recentes",
  },
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("Todos");

  const [sortBy, setSortBy] =
    useState<SortOption>("nearest");

  const [showFilters, setShowFilters] =
    useState(true);

  const [venues, setVenues] =
    useState<ApiVenue[]>([]);

  const [events, setEvents] =
    useState<ApiEvent[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const latitude =
    useLocationStore(
      (state) => state.latitude,
    );

  const longitude =
    useLocationStore(
      (state) => state.longitude,
    );

  const hasUserLocation =
    latitude !== null &&
    longitude !== null;

  useEffect(() => {
    let mounted = true;

    const loadCatalog =
      async () => {
        try {
          setIsLoading(true);
          setError(null);

          const [
            venuesResponse,
            eventsResponse,
          ] = await Promise.all([
            getVenues(),
            getEvents(),
          ]);

          if (!mounted) {
            return;
          }

          setVenues(
            Array.isArray(
              venuesResponse,
            )
              ? venuesResponse
              : [],
          );

          setEvents(
            Array.isArray(
              eventsResponse,
            )
              ? eventsResponse
              : [],
          );
        } catch (requestError) {
          if (!mounted) {
            return;
          }

          const message =
            requestError instanceof Error
              ? requestError.message
              : "Não foi possível carregar os locais e eventos.";

          setError(message);
          setVenues([]);
          setEvents([]);
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void loadCatalog();

    return () => {
      mounted = false;
    };
  }, []);

  const normalizedQuery =
    searchQuery
      .trim()
      .toLowerCase();

  const venuesWithDistance =
    useMemo(() => {
      return venues.map(
        (venue) => {
          const venueLatitude =
            Number(venue.latitude);

          const venueLongitude =
            Number(venue.longitude);

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
      venues,
      hasUserLocation,
      latitude,
      longitude,
    ]);

  const matchesCategory =
    (
      itemCategory: string,
    ) => {
      if (
        selectedCategory ===
        "Todos"
      ) {
        return true;
      }

      const normalizedItem =
        normalizeText(
          itemCategory,
        );

      const normalizedSelected =
        normalizeText(
          selectedCategory,
        );

      if (
        normalizedItem ===
        normalizedSelected
      ) {
        return true;
      }

      const aliases: Record<
        string,
        string[]
      > = {
        bar: [
          "bar",
          "bares",
        ],

        bares: [
          "bar",
          "bares",
        ],

        show: [
          "show",
          "shows",
        ],

        shows: [
          "show",
          "shows",
        ],

        festival: [
          "festival",
          "festivais",
        ],

        festivais: [
          "festival",
          "festivais",
        ],

        restaurante: [
          "restaurante",
          "restaurantes",
        ],

        restaurantes: [
          "restaurante",
          "restaurantes",
        ],
      };

      const allowed =
        aliases[
          normalizedSelected
        ];

      if (!allowed) {
        return false;
      }

      return allowed.includes(
        normalizedItem,
      );
    };

  const filteredVenues =
    useMemo(() => {
      const filtered =
        venuesWithDistance.filter(
          (venue) => {
            const name =
              normalizeText(
                venue.name,
              );

            const category =
              normalizeText(
                venue.category,
              );

            const address =
              normalizeText(
                venue.address,
              );

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

            return (
              matchesSearch &&
              matchesCategory(
                venue.category,
              )
            );
          },
        );

      return [
        ...filtered,
      ].sort(
        (a, b) =>
          compareVenues(
            a,
            b,
            sortBy,
          ),
      );
    }, [
      venuesWithDistance,
      normalizedQuery,
      selectedCategory,
      sortBy,
    ]);

  const filteredEvents =
    useMemo(() => {
      const filtered =
        events.filter(
          (event) => {
            const title =
              normalizeText(
                event.title,
              );

            const venueName =
              normalizeText(
                event.venueName ??
                  event.venue
                    ?.name ??
                  "",
              );

            const category =
              normalizeText(
                event.category,
              );

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

            return (
              matchesSearch &&
              matchesCategory(
                event.category,
              )
            );
          },
        );

      return [
        ...filtered,
      ].sort(
        (a, b) =>
          compareEvents(
            a,
            b,
            sortBy,
          ),
      );
    }, [
      events,
      normalizedQuery,
      selectedCategory,
      sortBy,
    ]);

  const hasResults =
    filteredEvents.length > 0 ||
    filteredVenues.length > 0;

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(
      "Todos",
    );
    setSortBy("nearest");
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) =>
          item.id
        }
        renderItem={({ item }) => (
          <ScreenContainer>
            <View
              style={
                styles.eventWrapper
              }
            >
              <EventCard
                id={item.id}
                title={item.title}
                image={item.image}
                venueName={
                  item.venueName ??
                  item.venue?.name ??
                  "Local"
                }
                time={item.time}
                category={
                  item.category
                }
                price={item.price}
                attendees={
                  item.attendees
                }
                isLive={
                  item.isLive
                }
              />
            </View>
          </ScreenContainer>
        )}
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.listContent
        }
        ListHeaderComponent={
          <ScreenContainer>
            <View
              style={
                styles.content
              }
            >
              <Text
                style={styles.title}
              >
                Explorar
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Encontre o que está
                acontecendo hoje.
              </Text>

              <SearchBar
                value={
                  searchQuery
                }
                onChangeText={
                  setSearchQuery
                }
              />

              <Pressable
                style={({
                  pressed,
                }) => [
                  styles.filterButton,
                  pressed &&
                    styles.pressed,
                ]}
                onPress={() =>
                  setShowFilters(
                    (current) =>
                      !current,
                  )
                }
              >
                <Text
                  style={
                    styles.filterButtonText
                  }
                >
                  {showFilters
                    ? "Ocultar filtros"
                    : "Mostrar filtros"}
                </Text>
              </Pressable>

              {showFilters && (
                <>
                  <Text
                    style={
                      styles.sectionTitle
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
                      styles.sectionTitle
                    }
                  >
                    Ordenar por
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
                    {sortOptions.map(
                      (option) => (
                        <Pressable
                          key={
                            option.value
                          }
                          onPress={() =>
                            setSortBy(
                              option.value,
                            )
                          }
                          style={({
                            pressed,
                          }) => [
                            styles.sortChip,

                            sortBy ===
                              option.value &&
                              styles.sortChipActive,

                            pressed &&
                              styles.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.sortChipText,

                              sortBy ===
                                option.value &&
                                styles.sortChipTextActive,
                            ]}
                          >
                            {
                              option.label
                            }
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </ScrollView>
                </>
              )}

              {isLoading && (
                <View
                  style={
                    styles.loadingContainer
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color="#FFC400"
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Carregando locais e
                    eventos...
                  </Text>
                </View>
              )}

              {!isLoading &&
                error && (
                  <View
                    style={
                      styles.errorContainer
                    }
                  >
                    <Text
                      style={
                        styles.errorTitle
                      }
                    >
                      Não foi possível
                      carregar
                    </Text>

                    <Text
                      style={
                        styles.errorText
                      }
                    >
                      {error}
                    </Text>

                    <Text
                      style={
                        styles.errorHint
                      }
                    >
                      Verifique se o
                      backend está
                      rodando em
                      {BACKEND_URL}.
                    </Text>
                  </View>
                )}

              {!isLoading &&
                !error &&
                !hasResults && (
                  <View
                    style={
                      styles.emptyContainer
                    }
                  >
                    <Text
                      style={
                        styles.emptyTitle
                      }
                    >
                      Nada encontrado
                    </Text>

                    <Text
                      style={
                        styles.emptyText
                      }
                    >
                      Tente outra busca
                      ou escolha outra
                      categoria.
                    </Text>

                    <Pressable
                      style={({
                        pressed,
                      }) => [
                        styles.clearButton,
                        pressed &&
                          styles.pressed,
                      ]}
                      onPress={
                        clearFilters
                      }
                    >
                      <Text
                        style={
                          styles.clearButtonText
                        }
                      >
                        Limpar filtros
                      </Text>
                    </Pressable>
                  </View>
                )}

              {!isLoading &&
                !error &&
                filteredVenues.length >
                  0 && (
                  <View
                    style={
                      styles.venuesSection
                    }
                  >
                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      Locais
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
                      {filteredVenues.map(
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
                  </View>
                )}

              {!isLoading &&
                !error &&
                filteredEvents.length >
                  0 && (
                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Eventos
                  </Text>
                )}
            </View>
          </ScreenContainer>
        }
      />
    </View>
  );
}

function compareEvents(
  a: ApiEvent,
  b: ApiEvent,
  sortBy: SortOption,
) {
  switch (sortBy) {
    case "popular":
      return (
        b.attendees -
        a.attendees
      );

    case "recent":
      return (
        getEventDateTime(b) -
        getEventDateTime(a)
      );

    case "nearest": {
      const distanceA =
        getEventDistance(a);

      const distanceB =
        getEventDistance(b);

      if (
        distanceA === null &&
        distanceB === null
      ) {
        return 0;
      }

      if (
        distanceA === null
      ) {
        return 1;
      }

      if (
        distanceB === null
      ) {
        return -1;
      }

      return (
        distanceA - distanceB
      );
    }

    default:
      return 0;
  }
}

function compareVenues(
  a: ApiVenue & {
    calculatedDistance:
      | number
      | null;
  },
  b: ApiVenue & {
    calculatedDistance:
      | number
      | null;
  },
  sortBy: SortOption,
) {
  switch (sortBy) {
    case "popular":
      return (
        b.occupancy -
        a.occupancy
      );

    case "recent":
      return (
        getTimestamp(
          b.createdAt,
        ) -
        getTimestamp(
          a.createdAt,
        )
      );

    case "nearest": {
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
    }

    default:
      return 0;
  }
}

function getEventDistance(
  event: ApiEvent,
) {
  const latitude =
    useLocationStore.getState()
      .latitude;

  const longitude =
    useLocationStore.getState()
      .longitude;

  if (
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  const venue =
    event.venue;

  if (!venue) {
    return null;
  }

  const venueLatitude =
    Number(
      venue.latitude,
    );

  const venueLongitude =
    Number(
      venue.longitude,
    );

  if (
    !Number.isFinite(
      venueLatitude,
    ) ||
    !Number.isFinite(
      venueLongitude,
    )
  ) {
    return null;
  }

  return calculateDistance(
    latitude,
    longitude,
    venueLatitude,
    venueLongitude,
  );
}

function getEventDateTime(
  event: ApiEvent,
) {
  const value =
    new Date(
      `${event.date}T${event.time}`,
    ).getTime();

  return Number.isFinite(
    value,
  )
    ? value
    : 0;
}

function getTimestamp(
  value?: string,
) {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isFinite(
    timestamp,
  )
    ? timestamp
    : 0;
}

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#090909",
  },

  listContent: {
    paddingTop: 24,
    paddingBottom: 120,
  },

  content: {
    width: "100%",
  },

  eventWrapper: {
    width: "100%",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  subtitle: {
    color: "#999999",
    fontSize: 15,
    marginTop: 6,
    marginBottom: 4,
  },

  filterButton: {
    alignSelf: "flex-start",
    backgroundColor: "#1B1B1B",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#292929",
  },

  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 14,
  },

  horizontalContent: {
    paddingRight: 20,
  },

  sortChip: {
    backgroundColor: "#1B1B1B",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#292929",
  },

  sortChipActive: {
    backgroundColor: "#FFC400",
    borderColor: "#FFC400",
  },

  sortChipText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  sortChipTextActive: {
    color: "#000000",
    fontWeight: "800",
  },

  venuesSection: {
    marginBottom: 8,
  },

  loadingContainer: {
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 24,
    marginTop: 24,
    alignItems: "center",
  },

  loadingText: {
    color: "#AAAAAA",
    fontSize: 14,
    marginTop: 12,
  },

  errorContainer: {
    backgroundColor: "#241515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#5A2525",
    padding: 20,
    marginTop: 24,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  errorText: {
    color: "#FF8A8A",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  errorHint: {
    color: "#999999",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },

  emptyContainer: {
    backgroundColor: "#151515",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 22,
    marginTop: 24,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  emptyText: {
    color: "#999999",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  clearButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFC400",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 16,
  },

  clearButtonText: {
    color: "#000000",
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.75,
  },
});