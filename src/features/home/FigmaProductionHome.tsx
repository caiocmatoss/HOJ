import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ExternalPlaceSheet } from "@/components/home/ExternalPlaceSheet";
import { EventSheet } from "@/components/home/figma/EventSheet";
import { FigmaHomeFilters, type HomeFilter } from "@/components/home/figma/FigmaHomeFilters";
import { FigmaHomeSearch } from "@/components/home/figma/FigmaHomeSearch";
import { FigmaNearbyCard } from "@/components/home/figma/FigmaNearbyCard";
import { HomeLoadingOverlay, HomeNoLocationOverlay, HomeNoResultsOverlay, HomeOfflineOverlay } from "@/components/home/figma/HomeStateOverlays";
import { VenueSheet } from "@/components/home/figma/VenueSheet";
import { MapLocationButton } from "@/components/home/MapLocationButton";
import { RealMapContainer } from "@/components/home/RealMapContainer";
import { SearchThisAreaButton } from "@/components/home/SearchThisAreaButton";
import { type ApiEvent, type ApiVenue } from "@/services/api";
import { useEventsQuery } from "@/services/api/resources/events";
import { useNearbyPlacesQuery, type NearbyPlace } from "@/services/api/resources/discovery";
import { useFavoriteMutation, useFavoritesQuery } from "@/services/api/resources/favorites";
import { useVenuesQuery } from "@/services/api/resources/venues";
import { useLocationStore } from "@/store/location-store";
import { usePresenceStore } from "@/store/presence-store";
import { colors, fonts } from "@/theme/tokens";
import { calculateDistance, formatDistance, isWithinNearbyRadius } from "@/utils/distance";
import { getVenueOccupancyState } from "@/utils/venue-state";
import type { NearbyDiscoveryItem } from "@/components/home/NearbyDiscoveryCard";

