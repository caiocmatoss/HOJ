import React from "react";
import { RealMap } from "./RealMap.native";
import type { RealMapProps } from "./real-map.types";

export type { RealMapProps } from "./real-map.types";

export function RealMapContainer(props: RealMapProps) {
  return <RealMap {...props} />;
}
