import type { ApiVenue } from "@/services/api";

export type VenueOccupancyState = {
  known: boolean;
  label: string;
  percentage: number | null;
};

export function getVenueOccupancyState(venue: Pick<ApiVenue, "occupancyPercent">): VenueOccupancyState {
  const percentage = venue.occupancyPercent == null ? null : Number(venue.occupancyPercent);
  const known = percentage !== null && Number.isFinite(percentage);
  if (!known) return { known: false, label: "Movimento indisponível", percentage: null };
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