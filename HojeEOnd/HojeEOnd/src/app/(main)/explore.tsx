import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CategoryChip } from "@/components/home/CategoryChip";
import { EventCard } from "@/components/home/EventCard";
import { SearchBar } from "@/components/home/SearchBar";
import { VenueCard } from "@/components/home/VenueCard";

import { events, type Event } from "@/data/events";
import { venues } from "@/data/venues";

type SortOption = "nearest" | "popular" | "recent";

const categories = [
  "Todos",
  "Bares",
  "Baladas",
  "Shows",
  "Festivais",
  "Restaurantes",
  "Música",
  "Gastronomia",
  "Festa",
  "Festival",
  "Cinema",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("Todos");
  const [sortBy, setSortBy] =
    useState<SortOption>("nearest");
  const [showFilters, setShowFilters] =
    useState(true);

  const normalizedQuery =
    searchQuery.trim().toLowerCase();

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        event.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        event.venueName
          .toLowerCase()
          .includes(normalizedQuery) ||
        event.category
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === "Todos" ||
        event.category === selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

    return [...filtered].sort(
      (a, b) =>
        compareEvents(a, b, sortBy)
    );
  }, [
    normalizedQuery,
    selectedCategory,
    sortBy,
  ]);

  const filteredVenues = useMemo(() => {
    const filtered = venues.filter((venue) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        venue.name
          .toLowerCase()
          .includes(normalizedQuery) ||
        venue.category
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === "Todos" ||
        venue.category === selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "popular") {
        return b.occupancy - a.occupancy;
      }

      return (
        parseDistance(a.distance) -
        parseDistance(b.distance)
      );
    });
  }, [
    normalizedQuery,
    selectedCategory,
    sortBy,
  ]);

  const hasResults =
    filteredEvents.length > 0 ||
    filteredVenues.length > 0;

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            id={item.id}
            title={item.title}
            image={item.image}
            venueName={item.venueName}
            time={item.time}
            category={item.category}
            price={item.price}
            attendees={item.attendees}
            isLive={item.isLive}
          />
        )}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>
              Explorar
            </Text>

            <Text style={styles.subtitle}>
              Encontre o que está acontecendo hoje.
            </Text>

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            <Pressable
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.pressed,
              ]}
              onPress={() =>
                setShowFilters((current) => !current)
              }
            >
              <Text style={styles.filterButtonText}>
                {showFilters
                  ? "Ocultar filtros"
                  : "Mostrar filtros"}
              </Text>
            </Pressable>

            {showFilters && (
              <>
                <Text style={styles.sectionTitle}>
                  Categorias
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    styles.horizontalContent
                  }
                >
                  {categories.map((category) => (
                    <CategoryChip
                      key={category}
                      title={category}
                      active={
                        selectedCategory ===
                        category
                      }
                      onPress={() =>
                        setSelectedCategory(
                          category
                        )
                      }
                    />
                  ))}
                </ScrollView>

                <Text style={styles.sectionTitle}>
                  Ordenar por
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    styles.horizontalContent
                  }
                >
                  {sortOptions.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() =>
                        setSortBy(option.value)
                      }
                      style={({ pressed }) => [
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
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}

            {!hasResults && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  Nada encontrado
                </Text>

                <Text style={styles.emptyText}>
                  Tente outra busca ou escolha outra
                  categoria.
                </Text>

                <Pressable
                  style={styles.clearButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("Todos");
                  }}
                >
                  <Text style={styles.clearButtonText}>
                    Limpar filtros
                  </Text>
                </Pressable>
              </View>
            )}

            {filteredVenues.length > 0 && (
              <View style={styles.venuesSection}>
                <Text style={styles.sectionTitle}>
                  Locais
                </Text>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    styles.horizontalContent
                  }
                >
                  {filteredVenues.map((venue) => (
                    <VenueCard
                      key={venue.id}
                      id={venue.id}
                      name={venue.name}
                      category={venue.category}
                      distance={venue.distance}
                      occupancy={venue.occupancy}
                      status={venue.status}
                      image={venue.image}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {filteredEvents.length > 0 && (
              <Text style={styles.sectionTitle}>
                Eventos
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          hasResults ? null : null
        }
      />
    </View>
  );
}

function compareEvents(
  a: Event,
  b: Event,
  sortBy: SortOption
) {
  switch (sortBy) {
    case "nearest":
      return (
        parseDistance(a.distance) -
        parseDistance(b.distance)
      );

    case "popular":
      return b.attendees - a.attendees;

    case "recent":
      return (
        getEventDateTime(b) -
        getEventDateTime(a)
      );

    default:
      return 0;
  }
}

function getEventDateTime(
  event: Event
) {
  const value = new Date(
    `${event.date}T${event.time}`
  ).getTime();

  return Number.isFinite(value)
    ? value
    : 0;
}

function parseDistance(
  distance: string
) {
  const value = Number.parseFloat(
    distance.replace(",", ".")
  );

  return Number.isFinite(value)
    ? value
    : Number.POSITIVE_INFINITY;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#090909",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
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

  pressed: {
    opacity: 0.75,
  },

  venuesSection: {
    marginBottom: 8,
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
});