export default function FigmaProductionHome() {
  const router = useRouter();
  const { latitude, longitude, status: locationStatus } = useLocationStore();
  const friendLocations = usePresenceStore((state) => state.friendLocations);
  const presenceStatuses = usePresenceStore((state) => state.statuses);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HomeFilter>("now");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [moved, setMoved] = useState(false);
  const [recenterKey, setRecenterKey] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState<ApiVenue | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null);
  const [selectedExternal, setSelectedExternal] = useState<NearbyPlace | null>(null);
  const favoritesQuery = useFavoritesQuery();
  const favoriteMutation = useFavoriteMutation();
  const venuesQuery = useVenuesQuery();
  const eventsQuery = useEventsQuery();
  const discoveryQuery = useNearbyPlacesQuery(locationStatus === "granted" ? latitude : null, locationStatus === "granted" ? longitude : null);
  const venues = venuesQuery.data?.items ?? [];
  const favoriteVenueIds = useMemo(() => new Set((favoritesQuery.data ?? []).map((favorite) => favorite.venueId)), [favoritesQuery.data]);
  const events = eventsQuery.data?.items ?? [];
  const loading = venuesQuery.isLoading || eventsQuery.isLoading || discoveryQuery.isLoading;
  const error = venuesQuery.error || eventsQuery.error ? "Não foi possível carregar a descoberta." : null;
  const externalPlaces = query.trim() ? [] : (discoveryQuery.data ?? []).filter((place) => place.source === "FOURSQUARE" && !place.venueId);
  const load = () => { void venuesQuery.refetch(); void eventsQuery.refetch(); void discoveryQuery.refetch(); };
  const nearbyFriends = Object.values(friendLocations).filter((friend) => presenceStatuses[friend.userId] === "ONLINE");
  const friendsVisible = filter === "friends";
  const nearbyVenues = useMemo(() => { if (locationStatus !== "granted" || latitude == null || longitude == null) return []; return venues.filter((venue) => isWithinNearbyRadius(calculateDistance(latitude, longitude, Number(venue.latitude), Number(venue.longitude)))); }, [latitude, locationStatus, longitude, venues]);
  const nearbyEvents = useMemo(() => { if (locationStatus !== "granted" || latitude == null || longitude == null) return []; return events.filter((event) => isWithinNearbyRadius(calculateDistance(latitude, longitude, Number(event.venue?.latitude), Number(event.venue?.longitude)))); }, [events, latitude, locationStatus, longitude]);
  const categoryOptions = useMemo(() => ["Todos", ...Array.from(new Set([...nearbyVenues.map((venue) => normalizeHomeCategory(venue.category)), ...nearbyEvents.map((event) => normalizeHomeCategory(event.category)), ...externalPlaces.map((place) => normalizeHomeCategory(place.category))].filter(Boolean)))], [externalPlaces, nearbyEvents, nearbyVenues]);
  const categoryMatches = (value: string | null | undefined) => !selectedCategory || selectedCategory === "Todos" || normalizeHomeCategory(value) === selectedCategory;
  const filteredVenues = useMemo(() => nearbyVenues.filter((venue) => categoryMatches(venue.category)), [nearbyVenues, selectedCategory]);
  const filteredEvents = useMemo(() => nearbyEvents.filter((event) => categoryMatches(event.category)), [nearbyEvents, selectedCategory]);
  const filteredExternalPlaces = useMemo(() => externalPlaces.filter((place) => categoryMatches(place.category)), [externalPlaces, selectedCategory]);
  useEffect(() => {
    if (selectedExternal && !filteredExternalPlaces.some((place) => place.id === selectedExternal.id)) setSelectedExternal(null);
  }, [filteredExternalPlaces, selectedExternal]);
  const mapVenues = query.trim() ? venues : filteredVenues;
  const mapEvents = query.trim() ? events : filteredEvents.filter((event) => filter === "now" ? event.isLive : filter === "today" ? new Date(event.date).toDateString() === new Date().toDateString() : true);
  const selectedVenueDistance = selectedVenue && latitude != null && longitude != null ? formatDistance(calculateDistance(latitude, longitude, Number(selectedVenue.latitude), Number(selectedVenue.longitude))) : selectedVenue?.distance;
  const items = useMemo<NearbyDiscoveryItem[]>(() => {
    const q = query.trim().toLowerCase();
    const sourceVenues = q ? venues : filteredVenues;
    const sourceEvents = q ? events : filteredEvents;
    const venueItems = sourceVenues.filter((venue) => !q || `${venue.name} ${venue.category}`.toLowerCase().includes(q)).map((venue) => { const distance = latitude != null && longitude != null ? calculateDistance(latitude, longitude, Number(venue.latitude), Number(venue.longitude)) : null; return { id: venue.id, kind: "venue" as const, title: venue.name, category: venue.category, distance: distance == null ? venue.distance : formatDistance(distance), occupancy: getVenueOccupancyState(venue).label, sort: distance ?? Number.MAX_SAFE_INTEGER }; });
    const eventItems = sourceEvents.filter((event) => { const matches = !q || `${event.title} ${event.category} ${event.venueName ?? ""}`.toLowerCase().includes(q); if (!matches || (filter === "now" && !event.isLive)) return false; if (filter === "today") return new Date(event.date).toDateString() === new Date().toDateString(); return true; }).map((event) => { const distance = latitude != null && longitude != null ? calculateDistance(latitude, longitude, Number(event.venue?.latitude), Number(event.venue?.longitude)) : null; return { id: event.id, kind: "event" as const, title: event.title, category: event.category, distance: distance == null ? event.distance : formatDistance(distance), detail: `${event.date} · ${event.time}`, sort: distance ?? Number.MAX_SAFE_INTEGER }; });
    const externalItems = q ? [] : filteredExternalPlaces.map((place) => ({ id: place.id, kind: "external" as const, title: place.name, category: place.category, distance: formatDistance(place.distanceMeters), detail: place.address ?? place.locality ?? undefined, sort: place.distanceMeters }));
    return [...venueItems, ...eventItems, ...externalItems].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [events, filter, filteredEvents, filteredExternalPlaces, filteredVenues, latitude, longitude, query, venues]);
  const sheetOpen = Boolean(selectedVenue || selectedEvent || selectedExternal);
  return <View testID="home-screen" style={styles.root}><View style={styles.mapLayer}><RealMapContainer venues={mapVenues} events={mapEvents} externalPlaces={filteredExternalPlaces} selectedVenueId={selectedVenue?.id} selectedEventId={selectedEvent?.id} selectedExternalId={selectedExternal?.id} onVenuePress={(venue) => { setSelectedEvent(null); setSelectedExternal(null); setSelectedVenue(venue); }} onEventPress={(event) => { setSelectedVenue(null); setSelectedExternal(null); setSelectedEvent(event); }} onExternalPlacePress={(place) => { setSelectedVenue(null); setSelectedEvent(null); setSelectedExternal(place); }} recenterKey={recenterKey} height={480} /><LinearGradient pointerEvents="none" colors={["rgba(11,13,15,.85)", "transparent"]} style={styles.topGradient} /><LinearGradient pointerEvents="none" colors={["transparent", colors.background]} style={styles.bottomGradient} /></View><View style={styles.searchLayer}><FigmaHomeSearch value={query} onChangeText={setQuery} /><FigmaHomeFilters value={filter} onChange={setFilter} categories={categoryOptions} selectedCategory={selectedCategory} onCategoryChange={(value) => setSelectedCategory(value === "Todos" ? null : value)} /></View>{moved && <View style={styles.searchArea}><SearchThisAreaButton onPress={() => setMoved(false)} /></View>}<View style={[styles.location, sheetOpen && styles.locationSheet]}><MapLocationButton onPress={() => { setMoved(false); setRecenterKey((value) => value + 1); }} /></View>{friendsVisible && nearbyFriends.length > 0 && <View style={styles.friendIndicator}><View style={styles.friendDot} /><Text style={styles.friendText}>{nearbyFriends.length} {nearbyFriends.length === 1 ? "amigo" : "amigos"} por perto</Text></View>}<View style={styles.contentPanel}><Text style={styles.nearbyTitle}>Perto de você agora</Text>{locationStatus !== "granted" && <Text style={styles.locationHint}>Ative sua localização para ordenar por proximidade.</Text>}{loading ? <View style={styles.loading}><ActivityIndicator color={colors.brand} /><Text style={styles.meta}>Encontrando o que há por aí…</Text></View> : error ? <Pressable onPress={() => void load()}><Text style={styles.error}>{error} · Tentar novamente</Text></Pressable> : items.length === 0 ? <HomeNoResultsOverlay title={query.trim() ? "Nenhum resultado" : selectedCategory ? `Nenhum ${selectedCategory.toLowerCase()} encontrado` : undefined} body={query.trim() ? "Tente buscar outro nome, categoria ou local." : undefined} /> : <View style={styles.cards}>{items.map((item) => <FigmaNearbyCard key={`${item.kind}-${item.id}`} item={item} selected={item.kind === "venue" ? selectedVenue?.id === item.id : item.kind === "event" ? selectedEvent?.id === item.id : selectedExternal?.id === item.id} favorite={item.kind === "venue" ? favoriteVenueIds.has(item.id) : false} onFavorite={item.kind === "venue" ? () => { if (!favoriteMutation.isPending) void favoriteMutation.mutateAsync({ venueId: item.id, active: favoriteVenueIds.has(item.id) }); } : undefined} onPress={() => item.kind === "venue" ? setSelectedVenue(venues.find((venue) => venue.id === item.id) ?? null) : item.kind === "event" ? setSelectedEvent(events.find((event) => event.id === item.id) ?? null) : setSelectedExternal(filteredExternalPlaces.find((place) => place.id === item.id) ?? null)} />)}</View>}</View>{selectedVenue && <VenueSheet venue={selectedVenue} distance={selectedVenueDistance} onClose={() => setSelectedVenue(null)} onViewDetails={() => router.push({ pathname: "/venue/[id]", params: { id: selectedVenue.id } })} />}{selectedEvent && <EventSheet event={selectedEvent} onClose={() => setSelectedEvent(null)} onViewDetails={() => router.push({ pathname: "/event/[id]", params: { id: selectedEvent.id } })} />}{selectedExternal && <ExternalPlaceSheet place={selectedExternal} onClose={() => setSelectedExternal(null)} />}{loading && <HomeLoadingOverlay />}{locationStatus === "denied" && !selectedVenue && !selectedEvent && !selectedExternal && <HomeNoLocationOverlay />}{error && /network|fetch|offline|conexão|conexao/i.test(error) && <HomeOfflineOverlay />}</View>;
}

