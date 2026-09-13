import React from "react";
import { LiveMap } from "./LiveMap.native";
import type { RealMapProps } from "./real-map.types";

export function RealMap(props: RealMapProps) {
  return <LiveMap {...props} />;
}
