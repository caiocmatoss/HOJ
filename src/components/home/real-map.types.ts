import type { ApiEvent, ApiVenue } from "@/services/api";
import type { NearbyPlace } from "@/services/api/resources/discovery";

export type RealMapProps = {
  venues: ApiVenue[];
  events: ApiEvent[];
  externalPlaces?: NearbyPlace[];
  selectedVenueId?: string | null;
  selectedEventId?: string | null;
  selectedExternalId?: string | null;
  onVenuePress?: (venue: ApiVenue) => void;
  onEventPress?: (event: ApiEvent) => void;
  onExternalPlacePress?: (place: NearbyPlace) => void;
  recenterKey?: number;
  height?: number;
};
