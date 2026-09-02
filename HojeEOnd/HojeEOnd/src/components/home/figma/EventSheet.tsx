import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ApiEvent } from "@/services/api";
import { MAIN_TAB_BAR_HEIGHT } from "@/features/navigation/tabBarMetrics";
import { colors, fonts, radii } from "@/theme/tokens";
import { VISUAL_CATEGORIES, normalizeVisualCategory } from "./visualCategories";

type Props = { event: ApiEvent; onClose: () => void; onViewDetails: () => void; ticketUrl?: string; onBuyTicket?: () => void };

export function EventSheet({ event, onClose, onViewDetails }: Props) {
  const category = normalizeVisualCategory(event.category ?? "event");
  const categoryColor = VISUAL_CATEGORIES[category].color;
  const date = formatEventDate(event.date);
  const price = formatPrice(event.price);
  return (
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Fechar prévia" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
      <View testID="event-sheet" style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.imageWrap}>
          {event.image ? <Image accessibilityLabel={`Imagem de ${event.title}`} source={{ uri: event.image }} style={styles.image} contentFit="cover" /> : <View style={[styles.image, styles.fallback]}><Ionicons name="calendar-outline" color={colors.textMuted} size={30} /></View>}
          <View testID="event-category-chip" style={[styles.categoryChip, { borderColor: categoryColor }]}><Text style={[styles.categoryText, { color: categoryColor }]}>{event.category?.toUpperCase()}</Text></View>
        </View>
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>{event.title}</Text>
          {event.venueName ? <Text style={styles.meta}>{event.venueName}{event.distance ? ` · ${event.distance}` : ""}</Text> : null}
          <View style={styles.infoRow}>
            {date ? <Info icon="calendar-outline" value={date} /> : null}
            {event.time ? <Info icon="time-outline" value={event.time} /> : null}
            {price ? <Info icon="ticket-outline" value={price} /> : null}
          </View>
          <View style={styles.actions}><Pressable accessibilityLabel={`Ver detalhes de ${event.title}`} accessibilityRole="button" testID="event-sheet-cta" style={({ pressed }) => [styles.primary, pressed && styles.pressed]} onPress={onViewDetails}><Text style={styles.primaryText}>Ver evento</Text><Ionicons name="arrow-forward" color={colors.background} size={17} /></Pressable></View>
        </View>
      </View>
    </View>
  );
}

function Info({ icon, value }: { icon: "calendar-outline" | "time-outline" | "ticket-outline"; value: string }) { return <View style={styles.infoChip}><Ionicons name={icon} color={colors.brand} size={14} /><Text style={styles.infoText}>{value}</Text></View>; }
function formatPrice(value: ApiEvent["price"]) { if (value == null || value === "") return null; const amount = Number(value); if (!Number.isFinite(amount)) return null; if (amount === 0) return "Gratuito"; return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount); }
function formatEventDate(value: string) { const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value); const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(value); if (Number.isNaN(date.getTime())) return value.includes("T") ? "" : value; return date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace(/\./g, ""); }
const styles = StyleSheet.create({ overlay: { bottom: MAIN_TAB_BAR_HEIGHT, justifyContent: "flex-end", left: 0, position: "absolute", right: 0, top: 0, zIndex: 40 }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(11,13,15,0.42)" }, sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 20, zIndex: 2 }, handle: { alignSelf: "center", backgroundColor: "#2A3340", borderRadius: 2, height: 4, marginBottom: 9, marginTop: 13, width: 36 }, imageWrap: { marginHorizontal: 16, marginTop: 8, position: "relative" }, image: { borderRadius: 16, height: 160, width: "100%" }, fallback: { alignItems: "center", backgroundColor: colors.elevated, justifyContent: "center" }, categoryChip: { backgroundColor: "rgba(11,13,15,0.8)", borderRadius: 20, borderWidth: 1, left: 12, paddingHorizontal: 10, paddingVertical: 4, position: "absolute", top: 12 }, categoryText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.4 }, content: { paddingHorizontal: 20, paddingTop: 16 }, title: { color: colors.text, fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.3 }, meta: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, marginTop: 3 }, infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, infoChip: { alignItems: "center", backgroundColor: colors.elevated, borderRadius: 10, flexDirection: "row", gap: 5, paddingHorizontal: 10, paddingVertical: 6 }, infoText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 12 }, actions: { flexDirection: "row", marginTop: 14 }, primary: { alignItems: "center", backgroundColor: colors.brand, borderRadius: radii.medium, flex: 1, flexDirection: "row", gap: 8, height: 48, justifyContent: "center" }, primaryText: { color: colors.background, fontFamily: fonts.bold, fontSize: 14 }, pressed: { opacity: 0.76 } });
