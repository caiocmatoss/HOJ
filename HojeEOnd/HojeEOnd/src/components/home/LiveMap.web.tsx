import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { getVenues, type ApiVenue } from "@/services/api";
import { useLocationStore } from "@/store/location-store";
import type { LiveMapProps } from "./live-map.types";

export function LiveMap({ venues, selectedVenueId, onVenuePress, onRegionChanged, onLocationPress, height = 360 }: LiveMapProps) {
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const [fetchedVenues, setFetchedVenues] = useState<ApiVenue[]>([]);
  const displayedVenues = venues ?? fetchedVenues;
  const hasLocation = latitude !== null && longitude !== null;
  useEffect(() => {
    if (venues) return;
    let mounted = true;
    void getVenues().then((response) => { if (mounted && Array.isArray(response)) setFetchedVenues(response); }).catch(() => undefined);
    return () => { mounted = false; };
  }, [venues]);
  return <View style={[styles.container, { height }]}>
    <Pressable accessibilityLabel="Mapa" onPress={onRegionChanged} style={styles.mapArea}>
      <View style={styles.urbanBlockOne} /><View style={styles.urbanBlockTwo} /><View style={styles.urbanBlockThree} />
      <View style={styles.streetOne} /><View style={styles.streetTwo} /><View style={styles.streetThree} /><View style={styles.streetFour} />
      {displayedVenues.slice(0, 12).map((venue, index) => <Pressable key={venue.id} onPress={() => onVenuePress?.(venue)} style={[styles.marker, markerPosition(index)]}><View style={[styles.markerPin, selectedVenueId === venue.id && styles.markerSelected]}><Ionicons name="location" size={selectedVenueId === venue.id ? 24 : 20} color={selectedVenueId === venue.id ? "#0B0D0F" : "#F5C542"} /></View></Pressable>)}
      {hasLocation && <View style={styles.userMarker}><View style={styles.userDot} /><Text style={styles.userLabel}>Você</Text></View>}
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Centralizar localização" onPress={onLocationPress} style={styles.locationButton}><Ionicons name="locate" size={22} color="#F5C542" /></Pressable>
  </View>;
}
function markerPosition(index: number): ViewStyle { const positions: ViewStyle[] = [{ left: "18%", top: "35%" }, { right: "18%", top: "28%" }, { left: "46%", top: "58%" }, { right: "28%", bottom: "18%" }]; return positions[index % positions.length]; }
const styles = StyleSheet.create({
  container: { borderRadius: 16, overflow: "hidden", backgroundColor: "#131A1E", position: "relative" },
  mapArea: { flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#131A1E" },
  urbanBlockOne: { position: "absolute", width: "29%", height: "24%", left: "8%", top: "16%", backgroundColor: "#171E22", borderRadius: 8 },
  urbanBlockTwo: { position: "absolute", width: "25%", height: "30%", right: "9%", top: "42%", backgroundColor: "#192522", borderRadius: 10 },
  urbanBlockThree: { position: "absolute", width: "24%", height: "20%", left: "36%", bottom: "8%", backgroundColor: "#171E22", borderRadius: 8 },
  streetOne: { position: "absolute", left: "-8%", right: "-8%", top: "34%", height: 3, backgroundColor: "#283137", transform: [{ rotate: "-8deg" }] },
  streetTwo: { position: "absolute", left: "-8%", right: "-8%", top: "68%", height: 2, backgroundColor: "#20282D", transform: [{ rotate: "7deg" }] },
  streetThree: { position: "absolute", top: "-8%", bottom: "-8%", left: "33%", width: 2, backgroundColor: "#20282D", transform: [{ rotate: "12deg" }] },
  streetFour: { position: "absolute", top: "-8%", bottom: "-8%", left: "66%", width: 3, backgroundColor: "#283137", transform: [{ rotate: "-10deg" }] },
  marker: { position: "absolute", alignItems: "center" },
  markerPin: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#15191D", borderWidth: 2, borderColor: "#F5C542", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  markerSelected: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F5C542" },
  userMarker: { position: "absolute", left: "47%", top: "47%", alignItems: "center" },
  userDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#62A8E8", borderWidth: 4, borderColor: "#F4F5F2" },
  userLabel: { color: "#F4F5F2", backgroundColor: "#0B0D0F", borderRadius: 7, paddingHorizontal: 6, paddingVertical: 3, marginTop: 3, fontSize: 10, fontWeight: "700" },
  locationButton: { position: "absolute", right: 14, bottom: 14, width: 44, height: 44, borderRadius: 22, backgroundColor: "#15191D", borderWidth: 1, borderColor: "#293138", alignItems: "center", justifyContent: "center", elevation: 4 },
});
