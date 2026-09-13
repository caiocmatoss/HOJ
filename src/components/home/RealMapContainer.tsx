import React from "react";
import { Platform } from "react-native";
import type { RealMapProps } from "./real-map.types";

export type { RealMapProps } from "./real-map.types";

export function RealMapContainer(props: RealMapProps) {
  if (Platform.OS === "web") {
    const WebMap = require("./RealMap.web").RealMap as typeof import("./RealMap.web").RealMap;
    return <WebMap {...props} />;
  }
  const NativeMap = require("./RealMap.native").RealMap as typeof import("./RealMap.native").RealMap;
  return <NativeMap {...props} />;
}
