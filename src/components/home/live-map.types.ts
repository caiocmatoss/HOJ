import type { ApiEvent, ApiVenue } from "@/services/api";
import type { NearbyPlace } from "@/services/api/resources/discovery";

export type LiveMapProps = {
  venues?: ApiVenue[];
  selectedVenueId?: string | null;
  events?: ApiEvent[];
  externalPlaces?: NearbyPlace[];
  selectedEventId?: string | null;
  selectedExternalId?: string | null;
  onEventPress?: (event: ApiEvent) => void;
  onExternalPlacePress?: (place: NearbyPlace) => void;
  recenterKey?: number;
  onVenuePress?: (venue: ApiVenue) => void;
  onRegionChanged?: () => void;
  onLocationPress?: () => void;
  height?: number;
};
