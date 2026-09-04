import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ApiVenue } from "@/services/api";
import { MAIN_TAB_BAR_HEIGHT } from "@/features/navigation/tabBarMetrics";
import { colors, fonts, radii } from "@/theme/tokens";
import { OccupancyBar } from "./OccupancyBar";
import { VISUAL_CATEGORIES, normalizeVisualCategory } from "./visualCategories";
import { getVenueOccupancyState } from "@/utils/venue-state";

type Props = { venue: ApiVenue; distance?: string; onClose: () => void; onViewDetails: () => void; friends?: Array<{ name: string; avatar?: string | null }>; onShare?: () => void };

export function VenueSheet({ venue, distance, onClose, onViewDetails }: Props) {
  const occupancyState = getVenueOccupancyState(venue);
  const level = occupancyState.known ? (occupancyState.percentage! > 70 ? 2 : occupancyState.percentage! > 40 ? 1 : 0) : 0;
  const visualCategory = normalizeVisualCategory(venue.category);
  const categoryColor = VISUAL_CATEGORIES[visualCategory].color;
  const cleanDistance = distance?.trim();

  return (
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="Fechar prévia" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <View testID="venue-sheet" style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.imageWrap}>
            {venue.image ? <Image accessibilityLabel={`Foto de ${venue.name}`} source={{ uri: venue.image }} style={styles.image} contentFit="cover" /> : <View style={[styles.image, styles.imageFallback]}><Ionicons name="business-outline" size={30} color={colors.textMuted} /></View>}
            <View style={[styles.categoryChip, { borderColor: categoryColor }]}><Text style={[styles.categoryText, { color: categoryColor }]}>{visualCategory.toUpperCase()}</Text></View>
          </View>
          <View style={styles.content}>
            <View style={styles.row}>
              <View style={styles.flex}><Text numberOfLines={2} style={styles.title}>{venue.name}</Text><Text style={styles.meta}>{cleanDistance ? `${venue.category} · ${cleanDistance}` : venue.category}</Text></View>
              <View style={styles.occ}><View style={styles.occLabel}><View style={[styles.occDot, { backgroundColor: occupancyState.known ? (level === 2 ? colors.danger : level === 1 ? colors.brand : colors.success) : colors.textMuted }]} /><Text style={styles.occText}>{occupancyState.label}</Text></View>{occupancyState.known ? <OccupancyBar level={level as 0 | 1 | 2} /> : null}</View>
            </View>
            <View style={styles.actions}><Pressable accessibilityLabel={`Ver detalhes de ${venue.name}`} accessibilityRole="button" testID="venue-sheet-cta" style={({ pressed }) => [styles.primary, pressed && styles.pressed]} onPress={onViewDetails}><Text style={styles.primaryText}>Ver local</Text><Ionicons name="arrow-forward" color={colors.background} size={17} /></Pressable></View>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: { bottom: MAIN_TAB_BAR_HEIGHT, justifyContent: "flex-end", left: 0, position: "absolute", right: 0, top: 0, zIndex: 40 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(11,13,15,0.42)" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20, zIndex: 2 },
  handle: { alignSelf: "center", backgroundColor: "#2A3340", borderRadius: 2, height: 4, marginBottom: 9, marginTop: 13, width: 36 },
  imageWrap: { marginHorizontal: 16, marginTop: 8, position: "relative" },
  image: { borderRadius: 16, height: 160, width: "100%" },
  imageFallback: { alignItems: "center", backgroundColor: colors.elevated, justifyContent: "center" },
  categoryChip: { backgroundColor: "rgba(11,13,15,0.8)", borderRadius: 20, borderWidth: 1, left: 12, paddingHorizontal: 10, paddingVertical: 4, position: "absolute", top: 12 },
  categoryText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.4 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  row: { alignItems: "flex-start", flexDirection: "row", gap: 12 },
  flex: { flex: 1 },
  title: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.3 },
  meta: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, marginTop: 3 },
  occ: { alignItems: "flex-end", gap: 5 },
  occLabel: { alignItems: "center", flexDirection: "row", gap: 6 },
  occDot: { borderRadius: 3, height: 6, width: 6 },
  occText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 12 },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  primary: { alignItems: "center", backgroundColor: colors.brand, borderRadius: 14, flex: 1, flexDirection: "row", gap: 8, height: 48, justifyContent: "center" },
  primaryText: { color: colors.background, fontFamily: fonts.bold, fontSize: 14 },
  pressed: { opacity: 0.76 },
});
