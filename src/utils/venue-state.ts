import type { ApiVenue } from "@/services/api";

export type VenueOccupancyState = {
  known: boolean;
  label: string;
  percentage: number | null;
};

export function getVenueOccupancyState(venue: Pick<ApiVenue, "occupancy" | "capacity">): VenueOccupancyState {
  const occupancy = Number(venue.occupancy);
  const capacity = venue.capacity == null ? null : Number(venue.capacity);
  const known = Number.isFinite(occupancy) && capacity !== null && Number.isFinite(capacity) && capacity > 0;
  if (!known) return { known: false, label: "Movimento indisponível", percentage: null };
  const percentage = Math.max(0, Math.min(100, occupancy));
  return { known: true, label: percentage > 70 ? "Cheio" : percentage > 40 ? "Movimentado" : "Tranquilo", percentage };
}

export type VenueAvailabilityState = { known: boolean; open: boolean | null; label: string };

export function getVenueAvailabilityState(venue: Pick<ApiVenue, "source" | "externalProvider" | "sourceClosedAt" | "status">): VenueAvailabilityState {
  if (venue.source === "IMPORTED" && venue.externalProvider === "FSQ_OS") {
    if (venue.sourceClosedAt) return { known: true, open: false, label: "Fechado" };
    return { known: false, open: null, label: "Horário indisponível" };
  }
  const open = venue.status === "OPEN" || venue.status === "open";
  return { known: true, open, label: open ? "Aberto" : "Fechado" };
}
