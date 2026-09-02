import { LiveMap } from "./LiveMap.native";
import type { LiveMapProps } from "./live-map.types";

export type { LiveMapProps } from "./live-map.types";

export function LiveMapContainer(props: LiveMapProps) {
  return <LiveMap {...props} />;
}
