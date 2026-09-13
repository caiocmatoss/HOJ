import "maplibre-gl/dist/maplibre-gl.css";
import "./real-map-attribution.css";
import * as maplibregl from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocationStore } from "@/store/location-store";
import type { RealMapProps } from "./real-map.types";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/dark";

function validPoint(latitude: unknown, longitude: unknown): [number, number] | null {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 ? [lng, lat] : null;
}

export function RealMap({ venues, events, externalPlaces = [], selectedVenueId, selectedEventId, onVenuePress, onEventPress, onExternalPlacePress, recenterKey, height = 480 }: RealMapProps) {
  const nodeRef = useRef<any>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const venuePoints = useMemo(() => venues.flatMap((venue) => { const point = validPoint(venue.latitude, venue.longitude); return point ? [{ venue, point }] : []; }), [venues]);
  const eventPoints = useMemo(() => events.flatMap((event) => { const point = validPoint(event.venue?.latitude, event.venue?.longitude); return point ? [{ event, point }] : []; }), [events]);
  const externalPoints = useMemo(() => externalPlaces.flatMap((place) => { const point = validPoint(place.latitude, place.longitude); return point ? [{ place, point }] : []; }), [externalPlaces]);
  const displayPoints = useMemo(() => [...venuePoints.map((item) => ({ ...item, kind: "venue" as const })), ...eventPoints.map((item) => ({ ...item, kind: "event" as const })), ...externalPoints.map((item) => ({ ...item, kind: "external" as const }))], [eventPoints, externalPoints, venuePoints]);
  const displayVenuePoints = useMemo(() => displayPoints.filter((item): item is (typeof venuePoints[number] & { kind: "venue" }) => item.kind === "venue"), [displayPoints]);
  const displayEventPoints = useMemo(() => displayPoints.filter((item): item is (typeof eventPoints[number] & { kind: "event" }) => item.kind === "event"), [displayPoints]);
  const displayExternalPoints = useMemo(() => displayPoints.filter((item): item is (typeof externalPoints[number] & { kind: "external" }) => item.kind === "external"), [displayPoints]);
  const initial = validPoint(latitude, longitude) ?? venuePoints[0]?.point ?? eventPoints[0]?.point ?? [-46.6333, -23.5505];
  const initialCameraDone = useRef(false);

  useEffect(() => {
    if (!nodeRef.current || mapRef.current) return undefined;
    const map = new maplibregl.Map({ container: nodeRef.current, style: OPENFREEMAP_STYLE, center: initial, zoom: 13, cooperativeGestures: true, attributionControl: { compact: true } });
    const onLoad = () => { setMapLoading(false); setMapReady(true); };
    const onIdle = () => { setMapLoading(false); setMapReady(true); };
    const onError = () => { setMapLoading(false); setMapError("Não foi possível carregar o mapa."); };
    map.on("load", onLoad);
    map.on("idle", onIdle);
    map.on("error", onError);
    const timeout = window.setTimeout(() => { if (!map.loaded()) { setMapLoading(false); setMapError("Não foi possível carregar o mapa."); } }, 15000);
    mapRef.current = map;
    return () => { window.clearTimeout(timeout); map.off("load", onLoad); map.off("idle", onIdle); map.off("error", onError); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || recenterKey === 0) return;
    const point = validPoint(latitude, longitude);
    if (point) map.easeTo({ center: point, duration: 450 });
  }, [latitude, longitude, recenterKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || initialCameraDone.current || displayPoints.length === 0) return;
    const bounds = displayPoints.map((item) => item.point);
    const userPoint = validPoint(latitude, longitude);
    if (userPoint) bounds.push(userPoint);
    if (bounds.length > 1) {
      const fitted = new maplibregl.LngLatBounds(bounds[0], bounds[0]);
      bounds.slice(1).forEach((point) => fitted.extend(point));
      map.fitBounds(fitted, { padding: 48, maxZoom: 13 });
    }
    initialCameraDone.current = true;
  }, [displayPoints, latitude, longitude, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return undefined;
    const markers: maplibregl.Marker[] = [];
    const addMarker = (point: [number, number], color: string, selected: boolean, onClick: () => void, label: string) => {
      const element = document.createElement("button");
      element.type = "button";
      element.setAttribute("aria-label", label);
      element.style.cssText = `width:${selected ? 24 : 18}px;height:${selected ? 24 : 18}px;border-radius:50%;border:2px solid ${color};background:${selected ? color : "#15191D"};box-shadow:0 0 0 3px rgba(11,13,15,.45);padding:0;cursor:pointer;z-index:10;`;
      element.addEventListener("click", (event) => { event.stopPropagation(); onClick(); });
      const marker = new maplibregl.Marker({ element }).setLngLat(point).addTo(map);
      markers.push(marker);
    };
    displayVenuePoints.forEach(({ venue, point }) => addMarker(point, "#F5C542", selectedVenueId === venue.id, () => onVenuePress?.(venue), venue.name));
    displayEventPoints.forEach(({ event, point }) => addMarker(point, "#6ABFA0", selectedEventId === event.id, () => onEventPress?.(event), event.title));
    displayExternalPoints.forEach(({ place, point }) => addMarker(point, "#D79BFF", false, () => onExternalPlacePress?.(place), place.name));
    const userPoint = validPoint(latitude, longitude);
    if (userPoint) {
      const element = document.createElement("div");
      element.setAttribute("aria-label", "Sua localização");
      element.style.cssText = "width:14px;height:14px;border-radius:50%;background:#4A8FE8;border:2px solid #F4F5F2;box-shadow:0 0 0 5px rgba(74,143,232,.22);";
      const marker = new maplibregl.Marker({ element }).setLngLat(userPoint).addTo(map);
      markers.push(marker);
    }
    return () => markers.forEach((marker) => marker.remove());
  }, [displayEventPoints, displayExternalPoints, displayVenuePoints, latitude, longitude, mapReady, onEventPress, onExternalPlacePress, onVenuePress, selectedEventId, selectedVenueId]);

  return <View style={[styles.container, { height }]}><View ref={nodeRef} style={styles.map} />{mapLoading ? <View pointerEvents="none" style={styles.status}><ActivityIndicator color="#F5C542" /><Text style={styles.statusText}>Carregando mapa…</Text></View> : null}{mapError ? <View pointerEvents="none" style={styles.status}><Text style={styles.statusText}>{mapError}</Text></View> : null}</View>;
}

const styles = StyleSheet.create({ container: { overflow: "hidden", borderRadius: 22, backgroundColor: "#15191D", position: "relative" }, map: { height: "100%", width: "100%" }, status: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(11,13,15,.72)" }, statusText: { color: "#B8BEC4", fontSize: 12 } });
