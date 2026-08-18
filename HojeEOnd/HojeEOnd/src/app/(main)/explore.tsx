import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useState } from "react";

import { CategoryChip } from "@/components/home/CategoryChip";
import { EventCard } from "@/components/home/EventCard";
import { SearchBar } from "@/components/home/SearchBar";

import { events } from "@/data/events";

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"nearest" | "popular" | "recent">("nearest");

  // Obter todas as categorias únicas
  const categories = Array.from(
    new Set(events.map(event => event.category))
  );

  // Filtrar eventos com base na busca e categoria
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      !searchQuery || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venueName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      !selectedCategory || 
      event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar eventos com base na seleção
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "nearest":
        // Para eventos próximos, assumimos que estão ordenados por data crescente
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      case "popular":
        // Ordenar por número de participantes (mais populares primeiro)
        return b.attendees - a.attendees;
      case "recent":
        // Ordenar por data mais recente
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      default:
        return 0;
    }
  });

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Explorar Eventos
        </Text>

        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>
              {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filters}>
            <Text style={styles.section}>
              Categorias
            </Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <CategoryChip
                title="Todas"
                active={!selectedCategory}
                onPress={() => setSelectedCategory(null)}
              />
              
              {categories.map((category) => (
                <CategoryChip
                  key={category}
                  title={category}
                  active={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.sortContainer}>
          <Text style={styles.section}>
            Ordenar por:
          </Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity 
              style={[styles.sortButton, sortBy === "nearest" && styles.sortButtonActive]}
              onPress={() => setSortBy("nearest")}
            >
              <Text style={[styles.sortButtonText, sortBy === "nearest" && styles.sortButtonTextActive]}>
                Mais próximos
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sortButton, sortBy === "popular" && styles.sortButtonActive]}
              onPress={() => setSortBy("popular")}
            >
              <Text style={[styles.sortButtonText, sortBy === "popular" && styles.sortButtonTextActive]}>
                Mais populares
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sortButton, sortBy === "recent" && styles.sortButtonActive]}
              onPress={() => setSortBy("recent")}
            >
              <Text style={[styles.sortButtonText, sortBy === "recent" && styles.sortButtonTextActive]}>
                Mais recentes
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.section}>
          Resultados ({sortedEvents.length})
        </Text>

        {sortedEvents.length > 0 ? (
          <FlatList
            data={sortedEvents}
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
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Nenhum evento encontrado
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
    padding: 24,
  },

  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 25,
  },

  section: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 30,
    marginBottom: 15,
  },

  page: {
    flex: 1,
    backgroundColor: "#090909",
  },

  filtersContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  filterButton: {
    backgroundColor: "#FFC400",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  filterButtonText: {
    color: "#000",
    fontWeight: "700",
  },

  filters: {
    marginTop: 15,
  },

  sortContainer: {
    marginTop: 15,
  },

  sortButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  sortButton: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },

  sortButtonActive: {
    backgroundColor: "#FFC400",
  },

  sortButtonText: {
    color: "#FFF",
    fontWeight: "700",
  },

  sortButtonTextActive: {
    color: "#000",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },

  emptyText: {
    color: "#AAA",
    fontSize: 18,
  },
});