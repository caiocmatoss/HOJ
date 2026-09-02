import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "@/theme/tokens";

/** SVG paths ported from NAV_ITEMS in figma-make-home/src/App.tsx. */
export function FigmaTabIcon({ name, focused }: { name: string; focused: boolean }) {
  const color = focused ? colors.brand : colors.textMuted;
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    {name === "map" && <><Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" {...stroke} fill={focused ? "#F5C54220" : "none"} /><Circle cx="12" cy="9" r="2.5" {...stroke} /></>}
    {name === "explore" && <><Circle cx="12" cy="12" r="9" {...stroke} /><Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" {...stroke} /></>}
    {name === "events" && <><Rect x="3" y="5" width="18" height="16" rx="3" {...stroke} /><Path d="M16 3v4M8 3v4M3 11h18" {...stroke} /></>}
    {name === "friends" && <><Circle cx="9" cy="8" r="3.5" {...stroke} /><Path d="M2 20c0-4 3.13-7 7-7s7 3 7 7" {...stroke} /><Path d="M19 8v6M22 11h-6" {...stroke} /></>}
    {name === "chat" && <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" {...stroke} fill={focused ? "#F5C54218" : "none"} />}
    {name === "profile" && <><Circle cx="12" cy="8" r="4" {...stroke} /><Path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" {...stroke} /></>}
  </Svg>;
}
