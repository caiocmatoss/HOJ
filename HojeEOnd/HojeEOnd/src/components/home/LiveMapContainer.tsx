import React from "react";
import { Platform } from "react-native";
import type { LiveMapProps } from "./live-map.types";

export type { LiveMapProps } from "./live-map.types";

export function LiveMapContainer(props: LiveMapProps) {
  if (Platform.OS === "web") {
    const WebMap = require("./LiveMap.web").LiveMap;
    return <WebMap {...props} />;
  }

  const NativeMap = require("./LiveMap.native").LiveMap;
  return <NativeMap {...props} />;
}
