import { useState } from "react";

import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { CategoryChip } from "@/components/home/CategoryChip";
import { EventCard } from "@/components/home/EventCard";
import { FloatingButton } from "@/components/home/FloatingButton";
import { HeaderHome } from "@/components/home/HeaderHome";
import { LiveMapContainer } from "@/components/home/LiveMapContainer";
import { SearchBar } from "@/components/home/SearchBar";
import { VenueCard } from "@/components/home/VenueCard";

import { events } from "@/data/events";
import { venues } from "@/data/venues";

export default function HomeScreen() {
  // Estado para busca local
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estado para categoria selecionada
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtrar eventos que estão acontecendo agora (simulação)
  const liveEvents = events.filter(event => event.isLive);

  // Eventos próximos (não ao vivo)
  const upcomingEvents = events
    .filter(event => !event.isLive)
    .filter(event => 
      (!searchQuery || 
       event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       event.venueName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .slice(0, 3);

  // Locais populares (simulação baseada em ocupação)
  const popularVenues = venues
    .filter(venue => 
      (!searchQuery || 
       venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       venue.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 3);

  // Obter todas as categorias únicas
  const categories = Array.from(
    new Set(events.map(event => event.category))
  );

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <HeaderHome />

        <Text style={styles.greeting}>
          Qual vai ser sua noite?
        </Text>

        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

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

        <Text style={styles.section}>
          Mapa ao vivo
        </Text>

        <LiveMapContainer />

        <Text style={styles.section}>
          Eventos acontecendo agora
        </Text>

        {liveEvents.length > 0 ? (
          <FlatList
            data={liveEvents}
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
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noEvents}>Nenhum evento ao vivo no momento</Text>
        )}

        <Text style={styles.section}>
          Eventos próximos
        </Text>

        {upcomingEvents.length > 0 ? (
          <FlatList
            data={upcomingEvents}
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
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noEvents}>Nenhum evento próximo</Text>
        )}

        <Text style={styles.section}>
          Locais populares
        </Text>

        {popularVenues.length > 0 ? (
          <FlatList
            data={popularVenues}
            renderItem={({ item }) => (
              <VenueCard
                id={item.id}
                name={item.name}
                category={item.category}
                distance={item.distance}
                occupancy={item.occupancy}
                status={item.status}
                image={item.image}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <Text style={styles.noEvents}>Nenhum local disponível</Text>
        )}
      </ScrollView>

      <FloatingButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090909",
    padding: 24,
  },

  greeting: {
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

  noEvents: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
  },
});