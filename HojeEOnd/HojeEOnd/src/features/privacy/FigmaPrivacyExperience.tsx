import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MAIN_TAB_BAR_HEIGHT } from "@/features/navigation/tabBarMetrics";
import { colors, fonts } from "@/theme/tokens";
import { useLocationPreferencesStore } from "@/store/location-preferences-store";
import { usePrivacyPreferencesStore } from "@/store/privacy-preferences-store";

export default function FigmaPrivacyExperience() {
  const router = useRouter();
  const handleBack = () => router.replace("/(main)/profile");
  const privacy = usePrivacyPreferencesStore();
  const location = useLocationPreferencesStore();
  useEffect(() => { void privacy.load(); if (!location.preferences) void location.loadPreferences(); }, []);
  useFocusEffect(useCallback(() => { if (location.preferences) void location.loadPreferences(); }, [location.preferences, location.loadPreferences]));
  const prefs = privacy.preferences;
  const loc = location.preferences;
  const error = privacy.error || location.error;
  if (privacy.loading && !prefs || location.loading && !loc) return <View style={styles.root}><Header onBack={handleBack} /><View style={styles.center}><ActivityIndicator color={colors.brand} /></View></View>;
  if (error && !prefs) return <View style={styles.root}><Header onBack={handleBack} /><View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={() => { void privacy.load(); void location.loadPreferences(); }}><Text style={styles.retry}>Tentar novamente</Text></Pressable></View></View>;
  const showStatus = prefs?.showStatus ?? true;
  const showHistory = prefs?.showCheckinHistory ?? false;
  const showLocation = loc?.shareWithFriends ?? true;
  const updateLocation = async () => { if (loc) await location.updatePreference("shareWithFriends", !showLocation); };
  return <View style={styles.root}><Header onBack={handleBack} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <Section title="Perfil" />
    <DisabledRow label="Perfil público" sub="Qualquer pessoa pode ver seu perfil" value="Em breve" />
    <DisabledRow label="Quem pode me encontrar" value="Todos" />
    <DisabledRow label="Permitir marcações" sub="Amigos podem te marcar em lugares e eventos" value="Em breve" />
    <Section title="Localização e Atividade" />
    <ToggleRow label="Compartilhar localização" sub="Mostrar onde você está para amigos" value={showLocation} onPress={() => void updateLocation()} />
    <DisabledRow label="Quem vê minha localização" value="Apenas amigos" />
    <ToggleRow label="Histórico de lugares" sub="Mostrar no seu perfil onde você foi" value={showHistory} onPress={() => void privacy.update("showCheckinHistory", !showHistory)} />
    <ToggleRow label="Status online" sub="Mostrar quando você está ativo no app" value={showStatus} onPress={() => void privacy.update("showStatus", !showStatus)} />
    <Section title="Dados e Segurança" />
    <ActionRow label="Usuários bloqueados" value="Em breve" />
    <ActionRow label="Gerenciar dados pessoais" onPress={() => router.push({ pathname: "/(main)/edit-profile", params: { returnTo: "privacy" } })} />
    <ActionRow label="Baixar meus dados" value="Em breve" />
    <ActionRow label="Excluir conta" value="Em breve" />
  </ScrollView></View>;
}
function Header({ onBack }: { onBack: () => void }) { return <View style={styles.header}><Pressable onPress={onBack} hitSlop={8} accessibilityRole="button"><Ionicons name="arrow-back" size={20} color={colors.brand} /></Pressable><Text style={styles.title}>Privacidade</Text></View>; }
function Section({ title }: { title: string }) { return <Text style={styles.section}>{title.toUpperCase()}</Text>; }
function ToggleRow({ label, sub, value, onPress }: { label: string; sub?: string; value: boolean; onPress: () => void }) { return <View style={styles.row}><View style={styles.copy}><Text style={styles.label}>{label}</Text>{sub ? <Text style={styles.sub}>{sub}</Text> : null}</View><Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: value }} style={[styles.toggle, { backgroundColor: value ? colors.brand : "#2A3340" }]}><View style={[styles.knob, { left: value ? 23 : 3, backgroundColor: value ? colors.background : colors.textMuted }]} /></Pressable></View>; }
function DisabledRow({ label, sub, value }: { label: string; sub?: string; value: string }) { return <View style={styles.row}><View style={styles.copy}><Text style={styles.disabledLabel}>{label}</Text>{sub ? <Text style={styles.sub}>{sub}</Text> : null}</View><Text style={styles.coming}>{value}</Text></View>; }
function ActionRow({ label, value, onPress }: { label: string; value?: string; onPress?: () => void }) { return <Pressable disabled={!onPress} onPress={onPress} style={styles.row}><Text style={styles.label}>{label}</Text><View style={styles.actionRight}>{value ? <Text style={styles.coming}>{value}</Text> : null}<Ionicons name="chevron-forward" size={16} color={colors.textMuted} /></View></Pressable>; }
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background }, header: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.06)" }, title: { color: colors.text, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" }, content: { paddingHorizontal: 20, paddingBottom: MAIN_TAB_BAR_HEIGHT + 24 }, section: { marginTop: 20, marginBottom: 8, color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.1 }, row: { minHeight: 68, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.04)" }, copy: { flex: 1 }, label: { color: colors.text, fontFamily: fonts.medium, fontSize: 15, fontWeight: "500" }, disabledLabel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 15 }, sub: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, marginTop: 2 }, coming: { color: colors.textMuted, fontSize: 12 }, toggle: { width: 46, height: 26, borderRadius: 13 }, knob: { position: "absolute", top: 3, width: 20, height: 20, borderRadius: 10 }, actionRight: { flexDirection: "row", alignItems: "center", gap: 8 }, center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }, error: { color: colors.danger, textAlign: "center" }, retry: { color: colors.brand, marginTop: 12, fontFamily: fonts.semibold } });