function normalizeHomeCategory(value: string | null | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();
  if (/bar|pub|boate|balad|night.?club|club/.test(normalized)) return "Bares";
  if (/restaur|comida|pizza|bistr/.test(normalized)) return "Restaurantes";
  if (/show|m[uú]sica|concert|festival|event/.test(normalized)) return "Shows/Eventos";
  return value?.trim() || "Outros";
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background, position: "relative" }, mapLayer: { position: "absolute", top: 0, left: 0, right: 0, height: 480, overflow: "hidden" }, topGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 180 }, bottomGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 80 }, searchLayer: { position: "absolute", top: 58, left: 16, right: 16, zIndex: 20 }, searchArea: { position: "absolute", top: 165, left: 0, right: 0, alignItems: "center", zIndex: 25 }, location: { position: "absolute", bottom: 406, right: 16, zIndex: 25 }, locationSheet: { bottom: 420 }, friendIndicator: { position: "absolute", top: 160, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: "rgba(21,25,29,.93)", borderWidth: 1, borderColor: "rgba(245,197,66,.3)", zIndex: 25 }, friendDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand }, friendText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 12 }, contentPanel: { position: "absolute", top: 450, left: 0, right: 0, bottom: 68, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "transparent", zIndex: 10 }, nearbyTitle: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }, locationHint: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, marginBottom: 10 }, cards: { gap: 8 }, loading: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 10 }, meta: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12 }, error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 12, paddingVertical: 16 } });
