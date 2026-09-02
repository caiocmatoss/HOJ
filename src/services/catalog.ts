import {
  getEvents as getApiEvents,
  getVenues as getApiVenues,
  type ApiEvent,
  type ApiVenue,
} from "@/services/api";

export type HomeVenue = {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  occupancy: number;
  description: string | null;
  image: string | null;
  rating: number | null;
  dj: string | null;
  promotion: string | null;
  playlist: string | null;
  status: "open" | "closed";
};

export type HomeEvent = {
  id: string;
  title: string;
  image: string | null;
  venueId: string;
  venueName: string;
  date: string;
  time: string;
  category: string;
  description: string | null;
  price: number | null;
  attendees: number;
  isLive: boolean;
};

function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeVenue(venue: ApiVenue): HomeVenue {
  return {
    id: venue.id,
    name: venue.name,
    category: venue.category,
    address: venue.address,
    latitude: toNumber(venue.latitude) ?? 0,
    longitude: toNumber(venue.longitude) ?? 0,
    occupancy: venue.occupancy ?? 0,
    description: venue.description,
    image: venue.image,
    rating: toNumber(venue.rating),
    dj: venue.dj,
    promotion: venue.promotion,
    playlist: venue.playlist,
    status: venue.status === "OPEN" ? "open" : "closed",
  };
}

function normalizeEvent(event: ApiEvent): HomeEvent {
  return {
    id: event.id,
    title: event.title,
    image: event.image,
    venueId: event.venueId,
    venueName: event.venueName ?? event.venue?.name ?? "Local",
    date: event.date,
    time: event.time,
    category: event.category,
    description: event.description,
    price: toNumber(event.price),
    attendees: event.attendees ?? 0,
    isLive: event.isLive,
  };
}

/** Compatibility/domain layer for callers that need home-specific normalization. */
export async function getVenues(): Promise<HomeVenue[]> {
  const response = await getApiVenues();
  return response.map(normalizeVenue);
}

/** Compatibility/domain layer for callers that need home-specific normalization. */
export async function getEvents(): Promise<HomeEvent[]> {
  const response = await getApiEvents();
  return response.map(normalizeEvent);
}