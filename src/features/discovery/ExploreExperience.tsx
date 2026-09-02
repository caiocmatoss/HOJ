import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { SearchBar } from "@/components/home/SearchBar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { getEvents, getVenues, type ApiEvent, type ApiVenue } from "@/services/api";
import { useLocationStore } from "@/store/location-store";
import { colors, fonts, radii, shadows } from "@/theme/tokens";
import { calculateDistance, formatDistance } from "@/utils/distance";

type SortOption = "nearest" | "popular" | "recent";

type VenueWithDistance = ApiVenue & {
  calculatedDistance: number | null;
  displayDistance: string;
};

const categories = [
  "Todos",
  "Bares",
  "Restaurantes",
  "Baladas",
  "Shows",
  "Festivais",
  "Cinema",
];

const categoryAliases: Record<string, string[]> = {
  bares: ["bar", "bares"],
  restaurantes: ["restaurante", "restaurantes", "gastronomia", "comida"],
  baladas: ["balada", "baladas", "festa", "festas"],
  shows: ["show", "shows", "musica"],
  festivais: ["festival", "festivais"],
  cinema: ["cinema"],
};

const sortOptions: { icon: keyof typeof Ionicons.glyphMap; label: string; value: SortOption }[] = [
  { icon: "navigate-outline", label: "Mais próximos", value: "nearest" },
  { icon: "flame-outline", label: "Mais populares", value: "popular" },
  { icon: "time-outline", label: "Mais recentes", value: "recent" },
];

