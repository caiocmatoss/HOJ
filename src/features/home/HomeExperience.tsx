import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { FloatingButton } from "@/components/home/FloatingButton";
import { LiveMapContainer } from "@/components/home/LiveMapContainer";
import { MapBottomSheet } from "@/components/home/MapBottomSheet";
import { MapFilterChip } from "@/components/home/MapFilterChip";
import {
  NearbyDiscoveryCard,
  type NearbyDiscoveryItem,
} from "@/components/home/NearbyDiscoveryCard";
import { SearchBar } from "@/components/home/SearchBar";
import { SearchThisAreaButton } from "@/components/home/SearchThisAreaButton";
import NearbyFriends from "@/components/NearbyFriends";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { getEvents, getVenues, type ApiEvent, type ApiVenue } from "@/services/api";
import { useLocationStore } from "@/store/location-store";
import { colors, fonts, radii } from "@/theme/tokens";
import { calculateDistance, formatDistance } from "@/utils/distance";

const NEARBY_RADIUS_METERS = 5_000;
const categories = [
  "Todos",
  "Bar",
  "Restaurante",
  "Balada",
  "Lounge",
  "Show",
  "Cinema",
  "Evento",
];

type TimeFilter = "all" | "now" | "today";

type VenueWithDistance = {
  displayDistance?: string;
  distance: number | null;
  venue: ApiVenue;
};

type RankedDiscoveryItem = NearbyDiscoveryItem & {
  sortDistance: number;
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function matchesCategory(value: string, selectedCategory: string) {
  if (selectedCategory === "Todos") return true;
  const item = normalizeText(value);
  const selected = normalizeText(selectedCategory);
  return item.includes(selected) || selected.includes(item);
}

function isToday(value: string) {
  const dateOnly = value.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);
  const parsed =
    Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
      ? new Date(year, month - 1, day)
      : new Date(value);

  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
  );
}

function occupancyLabel(value: number) {
  if (value > 70) return "Cheio";
  if (value > 40) return "Movimentado";
  return "Tranquilo";
}

