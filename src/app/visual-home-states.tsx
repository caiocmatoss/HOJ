/** DEV-only visual harness for production Home interaction states. */
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EventSheet } from "@/components/home/figma/EventSheet";
import { HomeLoadingOverlay, HomeNoLocationOverlay, HomeNoResultsOverlay, HomeOfflineOverlay } from "@/components/home/figma/HomeStateOverlays";
import { VenueSheet } from "@/components/home/figma/VenueSheet";
import FigmaProductionHome from "@/features/home/FigmaProductionHome";
import { colors, fonts } from "@/theme/tokens";
import type { ApiEvent, ApiVenue } from "@/services/api";

const fixtureImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='500' viewBox='0 0 900 500'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23C97B5A'/%3E%3Cstop offset='1' stop-color='%23151A24'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='500' fill='url(%23g)'/%3E%3Ccircle cx='680' cy='190' r='120' fill='%23F5C542' fill-opacity='.35'/%3E%3Ccircle cx='240' cy='350' r='160' fill='%231C2228' fill-opacity='.7'/%3E%3C/svg%3E";
const venue: ApiVenue = { id: "visual-venue", name: "Local de demonstração", category: "Lounge", address: "São Paulo", latitude: -23.55, longitude: -46.63, occupancy: 55, capacity: null, source: "MANUAL", externalProvider: null, externalId: null, locality: null, region: null, country: null, postcode: null, phone: null, website: null, sourceRefreshedAt: null, sourceClosedAt: null, description: null, image: fixtureImage, rating: null, people: 0, dj: null, promotion: null, playlist: null, status: "OPEN" };
const event: ApiEvent = { id: "visual-event", title: "Evento de demonstração", image: fixtureImage, venueId: venue.id, venueName: venue.name, date: "Hoje", time: "20h", category: "Festival", description: null, price: 120, attendees: 0, isLive: false };
const fixtureFriends = [{ name: "Lara" }, { name: "Mateus" }];
type State = "venue" | "event" | "loading" | "no-results" | "no-location" | "offline";
const states: State[] = ["venue", "event", "loading", "no-results", "no-location", "offline"];

export default function VisualHomeStates() {
  const initial = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("state") : null;
  const [state, setState] = useState<State>(states.includes(initial as State) ? initial as State : "venue");
  if (!__DEV__) return <View style={styles.blocked}><Text style={styles.text}>Disponível somente em desenvolvimento.</Text></View>;
  const capture = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("capture") === "1";
  return <View style={styles.root}><FigmaProductionHome />{!capture && <View style={styles.toolbar}>{states.map((item) => <Pressable key={item} onPress={() => setState(item)} style={[styles.button, state === item && styles.active]}><Text style={styles.buttonText}>{item}</Text></Pressable>)}</View>}{state === "venue" && <VenueSheet venue={venue} distance="0,8 km" friends={fixtureFriends} onClose={() => undefined} onViewDetails={() => undefined} />}{state === "event" && <EventSheet event={event} ticketUrl="https://example.invalid/ticket" onClose={() => undefined} onViewDetails={() => undefined} onBuyTicket={() => undefined} />}{state === "loading" && <HomeLoadingOverlay />}{state === "no-results" && <HomeNoResultsOverlay />}{state === "no-location" && <HomeNoLocationOverlay />}{state === "offline" && <HomeOfflineOverlay />}</View>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background }, toolbar: { position: "relative", zIndex: 100, flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 16 }, button: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.elevated }, active: { backgroundColor: colors.brand }, buttonText: { color: colors.text, fontFamily: fonts.medium, fontSize: 12 }, text: { color: colors.text, fontFamily: fonts.regular }, blocked: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background } });
