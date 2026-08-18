import { Platform } from "react-native";

import { LiveMap as NativeLiveMap } from "./LiveMap.native";
import { LiveMap as WebLiveMap } from "./LiveMap.web";

export function LiveMap() {
  if (Platform.OS === "web") {
    return <WebLiveMap />;
  }

  return <NativeLiveMap />;
}