export default function HomeExperience() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();

  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const locationStatus = useLocationStore((state) => state.status);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [showCategories, setShowCategories] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [mapMoved, setMapMoved] = useState(false);
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<ApiVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasLocation = latitude !== null && longitude !== null;
  const mapHeight = Math.min(480, Math.max(300, Math.round(windowHeight * 0.54)));

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [venueResult, eventResult] = await Promise.all([getVenues(), getEvents()]);
      setVenues(Array.isArray(venueResult) ? venueResult : []);
      setEvents(Array.isArray(eventResult) ? eventResult : []);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar locais e eventos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!active) return;
      await loadCatalog();
    };

    void load();
    return () => {
      active = false;
    };
  }, [loadCatalog]);

  const normalizedQuery = normalizeText(query);

  const venuesWithDistance = useMemo<VenueWithDistance[]>(
    () =>
      venues.map((venue) => {
        const venueLatitude = Number(venue.latitude);
        const venueLongitude = Number(venue.longitude);
        const canCalculate =
          hasLocation && Number.isFinite(venueLatitude) && Number.isFinite(venueLongitude);
        const distance = canCalculate
          ? calculateDistance(latitude, longitude, venueLatitude, venueLongitude)
          : null;

        return {
          displayDistance: distance === null ? venue.distance : formatDistance(distance),
          distance,
          venue,
        };
      }),
    [hasLocation, latitude, longitude, venues],
  );

  const filteredVenues = useMemo(
    () =>
      venuesWithDistance.filter(({ venue }) => {
        const searchable = normalizeText(`${venue.name} ${venue.category} ${venue.address}`);
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        return matchesQuery && matchesCategory(venue.category, category);
      }),
    [category, normalizedQuery, venuesWithDistance],
  );

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const venueName = event.venueName ?? event.venue?.name ?? "";
        const searchable = normalizeText(`${event.title} ${event.category} ${venueName}`);
        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        const categoryMatches = matchesCategory(event.category, category);
        const timeMatches =
          timeFilter === "all" ||
          (timeFilter === "now" ? event.isLive : isToday(event.date));

        return matchesQuery && categoryMatches && timeMatches;
      }),
    [category, events, normalizedQuery, timeFilter],
  );

  const nearbyItems = useMemo<RankedDiscoveryItem[]>(() => {
    const venueItems: RankedDiscoveryItem[] = filteredVenues
      .filter(
        ({ distance }) =>
          !hasLocation || distance === null || distance <= NEARBY_RADIUS_METERS,
      )
      .map(({ venue, displayDistance, distance }) => ({
        category: venue.category,
        detail: venue.status.toLowerCase() === "open" ? "Aberto agora" : "Fechado",
        distance: displayDistance,
        id: venue.id,
        image: venue.image,
        kind: "venue",
        occupancy: occupancyLabel(venue.occupancy),
        sortDistance: distance ?? Number.MAX_SAFE_INTEGER,
        title: venue.name,
      }));

    const eventItems: RankedDiscoveryItem[] = filteredEvents.map((event) => ({
      category: event.category,
      detail: event.isLive ? "Acontecendo agora" : `${event.date} · ${event.time}`,
      distance: event.distance,
      id: event.id,
      image: event.image,
      kind: "event",
      sortDistance: Number.MAX_SAFE_INTEGER,
      title: event.title,
    }));

    return [...venueItems, ...eventItems]
      .sort((first, second) => first.sortDistance - second.sortDistance)
      .slice(0, 4);
  }, [filteredEvents, filteredVenues, hasLocation]);

  const openItem = (item: NearbyDiscoveryItem) => {
    if (item.kind === "venue") {
      router.push({ pathname: "/venue/[id]", params: { id: item.id } });
    } else {
      router.push({ pathname: "/event/[id]", params: { id: item.id } });
    }
  };

  const toggleTimeFilter = (value: Exclude<TimeFilter, "all">) => {
    setTimeFilter((current) => (current === value ? "all" : value));
  };

  return (
    <View nativeID="home-screen" testID="home-screen" style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenContainer maxWidth={720} paddingHorizontal={16}>
          <View style={styles.mapSection}>
            <SearchBar
              onChangeText={setQuery}
              placeholder="Onde você quer ir?"
              value={query}
            />

            <ScrollView
              contentContainerStyle={styles.filters}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <MapFilterChip
                label="Agora"
                onPress={() => toggleTimeFilter("now")}
                selected={timeFilter === "now"}
              />
              <MapFilterChip
                label="Hoje"
                onPress={() => toggleTimeFilter("today")}
                selected={timeFilter === "today"}
              />
              <MapFilterChip
                label="Categorias"
                onPress={() => setShowCategories((current) => !current)}
                selected={showCategories || category !== "Todos"}
              />
              <MapFilterChip
                label="Amigos"
                onPress={() => setShowFriends((current) => !current)}
                selected={showFriends}
              />
            </ScrollView>

            {showCategories ? (
              <ScrollView
                contentContainerStyle={styles.categoryFilters}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {categories.map((item) => (
                  <MapFilterChip
                    key={item}
                    label={item}
                    onPress={() => setCategory(item)}
                    selected={category === item}
                  />
                ))}
              </ScrollView>
            ) : null}

            <View style={styles.mapWrap}>
              <LiveMapContainer
                height={mapHeight}
                onLocationPress={() => setMapMoved(false)}
                onRegionChanged={() => setMapMoved(true)}
                onVenuePress={setSelectedVenue}
                selectedVenueId={selectedVenue?.id}
                venues={filteredVenues.map(({ venue }) => venue)}
              />

              {mapMoved ? (
                <View style={styles.searchArea}>
                  <SearchThisAreaButton onPress={() => setMapMoved(false)} />
                </View>
              ) : null}

              {selectedVenue ? (
                <MapBottomSheet
                  distance={
                    venuesWithDistance.find((entry) => entry.venue.id === selectedVenue.id)
                      ?.displayDistance
                  }
                  onClose={() => setSelectedVenue(null)}
                  onViewDetails={() =>
                    router.push({ pathname: "/venue/[id]", params: { id: selectedVenue.id } })
                  }
                  venue={selectedVenue}
                />
              ) : null}
            </View>
          </View>

          <View style={styles.nearbySection}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionEyebrow}>PERTO DE VOCÊ AGORA</Text>
                <Text style={styles.sectionSubtitle}>
                  {timeFilter === "now"
                    ? "O que está acontecendo neste momento"
                    : timeFilter === "today"
                      ? "Programação para hoje"
                      : "Lugares e eventos para descobrir"}
                </Text>
              </View>
              {!loading && !error ? (
                <View style={styles.resultBadge}>
                  <Text style={styles.resultBadgeText}>{nearbyItems.length}</Text>
                </View>
              ) : null}
            </View>

            {!hasLocation ? (
              <View style={styles.locationHint}>
                <Ionicons color={colors.textMuted} name="navigate-outline" size={16} />
                <Text style={styles.helper}>
                  Ative sua localização para ordenar por proximidade.
                </Text>
              </View>
            ) : null}

            {loading ? (
              <View accessibilityLiveRegion="polite" style={styles.loadingState}>
                <ActivityIndicator color={colors.brand} size="small" />
                <Text style={styles.stateText}>Encontrando o que há por aí…</Text>
              </View>
            ) : error ? (
              <View style={styles.errorState}>
                <FeedbackMessage message={error} title="Não foi possível carregar" type="error" />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadCatalog()}
                  style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
                >
                  <Ionicons color={colors.brand} name="refresh-outline" size={17} />
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </Pressable>
              </View>
            ) : nearbyItems.length > 0 ? (
              <View style={styles.cards}>
                {nearbyItems.map((item) => (
                  <NearbyDiscoveryCard
                    item={item}
                    key={`${item.kind}-${item.id}`}
                    onPress={() => openItem(item)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons color={colors.brand} name="moon-outline" size={25} />
                </View>
                <View style={styles.emptyCopy}>
                  <Text style={styles.emptyTitle}>Nada por aqui agora</Text>
                  <Text style={styles.emptyText}>
                    Tente outra categoria, horário ou região do mapa.
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Limpar filtros"
                  onPress={() => {
                    setCategory("Todos");
                    setTimeFilter("all");
                    setQuery("");
                  }}
                >
                  <Text style={styles.clearText}>Limpar</Text>
                </Pressable>
              </View>
            )}
          </View>

          {locationStatus === "denied" ? (
            <View style={styles.locationNotice}>
              <Ionicons color={colors.brand} name="location-outline" size={18} />
              <Text style={styles.noticeText}>
                Localização desativada. Você ainda pode explorar o mapa manualmente.
              </Text>
            </View>
          ) : null}

          {showFriends ? (
            <View style={styles.friendsSection}>
              <Text style={styles.sectionEyebrow}>AMIGOS PRÓXIMOS</Text>
              <Text style={styles.sectionSubtitle}>
                Veja quem também está aproveitando a cidade.
              </Text>
              <View style={styles.friendsCard}>
                <NearbyFriends />
              </View>
            </View>
          ) : null}
        </ScreenContainer>
      </ScrollView>

      <FloatingButton />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    alignSelf: "center",
    backgroundColor: colors.background,
    flex: 1,
    position: "relative",
    width: "100%",
    ...(Platform.OS === "web" ? { maxWidth: 720 } : {}),
  },
  scrollContent: { paddingBottom: 22 },
  mapSection: { paddingTop: 16 },
  filters: { gap: 8, paddingBottom: 7, paddingTop: 9 },
  categoryFilters: { gap: 7, paddingBottom: 9, paddingTop: 1 },
  mapWrap: { position: "relative" },
  searchArea: { left: 0, position: "absolute", right: 0, top: 12 },
  nearbySection: { marginTop: 19 },
  sectionHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  sectionEyebrow: { color: colors.text, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8 },
  sectionSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 4 },
  resultBadge: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 14, height: 28, justifyContent: "center", minWidth: 28, paddingHorizontal: 8 },
  resultBadgeText: { color: colors.brand, fontFamily: fonts.bold, fontSize: 10 },
  locationHint: { alignItems: "center", flexDirection: "row", gap: 7, marginTop: 10 },
  helper: { color: colors.textMuted, flex: 1, fontFamily: fonts.regular, fontSize: 11, lineHeight: 17 },
  cards: { gap: 8, paddingTop: 11 },
  loadingState: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, flexDirection: "row", gap: 11, marginTop: 11, minHeight: 76, padding: 16 },
  stateText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 },
  errorState: { gap: 9, marginTop: 11 },
  retryButton: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 7, paddingHorizontal: 3, paddingVertical: 5 },
  retryText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 11 },
  emptyState: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, flexDirection: "row", marginTop: 11, padding: 15 },
  emptyIcon: { alignItems: "center", backgroundColor: colors.brandSoft, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  emptyCopy: { flex: 1, marginHorizontal: 12 },
  emptyTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  emptyText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, lineHeight: 15, marginTop: 3 },
  clearText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 10 },
  locationNotice: { alignItems: "center", backgroundColor: colors.brandSoft, borderColor: colors.brandBorder, borderRadius: radii.medium, borderWidth: 1, flexDirection: "row", gap: 10, marginTop: 14, padding: 12 },
  noticeText: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
  friendsSection: { marginTop: 22 },
  friendsCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, marginTop: 11, overflow: "hidden" },
  pressed: { opacity: 0.72 },
});
