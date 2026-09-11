import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFriendsQuery } from "@/services/api/resources/friends";
import { useCheckinHistoryQuery } from "@/services/api/resources/checkins";
import { useFavoritesQuery } from "@/services/api/resources/favorites";
import { logout as logoutRemote } from "@/services/api/auth";
import { useChatStore } from "@/store/chat-store";

import { useUserStore } from "@/store/user-store";
import { colors, fonts } from "@/theme/tokens";
import { resolveBackendMediaUrl } from "@/services/api";
import { useMeQuery } from "@/services/api/resources/profile";
import { getProfileCover } from "@/services/profile/profile-cover-storage";

export default function FigmaProfileExperience() {
  const legacyUser = useUserStore((s) => s.user);
  const meQuery = useMeQuery();
  const user = meQuery.data ?? legacyUser;
  const [coverUri, setCoverUri] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) {
        setCoverUri(null);
        return;
      }

      let active = true;
      void getProfileCover(user.id).then((uri) => {
        if (active) setCoverUri(uri);
      });

      return () => {
        active = false;
      };
    }, [user?.id]),
  );
  const favoritesQuery = useFavoritesQuery();
  const historyQuery = useCheckinHistoryQuery();
  const favorites = (favoritesQuery.data ?? []).map((item) => item.venue);
  const clearChats = useChatStore((s) => s.clearAllChats);
  const friendsQuery = useFriendsQuery({ page: 1, limit: 100 });
  const friends = friendsQuery.data?.items ?? [];
  const history = historyQuery.data ?? [];
  const [tab, setTab] = useState<"favoritos" | "historico">("favoritos");
  const loading = favoritesQuery.isLoading || historyQuery.isLoading;

  if (!user) return <View style={styles.page}><Text style={styles.emptyTitle}>Sua conta não está disponível</Text></View>;
  const name = user.name.trim() || "Usuário";
  const placesCount = new Set(history.map((item) => item.venueId)).size;
  const handleLogout = async () => { await logoutRemote(); clearChats(); router.replace("/(auth)/login"); };

  return <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View style={styles.hero}>
      <View style={styles.heroMedia}>
        <LinearGradient colors={[colors.elevated, "#0F1820"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBackdrop} />
        <Image source={coverUri ? { uri: coverUri } : require("../../../assets/images/profile-cover.jpg")} resizeMode="cover" style={styles.heroCover} />
        <LinearGradient
          colors={["transparent", "transparent", colors.background]}
          locations={[0, 0.4, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.heroFade}
        />
      </View>
      <Pressable accessibilityLabel="Configurações" style={styles.settings}><Ionicons name="settings-outline" size={17} color={colors.textSecondary} /></Pressable>
      <View style={styles.heroAvatar}><Avatar name={name} uri={resolveBackendMediaUrl(user.avatar)} size={72} /></View>
    </View>
    <View style={styles.profileInfo}>
      <View style={styles.infoCopy}><Text style={styles.name}>{name}</Text>{user.username || user.city ? <Text style={styles.username}>{[user.username ? `@${user.username.replace(/^@+/, "")}` : null, user.city].filter(Boolean).join(" · ")}</Text> : null}{user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}</View>
      <Pressable accessibilityLabel="Editar perfil" onPress={() => router.push("/(main)/edit-profile")} style={styles.edit}><Text style={styles.editText}>Editar</Text></Pressable>
    </View>
    <View style={styles.stats}><Stat value={String(placesCount)} label="Lugares" /><View style={styles.divider} /><Stat value="—" label="Eventos" /><View style={styles.divider} /><Stat value={String(friends.length)} label="Amigos" /></View>
    {loading ? <ActivityIndicator color={colors.brand} style={styles.loader} /> : null}
    <View style={styles.segmented}><Pressable onPress={() => setTab("favoritos")} style={[styles.segment, tab === "favoritos" && styles.segmentActive]}><Text style={[styles.segmentText, tab === "favoritos" && styles.segmentTextActive]}>❤️ Favoritos</Text></Pressable><Pressable onPress={() => setTab("historico")} style={[styles.segment, tab === "historico" && styles.segmentActive]}><Text style={[styles.segmentText, tab === "historico" && styles.segmentTextActive]}>🕐 Histórico</Text></Pressable></View>
    {tab === "favoritos" ? <View style={styles.favoriteGrid}>{favorites.length ? favorites.slice(0, 4).map((venue) => <Pressable key={venue.id} onPress={() => router.push({ pathname: "/venue/[id]", params: { id: venue.id } })} style={styles.favoriteCard}>{venue.image ? <Image source={{ uri: venue.image }} style={styles.favoriteImage} /> : <View style={styles.favoriteImageFallback}><Ionicons name="location-outline" size={20} color={colors.brand} /></View>}<View style={styles.favoriteCopy}><Text numberOfLines={1} style={styles.rowTitle}>{venue.name}</Text><Text style={styles.rowMeta}>{venue.category}</Text></View></Pressable>) : <Text style={styles.muted}>Seus lugares favoritos aparecerão aqui.</Text>}</View> : <View style={styles.historyList}>{history.length ? history.map((item) => <Pressable key={item.id} onPress={() => item.venueId && router.push({ pathname: "/venue/[id]", params: { id: item.venueId } })} style={styles.historyRow}><View style={styles.historyDot} /><View><Text style={styles.historyTitle}>{item.venue?.name ?? "Local visitado"}</Text><Text style={styles.rowMeta}>{new Date(item.checkedInAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</Text></View></Pressable>) : <Text style={styles.muted}>Seu histórico de visitas aparecerá aqui.</Text>}</View>}
    <View style={styles.card}><Menu icon="notifications-outline" label="Notificações" onPress={() => router.push("/(main)/notifications")} /><Menu icon="people-outline" label="Grupos" onPress={() => router.push("/(main)/chat")} /><Menu icon="location-outline" label="Localização" onPress={() => router.push("/(main)/location")} /><Menu icon="lock-closed-outline" label="Privacidade" onPress={() => router.push("/(main)/privacy")} /><Menu icon="color-palette-outline" label="Aparência" onPress={() => router.push("/(main)/appearance")} /><Menu icon="help-circle-outline" label="Ajuda e suporte" onPress={() => router.push("/(main)/help")} /></View>
    <Pressable onPress={handleLogout} style={styles.logout}><Ionicons name="log-out-outline" size={19} color={colors.danger} /><Text style={styles.logoutText}>Sair da conta</Text></Pressable>
  </ScrollView>;
}

function Avatar({ name, uri, size }: { name: string; uri?: string | null; size: number }) { const [failed, setFailed] = useState(false); useEffect(() => { setFailed(false); }, [uri]); if (uri && !failed) return <Image onError={() => setFailed(true)} source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />; return <LinearGradient colors={[colors.brand, colors.brandSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}><Text style={styles.avatarInitial}>{name.charAt(0).toUpperCase()}</Text></LinearGradient>; }
function Stat({ value, label }: { value: string; label: string }) { return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function Menu({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>["name"]; label: string; onPress?: () => void }) { if (label === "Grupos") return null; return <Pressable disabled={!onPress} onPress={onPress} style={styles.menu}><Ionicons name={icon} size={19} color={colors.brand} /><Text style={styles.menuText}>{label}</Text>{onPress ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}</Pressable>; }

const extraStyles = StyleSheet.create({
  segmented: { marginHorizontal: 20, marginTop: 18, backgroundColor: colors.surface, borderRadius: 12, padding: 4, flexDirection: "row" },
  segment: { flex: 1, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: colors.elevated },
  segmentText: { color: colors.textMuted, fontSize: 13 },
  segmentTextActive: { color: colors.text, fontFamily: fonts.semibold },
  favoriteGrid: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  favoriteCard: { width: "48%", borderRadius: 14, backgroundColor: colors.surface, overflow: "hidden" },
  favoriteImage: { width: "100%", height: 90, backgroundColor: colors.elevated },
  favoriteImageFallback: { width: "100%", height: 90, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center" },
  favoriteCopy: { paddingHorizontal: 10, paddingVertical: 8 },
  historyList: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  historyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mapRoad },
  historyTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
});
const styles: any = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 120 },
  hero: { height: 130, position: "relative", overflow: "visible", backgroundColor: colors.background },
  heroMedia: { position: "absolute", top: 0, left: 0, right: 0, height: 130, overflow: "hidden", backgroundColor: colors.elevated },
  heroBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.elevated },
  heroFade: { ...StyleSheet.absoluteFill },
  settings: { display: "none", position: "absolute", right: 16, top: 14, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(11,13,15,0.6)", alignItems: "center", justifyContent: "center" },
  heroCover: { ...StyleSheet.absoluteFill, opacity: 0.4 },
  heroAvatar: { position: "absolute", left: 20, bottom: -26, zIndex: 3, elevation: 3, borderRadius: 40, borderWidth: 3, borderColor: colors.background, backgroundColor: colors.background },
  avatarFallback: { backgroundColor: colors.brandSecondary, alignItems: "center", justifyContent: "center" }, avatarInitial: { color: colors.background, fontFamily: fonts.bold, fontSize: 26 },
  profileInfo: { paddingHorizontal: 20, paddingTop: 36, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, infoCopy: { flex: 1 }, name: { color: colors.text, fontFamily: fonts.bold, fontSize: 20 }, username: { color: colors.textMuted, fontSize: 13, marginTop: 2 }, bio: { color: colors.textSecondary, fontSize: 13, marginTop: 7 }, edit: { borderColor: colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }, editText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  stats: { marginHorizontal: 20, marginTop: 18, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.surface, flexDirection: "row" }, stat: { flex: 1, alignItems: "center" }, statValue: { color: colors.brand, fontFamily: fonts.display, fontSize: 20 }, statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 }, divider: { width: 1, backgroundColor: colors.borderStrong, height: 32 }, section: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2, marginHorizontal: 20, marginTop: 24, marginBottom: 10 }, card: { marginHorizontal: 20, backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, overflow: "hidden" }, row: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 12, borderBottomColor: colors.border, borderBottomWidth: 1 }, thumb: { width: 42, height: 42, borderRadius: 9, backgroundColor: colors.elevated }, thumbFallback: { width: 42, height: 42, borderRadius: 9, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" }, rowCopy: { flex: 1 }, rowTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 }, rowMeta: { color: colors.textMuted, fontSize: 11, marginTop: 3 }, muted: { color: colors.textMuted, fontSize: 12, paddingVertical: 20 }, menu: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 12, borderBottomColor: colors.border, borderBottomWidth: 1 }, menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center" }, menuText: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 13 }, logout: { marginHorizontal: 20, marginTop: 24, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: "rgba(224,92,92,0.2)", backgroundColor: colors.dangerSoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 }, logoutText: { color: colors.danger, fontFamily: fonts.semibold, fontSize: 13 }, loader: { marginTop: 16 }, emptyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, margin: 20 },
});
Object.assign(styles, extraStyles);