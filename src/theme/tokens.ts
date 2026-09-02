import { Platform } from "react-native";

export const colors = {
  brand: "#F5C542",
  brandSecondary: "#C97B5A",
  brandPressed: "#D9AA2E",
  background: "#0B0D0F",
  surface: "#15191D",
  elevated: "#1C2228",
  surfacePressed: "#222930",
  text: "#F4F5F2",
  textSecondary: "#B8BEC4",
  textMuted: "#5A6472",
  danger: "#E05C5C",
  border: "rgba(248, 250, 252, 0.08)",
  borderStrong: "rgba(248, 250, 252, 0.14)",
  brandSoft: "rgba(245, 197, 66, 0.12)",
  brandBorder: "rgba(245, 197, 66, 0.28)",
  success: "#6ABFA0",
  successSoft: "rgba(106, 191, 160, 0.12)",
  dangerSoft: "rgba(239, 125, 125, 0.12)",
  mapBlock: "#131720",
  mapRoad: "#1E2630",
  mapSecondaryRoad: "#161C24",
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32 } as const;

export const fonts = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
  display: "DMSerifDisplay_400Regular",
} as const;

export const radii = {
  small: 12,
  medium: 16,
  large: 20,
  sheet: 24,
  pill: 999,
} as const;

export const shadows = {
  floating:
    Platform.select({
      web: {
        boxShadow: "0 10px 24px rgba(0, 0, 0, 0.28)",
      },
      default: {
        elevation: 10,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 24,
      },
    }) ?? {},
} as const;