export default function ExploreExperience() {
  const { width } = useWindowDimensions();
  const columnCount = width >= 920 ? 2 : 1;
  const compactCards = width < 430;

  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [sortBy, setSortBy] = useState<SortOption>("nearest");
  const [showFilters, setShowFilters] = useState(true);
  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadCatalog = useCallback(async (isActive: () => boolean) => {
    if (!isActive()) return;
    setIsLoading(true);
    setError(null);

    try {
      const [venuesResponse, eventsResponse] = await Promise.all([getVenues(), getEvents()]);
      if (!isActive()) return;
      setVenues(Array.isArray(venuesResponse) ? venuesResponse : []);
      setEvents(Array.isArray(eventsResponse) ? eventsResponse : []);
    } catch {
      if (!isActive()) return;
      setError("Não foi possível carregar locais e eventos. Verifique sua conexão e tente novamente.");
      setVenues([]);
      setEvents([]);
    } finally {
      if (isActive()) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!active) return;
      await loadCatalog(() => active);
    };

    void load();
    return () => {
      active = false;
    };
  }, [loadCatalog, reloadKey]);

  const normalizedQuery = normalizeText(searchQuery);
  const hasUserLocation = latitude !== null && longitude !== null;

  const venuesWithDistance = useMemo<VenueWithDistance[]>(
    () =>
      venues.map((venue) => {
        const venueLatitude = Number(venue.latitude);
        const venueLongitude = Number(venue.longitude);

        if (
          !hasUserLocation ||
          !Number.isFinite(venueLatitude) ||
          !Number.isFinite(venueLongitude)
        ) {
          return {
            ...venue,
            calculatedDistance: null,
            displayDistance: venue.distance?.trim() || "Distância indisponível",
          };
        }

        const distance = calculateDistance(latitude, longitude, venueLatitude, venueLongitude);
        return { ...venue, calculatedDistance: distance, displayDistance: formatDistance(distance) };
      }),
    [hasUserLocation, latitude, longitude, venues],
  );

  const filteredVenues = useMemo(() => {
    const filtered = venuesWithDistance.filter((venue) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        normalizeText(venue.name).includes(normalizedQuery) ||
        normalizeText(venue.category).includes(normalizedQuery) ||
        normalizeText(venue.address).includes(normalizedQuery);

      return matchesSearch && matchesCategory(venue.category, selectedCategory);
    });

    return [...filtered].sort((a, b) => compareVenues(a, b, sortBy));
  }, [normalizedQuery, selectedCategory, sortBy, venuesWithDistance]);

  const filteredEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const venueName = event.venueName ?? event.venue?.name ?? "";
      const matchesSearch =
        normalizedQuery.length === 0 ||
        normalizeText(event.title).includes(normalizedQuery) ||
        normalizeText(venueName).includes(normalizedQuery) ||
        normalizeText(event.category).includes(normalizedQuery);

      return matchesSearch && matchesCategory(event.category, selectedCategory);
    });

    return [...filtered].sort((a, b) =>
      compareEvents(a, b, sortBy, latitude, longitude),
    );
  }, [events, latitude, longitude, normalizedQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
    setSortBy("nearest");
  };

  const hasResults = filteredEvents.length > 0 || filteredVenues.length > 0;

  return (
    <View style={styles.page}>
      <FlatList
        columnWrapperStyle={columnCount > 1 ? styles.eventColumns : undefined}
        contentContainerStyle={styles.listContent}
        data={isLoading || error ? [] : filteredEvents}
        key={`explore-${columnCount}`}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <ScreenContainer maxWidth={1100} paddingHorizontal={0}>
            <View style={styles.headerContent}>
              <ScreenHeading
                eyebrow="Hoje é onde"
                subtitle="Descubra lugares, festas e encontros acontecendo perto de você."
                title="Explorar"
              />

              <View style={styles.searchPanel}>
                <SearchBar
                  onChangeText={setSearchQuery}
                  placeholder="Buscar lugares, eventos ou categorias"
                  value={searchQuery}
                />

                <View style={styles.searchMetaRow}>
                  <View style={styles.locationStatus}>
                    <Ionicons
                      color={hasUserLocation ? colors.success : colors.textMuted}
                      name={hasUserLocation ? "navigate" : "navigate-outline"}
                      size={16}
                    />
                    <Text style={styles.locationStatusText}>
                      {hasUserLocation
                        ? "Distâncias calculadas da sua localização"
                        : "Ative a localização para ordenar por distância"}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityLabel={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showFilters }}
                    onPress={() => setShowFilters((current) => !current)}
                    style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
                  >
                    <Ionicons color={colors.brand} name="options-outline" size={18} />
                    <Text style={styles.filterButtonText}>
                      {showFilters ? "Ocultar" : "Filtros"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              {showFilters ? (
                <View style={styles.filtersCard}>
                  <FilterLabel icon="grid-outline" label="Categorias" />
                  <ScrollView
                    contentContainerStyle={styles.horizontalContent}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {categories.map((category) => (
                      <CategoryFilterChip
                        active={selectedCategory === category}
                        key={category}
                        onPress={() => setSelectedCategory(category)}
                        title={category}
                      />
                    ))}
                  </ScrollView>

                  <FilterLabel icon="swap-vertical-outline" label="Ordenar por" />
                  <ScrollView
                    contentContainerStyle={styles.horizontalContent}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {sortOptions.map((option) => {
                      const selected = sortBy === option.value;
                      return (
                        <Pressable
                          accessibilityLabel={`Ordenar por ${option.label}`}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          key={option.value}
                          onPress={() => setSortBy(option.value)}
                          style={({ pressed }) => [
                            styles.sortChip,
                            selected && styles.sortChipSelected,
                            pressed && styles.pressed,
                          ]}
                        >
                          <Ionicons
                            color={selected ? colors.background : colors.textSecondary}
                            name={option.icon}
                            size={16}
                          />
                          <Text style={[styles.sortChipText, selected && styles.sortChipTextSelected]}>
                            {option.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : null}

              {isLoading ? (
                <StateCard
                  icon="compass-outline"
                  loading
                  message="Buscando os melhores lugares e eventos para você."
                  title="Carregando descoberta"
                />
              ) : null}

              {!isLoading && error ? (
                <StateCard
                  actionLabel="Tentar novamente"
                  icon="cloud-offline-outline"
                  message={error}
                  onAction={() => setReloadKey((current) => current + 1)}
                  tone="danger"
                  title="Não foi possível carregar"
                />
              ) : null}

              {!isLoading && !error && !hasResults ? (
                <StateCard
                  actionLabel="Limpar filtros"
                  icon="search-outline"
                  message="Tente outro termo ou escolha uma categoria diferente."
                  onAction={clearFilters}
                  title="Nada encontrado"
                />
              ) : null}

              {!isLoading && !error && filteredVenues.length > 0 ? (
                <View style={styles.section}>
                  <SectionHeader
                    count={filteredVenues.length}
                    icon="location-outline"
                    subtitle="Lugares que combinam com sua busca"
                    title="Locais em destaque"
                  />
                  <ScrollView
                    contentContainerStyle={styles.venueRail}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {filteredVenues.map((venue) => (
                      <VenueDiscoveryCard key={venue.id} venue={venue} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}

              {!isLoading && !error && filteredEvents.length > 0 ? (
                <SectionHeader
                  count={filteredEvents.length}
                  icon="calendar-outline"
                  subtitle="Programação encontrada para hoje e os próximos dias"
                  title="Eventos"
                />
              ) : null}
            </View>
          </ScreenContainer>
        }
        numColumns={columnCount}
        renderItem={({ item }) => (
          <View style={styles.eventCell}>
            <EventDiscoveryCard compact={compactCards} event={item} />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function FilterLabel({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.filterLabelRow}>
      <Ionicons color={colors.brand} name={icon} size={17} />
      <Text style={styles.filterLabel}>{label}</Text>
    </View>
  );
}

function CategoryFilterChip({
  active,
  onPress,
  title,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`Filtrar por ${title}`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryChip,
        active && styles.categoryChipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.categoryChipText, active && styles.categoryChipTextSelected]}>
        {title}
      </Text>
    </Pressable>
  );
}

function SectionHeader({
  count,
  icon,
  subtitle,
  title,
}: {
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>
        <Ionicons color={colors.brand} name={icon} size={19} />
      </View>
      <View style={styles.sectionCopy}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function VenueDiscoveryCard({ venue }: { venue: VenueWithDistance }) {
  const isOpen = venue.status === "open" || venue.status === "OPEN";
  const occupancy = Number(venue.occupancy) || 0;
  const crowdLabel = occupancy > 70 ? "Cheio" : occupancy > 40 ? "Movimentado" : "Tranquilo";

  return (
    <Pressable
      accessibilityLabel={`Abrir ${venue.name}`}
      accessibilityRole="button"
      onPress={() => router.push(`/venue/${venue.id}`)}
      style={({ pressed }) => [styles.venueCard, pressed && styles.cardPressed]}
    >
      <View style={styles.venueImageWrap}>
        {venue.image ? (
          <Image resizeMode="cover" source={{ uri: venue.image }} style={styles.venueImage} />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons color={colors.brand} name="business-outline" size={28} />
          </View>
        )}
        <View style={[styles.statusPill, !isOpen && styles.statusPillClosed]}>
          <View style={[styles.statusDot, !isOpen && styles.statusDotClosed]} />
          <Text style={[styles.statusPillText, !isOpen && styles.statusPillTextClosed]}>
            {isOpen ? "Aberto" : "Fechado"}
          </Text>
        </View>
      </View>
      <View style={styles.venueBody}>
        <Text numberOfLines={1} style={styles.cardTitle}>
          {venue.name}
        </Text>
        <Text numberOfLines={1} style={styles.cardMeta}>
          {venue.category}
        </Text>
        <View style={styles.cardFooter}>
          <Meta icon="navigate-outline" label={venue.displayDistance} />
          <Meta icon="people-outline" label={`${crowdLabel} · ${occupancy}%`} />
        </View>
      </View>
    </Pressable>
  );
}

function EventDiscoveryCard({ compact, event }: { compact: boolean; event: ApiEvent }) {
  const numericPrice = event.price === null || event.price === undefined ? 0 : Number(event.price);
  const price = Number.isFinite(numericPrice) && numericPrice > 0
    ? `R$ ${numericPrice.toFixed(2).replace(".", ",")}`
    : "Gratuito";
  const venueName = event.venueName ?? event.venue?.name ?? "Local não informado";

  return (
    <Pressable
      accessibilityLabel={`Abrir evento ${event.title}`}
      accessibilityRole="button"
      onPress={() => router.push(`/event/${event.id}`)}
      style={({ pressed }) => [styles.eventCard, pressed && styles.cardPressed]}
    >
      <View style={[styles.eventImageWrap, compact && styles.eventImageWrapCompact]}>
        {event.image ? (
          <Image resizeMode="cover" source={{ uri: event.image }} style={styles.eventImage} />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons color={colors.brand} name="calendar-outline" size={28} />
          </View>
        )}
        {event.isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.eventBody}>
        <View style={styles.eventTopRow}>
          <Text numberOfLines={1} style={styles.eventCategory}>
            {event.category}
          </Text>
          <Text style={[styles.eventPrice, price === "Gratuito" && styles.eventFree]}>{price}</Text>
        </View>
        <Text numberOfLines={2} style={styles.eventTitle}>
          {event.title}
        </Text>
        <View style={styles.eventDetails}>
          <Meta icon="location-outline" label={venueName} />
          <Meta icon="time-outline" label={event.time} />
          <Meta icon="people-outline" label={`${event.attendees.toLocaleString("pt-BR")} pessoas`} />
        </View>
        <View style={styles.openRow}>
          <Text style={styles.openText}>Ver detalhes</Text>
          <Ionicons color={colors.brand} name="arrow-forward" size={17} />
        </View>
      </View>
    </Pressable>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons color={colors.textMuted} name={icon} size={14} />
      <Text numberOfLines={1} style={styles.metaText}>
        {label}
      </Text>
    </View>
  );
}

function StateCard({
  actionLabel,
  icon,
  loading = false,
  message,
  onAction,
  title,
  tone = "default",
}: {
  actionLabel?: string;
  icon: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  message: string;
  onAction?: () => void;
  title: string;
  tone?: "danger" | "default";
}) {
  return (
    <View
      accessibilityLiveRegion={loading ? "polite" : tone === "danger" ? "assertive" : "polite"}
      accessibilityRole={tone === "danger" ? "alert" : undefined}
      accessibilityState={{ busy: loading }}
      style={[styles.stateCard, tone === "danger" && styles.stateCardDanger]}
    >
      <View style={[styles.stateIcon, tone === "danger" && styles.stateIconDanger]}>
        {loading ? (
          <ActivityIndicator color={colors.brand} size="small" />
        ) : (
          <Ionicons color={tone === "danger" ? colors.danger : colors.brand} name={icon} size={25} />
        )}
      </View>
      <View style={styles.stateCopy}>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateMessage}>{message}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={({ pressed }) => [styles.stateAction, pressed && styles.pressed]}
        >
          <Text style={styles.stateActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function matchesCategory(itemCategory: string, selectedCategory: string) {
  if (selectedCategory === "Todos") return true;

  const normalizedItem = normalizeText(itemCategory);
  const normalizedSelected = normalizeText(selectedCategory);
  if (normalizedItem === normalizedSelected) return true;

  return (
    categoryAliases[normalizedSelected]?.some(
      (alias) => normalizedItem === alias || normalizedItem.includes(alias),
    ) ?? false
  );
}

function compareEvents(
  a: ApiEvent,
  b: ApiEvent,
  sortBy: SortOption,
  latitude: number | null,
  longitude: number | null,
) {
  if (sortBy === "popular") return b.attendees - a.attendees;
  if (sortBy === "recent") return getEventDateTime(b) - getEventDateTime(a);

  const distanceA = getEventDistance(a, latitude, longitude);
  const distanceB = getEventDistance(b, latitude, longitude);
  if (distanceA === null && distanceB === null) return 0;
  if (distanceA === null) return 1;
  if (distanceB === null) return -1;
  return distanceA - distanceB;
}

function compareVenues(a: VenueWithDistance, b: VenueWithDistance, sortBy: SortOption) {
  if (sortBy === "popular") return b.occupancy - a.occupancy;
  if (sortBy === "recent") return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
  if (a.calculatedDistance === null && b.calculatedDistance === null) return 0;
  if (a.calculatedDistance === null) return 1;
  if (b.calculatedDistance === null) return -1;
  return a.calculatedDistance - b.calculatedDistance;
}

function getEventDistance(event: ApiEvent, latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null || !event.venue) return null;

  const venueLatitude = Number(event.venue.latitude);
  const venueLongitude = Number(event.venue.longitude);
  if (!Number.isFinite(venueLatitude) || !Number.isFinite(venueLongitude)) return null;

  return calculateDistance(latitude, longitude, venueLatitude, venueLongitude);
}

function getEventDateTime(event: ApiEvent) {
  const value = new Date(`${event.date}T${event.time}`).getTime();
  return Number.isFinite(value) ? value : 0;
}

function getTimestamp(value?: string) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  listContent: {
    alignSelf: "center",
    maxWidth: 1140,
    paddingBottom: 124,
    paddingHorizontal: 20,
    paddingTop: 24,
    width: "100%",
  },
  headerContent: { width: "100%" },
  searchPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 22,
    padding: 14,
  },
  searchMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 12,
  },
  locationStatus: { alignItems: "center", flex: 1, flexDirection: "row", gap: 8, minWidth: 0 },
  locationStatusText: { color: colors.textMuted, flex: 1, fontFamily: fonts.regular, fontSize: 12 },
  filterButton: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 38,
    paddingHorizontal: 13,
  },
  filterButtonText: { color: colors.brand, fontFamily: fonts.bold, fontSize: 12 },
  filtersCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 14,
    overflow: "hidden",
    paddingBottom: 18,
    paddingLeft: 16,
    paddingTop: 16,
  },
  filterLabelRow: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 11, marginTop: 3 },
  filterLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  horizontalContent: { paddingRight: 16 },
  categoryChip: {
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    justifyContent: "center",
    marginRight: 9,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  categoryChipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  categoryChipText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 13 },
  categoryChipTextSelected: { color: colors.background, fontFamily: fonts.bold },
  sortChip: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginRight: 9,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  sortChipSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  sortChipText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 13 },
  sortChipTextSelected: { color: colors.background, fontFamily: fonts.bold },
  section: { marginTop: 28 },
  sectionHeader: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 14, marginTop: 28 },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitleRow: { alignItems: "center", flexDirection: "row", gap: 9 },
  sectionTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  sectionSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginTop: 2 },
  countBadge: { backgroundColor: colors.elevated, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3 },
  countText: { color: colors.textSecondary, fontFamily: fonts.bold, fontSize: 11 },
  venueRail: { paddingBottom: 6, paddingRight: 20 },
  venueCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginRight: 14,
    overflow: "hidden",
    width: 250,
  },
  venueImageWrap: { backgroundColor: colors.elevated, height: 138, position: "relative", width: "100%" },
  venueImage: { height: "100%", width: "100%" },
  imageFallback: { alignItems: "center", backgroundColor: colors.elevated, flex: 1, justifyContent: "center" },
  statusPill: {
    alignItems: "center",
    backgroundColor: "rgba(11, 13, 15, 0.88)",
    borderRadius: radii.pill,
    bottom: 10,
    flexDirection: "row",
    gap: 6,
    left: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    position: "absolute",
  },
  statusPillClosed: { backgroundColor: "rgba(43, 20, 21, 0.92)" },
  statusDot: { backgroundColor: colors.success, borderRadius: 4, height: 7, width: 7 },
  statusDotClosed: { backgroundColor: colors.danger },
  statusPillText: { color: colors.success, fontFamily: fonts.bold, fontSize: 10 },
  statusPillTextClosed: { color: colors.danger },
  venueBody: { padding: 14 },
  cardTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  cardMeta: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 11, marginTop: 4, textTransform: "uppercase" },
  cardFooter: { gap: 6, marginTop: 12 },
  metaItem: { alignItems: "center", flexDirection: "row", gap: 6, minWidth: 0 },
  metaText: { color: colors.textMuted, flexShrink: 1, fontFamily: fonts.regular, fontSize: 11 },
  eventColumns: { gap: 16 },
  eventCell: { flex: 1, marginBottom: 16, minWidth: 0 },
  eventCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    minHeight: 178,
    overflow: "hidden",
    ...shadows.floating,
  },
  eventImageWrap: { backgroundColor: colors.elevated, position: "relative", width: 150 },
  eventImageWrapCompact: { width: 108 },
  eventImage: { height: "100%", width: "100%" },
  liveBadge: {
    alignItems: "center",
    backgroundColor: "rgba(172, 43, 48, 0.92)",
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: 5,
    left: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: "absolute",
    top: 9,
  },
  liveDot: { backgroundColor: colors.text, borderRadius: 3, height: 6, width: 6 },
  liveText: { color: colors.text, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.6 },
  eventBody: { flex: 1, minWidth: 0, padding: 14 },
  eventTopRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  eventCategory: { color: colors.brand, flex: 1, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase" },
  eventPrice: { color: colors.brand, fontFamily: fonts.bold, fontSize: 12 },
  eventFree: { color: colors.success },
  eventTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, lineHeight: 21, marginTop: 7 },
  eventDetails: { gap: 6, marginTop: 10 },
  openRow: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 12 },
  openText: { color: colors.brand, fontFamily: fonts.bold, fontSize: 12 },
  stateCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: 22,
    padding: 18,
  },
  stateCardDanger: { backgroundColor: colors.dangerSoft, borderColor: "rgba(239, 125, 125, 0.25)" },
  stateIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  stateIconDanger: { backgroundColor: colors.dangerSoft },
  stateCopy: { flex: 1, minWidth: 0 },
  stateTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  stateMessage: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 3 },
  stateAction: { backgroundColor: colors.brand, borderRadius: radii.small, paddingHorizontal: 13, paddingVertical: 10 },
  stateActionText: { color: colors.background, fontFamily: fonts.bold, fontSize: 12 },
  cardPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  pressed: { opacity: 0.74 },
});
