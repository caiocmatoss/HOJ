import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MAIN_TAB_BAR_HEIGHT } from "@/features/navigation/tabBarMetrics";
import { colors, fonts } from "@/theme/tokens";

const HELP_FAQS = [
  { id: "location", question: "Como ativar minha localização?", answer: "Permita o acesso à localização nas configurações do seu dispositivo. Você também pode gerenciar essa preferência em Perfil → Localização." },
  { id: "friends", question: "Como encontrar amigos no mapa?", answer: "Adicione seus amigos e permita o compartilhamento de localização. A localização e a permissão são necessárias para aparecerem no mapa." },
  { id: "tickets", question: "Como comprar ingressos?", answer: "A compra de ingressos ainda não está disponível nesta versão do app. Por enquanto, use as informações do evento para acompanhar os detalhes disponíveis." },
  { id: "privacy", question: "Meus dados são compartilhados com terceiros?", answer: "Sua localização e seus dados pessoais são usados para a experiência do app e não são vendidos a terceiros." },
  { id: "cancel", question: "Como cancelar um ingresso?", answer: "O gerenciamento e cancelamento de ingressos ainda não estão disponíveis nesta versão do app." },
] as const;
const QUICK_ACTIONS = ["Chat ao vivo", "Enviar e-mail", "Guia do app", "Reportar bug"] as const;
const FOOTER_LINKS = ["Termos de Uso", "Política de Privacidade", "Licenças de software"] as const;

export default function FigmaHelpExperience() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const normalized = normalize(query);
  const filtered = useMemo(() => normalized ? HELP_FAQS.filter((faq) => normalize(`${faq.question} ${faq.answer}`).includes(normalized)) : HELP_FAQS, [normalized]);
  const version = Constants.expoConfig?.version ?? "1.0.0";
  return <View style={styles.root}><View style={styles.header}><Pressable onPress={() => router.replace("/(main)/profile")} hitSlop={8} accessibilityRole="button"><Ionicons name="arrow-back" size={20} color={colors.brand} /></Pressable><Text style={styles.headerTitle}>Ajuda e suporte</Text></View><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.search}><Ionicons name="search-outline" size={15} color={colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar na central de ajuda…" placeholderTextColor={colors.textMuted} style={styles.searchInput} accessibilityLabel="Buscar na central de ajuda" /></View>
    <View style={styles.quickGrid}>{QUICK_ACTIONS.map((label) => <View key={label} style={styles.quickCard}><Ionicons name={label === "Chat ao vivo" ? "chatbubble-ellipses-outline" : label === "Enviar e-mail" ? "mail-outline" : label === "Guia do app" ? "book-outline" : "bug-outline"} size={22} color={colors.textMuted} /><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickSub}>Em breve</Text></View>)}</View>
    <Section title="Perguntas frequentes" />
    {filtered.map((faq) => { const open = expanded === faq.id; return <View key={faq.id} style={styles.faq}><Pressable onPress={() => setExpanded(open ? null : faq.id)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.faqQuestion}><Text style={styles.faqText}>{faq.question}</Text><Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} /></Pressable>{open ? <Text style={styles.answer}>{faq.answer}</Text> : null}</View>; })}
    {!filtered.length ? <Text style={styles.empty}>Nenhum resultado encontrado.</Text> : null}
    <Section title="Não encontrou o que buscava?" /><View style={styles.disabledForm}><Text style={styles.formLabel}>Sua mensagem</Text><TextInput editable={false} multiline numberOfLines={4} placeholder="Descreva o problema ou dúvida…" placeholderTextColor={colors.textMuted} style={styles.textarea} /><Text style={styles.coming}>Em breve</Text><View style={styles.disabledButton}><Text style={styles.disabledButtonText}>Enviar mensagem</Text></View></View>
    <View style={styles.footer}>{FOOTER_LINKS.map((label) => <View key={label} style={styles.footerRow}><Text style={styles.footerText}>{label}</Text><Text style={styles.coming}>Em breve</Text></View>)}</View>
    <Text style={styles.version}>HOJE É ONDE v{version}</Text>
  </ScrollView></View>;
}
function normalize(value: string) { return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
function Section({ title }: { title: string }) { return <Text style={styles.section}>{title.toUpperCase()}</Text>; }
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background }, header: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.06)" }, headerTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" }, content: { paddingHorizontal: 20, paddingBottom: MAIN_TAB_BAR_HEIGHT + 24 }, search: { marginTop: 14, marginBottom: 20, height: 44, borderRadius: 12, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(248,250,252,0.06)" }, searchInput: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 13, outlineStyle: "none" as never }, quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }, quickCard: { width: "48%", minHeight: 105, padding: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: "rgba(248,250,252,0.05)", opacity: 0.58 }, quickLabel: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 13, marginTop: 8 }, quickSub: { color: colors.textMuted, fontSize: 11, marginTop: 3 }, section: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.1, marginTop: 20, marginBottom: 8 }, faq: { borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.04)" }, faqQuestion: { minHeight: 52, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, faqText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 14 }, answer: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 21, paddingRight: 20, marginBottom: 14 }, empty: { color: colors.textMuted, textAlign: "center", paddingVertical: 20, fontSize: 13 }, disabledForm: { opacity: 0.58 }, formLabel: { color: colors.textMuted, fontSize: 12, marginBottom: 5 }, textarea: { minHeight: 104, textAlignVertical: "top", borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.textMuted, padding: 12, fontSize: 14 }, coming: { color: colors.textMuted, fontSize: 11, marginTop: 5 }, disabledButton: { height: 50, borderRadius: 14, marginTop: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated }, disabledButtonText: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 15 }, footer: { marginTop: 28, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface }, footerRow: { minHeight: 50, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.04)" }, footerText: { color: colors.textMuted, fontSize: 14 }, version: { color: "#2A3340", fontSize: 11, textAlign: "center", marginTop: 16 } });
