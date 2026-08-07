import React from "react";
import { Platform } from "react-native";

export function LiveMapContainer() {
  if (Platform.OS === "web") {
    const WebMap = require("./LiveMap.web").LiveMap;
    return <WebMap />;
  }

  const NativeMap = require("./LiveMap.native").LiveMap;
  return <NativeMap />;
}