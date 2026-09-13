import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import { getVenues, type ApiVenue } from "@/services/api";
import { useLocationStore } from "@/store/location-store";
import type { LiveMapProps } from "./live-map.types";

export function LiveMap({ venues, events = [], externalPlaces = [], selectedVenueId, selectedEventId, onVenuePress, onEventPress, onExternalPlacePress, onRegionChanged, onLocationPress, recenterKey, height = 430 }: LiveMapProps) {
  const mapRef = useRef<MapView>(null);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const [fetchedVenues, setFetchedVenues] = useState<ApiVenue[]>([]);
  const hasLocation = latitude !== null && longitude !== null;
  const displayedVenues = venues ?? fetchedVenues;
  useEffect(() => { if (venues) return; let mounted = true; void getVenues().then((response) => { if (mounted && Array.isArray(response)) setFetchedVenues(response); }).catch(() => undefined); return () => { mounted = false; }; }, [venues]);
  const initialRegion = { latitude: latitude ?? -23.5505, longitude: longitude ?? -46.6333, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  const recenter = () => { if (hasLocation) mapRef.current?.animateToRegion({ ...initialRegion, latitude, longitude }, 450); onLocationPress?.(); };
  useEffect(() => { if (recenterKey && hasLocation) recenter(); }, [recenterKey]);
  return (
    <View style={[styles.container, { height }]}>
      <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation={hasLocation} onRegionChangeComplete={(_region: Region) => onRegionChanged?.()}>
        {displayedVenues.map((venue) => { const lat = Number(venue.latitude); const lng = Number(venue.longitude); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null; const selected = selectedVenueId === venue.id; return <Marker key={venue.id} coordinate={{ latitude: lat, longitude: lng }} onPress={() => onVenuePress?.(venue)} title={venue.name} description={venue.category}><View style={[styles.marker, selected && styles.markerSelected]}><Ionicons name="location" size={selected ? 25 : 20} color={selected ? "#0B0D0F" : "#F5C542"} /></View></Marker>; })}
        {events.map((event) => { const lat = Number(event.venue?.latitude); const lng = Number(event.venue?.longitude); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null; const selected = selectedEventId === event.id; return <Marker key={`event-${event.id}`} coordinate={{ latitude: lat, longitude: lng }} onPress={() => onEventPress?.(event)} title={event.title} description={event.category}><View style={[styles.marker, selected && styles.markerSelected]}><Ionicons name="calendar" size={selected ? 24 : 19} color={selected ? "#0B0D0F" : "#6ABFA0"} /></View></Marker>; })}
        {externalPlaces.map((place) => { const lat = Number(place.latitude); const lng = Number(place.longitude); if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null; return <Marker key={`external-${place.externalId}`} coordinate={{ latitude: lat, longitude: lng }} onPress={() => onExternalPlacePress?.(place)} title={place.name} description={place.category}><View style={[styles.marker, styles.externalMarker]}><Ionicons name="compass-outline" size={19} color="#D79BFF" /></View></Marker>; })}
      </MapView>
      <View style={styles.mapLabel}><Text style={styles.mapLabelText}>Mapa ao vivo</Text></View>
    </View>
  );
}
const styles = StyleSheet.create({ container: { borderRadius: 22, overflow: "hidden", backgroundColor: "#15191D", position: "relative" }, map: { flex: 1 }, mapLabel: { position: "absolute", top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: "rgba(11,13,15,0.78)" }, mapLabelText: { color: "#F4F5F2", fontSize: 11, fontWeight: "800" }, marker: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#15191D", borderWidth: 2, borderColor: "#F5C542", alignItems: "center", justifyContent: "center", elevation: 4 }, externalMarker: { borderColor: "#D79BFF" }, markerSelected: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F5C542", borderColor: "#FFF1A8" }, locationButton: { position: "absolute", right: 14, bottom: 14, width: 48, height: 48, borderRadius: 24, backgroundColor: "#15191D", borderWidth: 1, borderColor: "#293138", alignItems: "center", justifyContent: "center", elevation: 4 }, overlay: { position: "absolute", left: 12, right: 12, bottom: 14, padding: 10, borderRadius: 12, backgroundColor: "rgba(11,13,15,0.86)" }, overlayText: { color: "#B8BEC4", fontSize: 12, textAlign: "center" }, pressed: { opacity: 0.78 } });
