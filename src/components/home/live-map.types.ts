import type { ApiVenue } from "@/services/api";

export type LiveMapProps = {
  venues?: ApiVenue[];
  selectedVenueId?: string | null;
  onVenuePress?: (venue: ApiVenue) => void;
  onRegionChanged?: () => void;
  onLocationPress?: () => void;
  height?: number;
};
