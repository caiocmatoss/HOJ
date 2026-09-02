import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme/tokens";

export function HomeLoadingOverlay() {
  return <View testID="home-loading" style={styles.loading}><View style={styles.spinner} /><Text style={styles.loadingText}>Encontrando o que há por aí…</Text></View>;
}

export function HomeNoResultsOverlay({ onRetry }: { onRetry?: () => void }) {
  return <View testID="home-no-results" style={styles.noResults}><Text style={styles.resultIcon}>{"\u{1F311}"}</Text><Text style={styles.resultTitle}>Nada aqui agora</Text><Text style={styles.resultBody}>Esta área está quieta por enquanto. Tente se mover para outro bairro.</Text><Pressable onPress={onRetry} disabled={!onRetry} style={styles.button}><Text style={styles.buttonText}>Explorar área maior</Text></Pressable></View>;
}

export function HomeNoLocationOverlay({ onEnable }: { onEnable?: () => void }) {
  return <View testID="home-no-location" style={styles.fullOverlay}><View style={styles.stateIcon}><Text style={styles.stateEmoji}>{"\u{1F4CD}"}</Text></View><Text style={styles.stateTitle}>Precisamos da sua localização</Text><Text style={styles.stateBody}>Para descobrir o que está acontecendo ao redor de você agora, permita o acesso à localização.</Text><Pressable onPress={onEnable} disabled={!onEnable} style={styles.primary}><Text style={styles.primaryText}>Permitir localização</Text></Pressable><Pressable style={styles.secondary}><Text style={styles.secondaryText}>Explorar manualmente</Text></Pressable></View>;
}

export function HomeOfflineOverlay() {
  return <View testID="home-offline" style={styles.fullOverlay}><View style={styles.stateIcon}><Text style={styles.stateEmoji}>{"\u{1F4E1}"}</Text></View><Text style={styles.stateTitle}>Sem conexão</Text><Text style={styles.stateBody}>Verifique sua internet e tente novamente. O mapa pode estar indisponível.</Text><Pressable style={styles.primary}><Text style={styles.primaryText}>Tentar novamente</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  loading: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 16, backgroundColor: colors.background, zIndex: 50 },
  spinner: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: colors.elevated, borderTopColor: colors.brand },
  loadingText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 14 },
  noResults: { position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -140 }, { translateY: -100 }], width: 280, paddingVertical: 28, paddingHorizontal: 32, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", zIndex: 30, shadowColor: "#000", shadowOpacity: 0.5, shadowRadius: 32, elevation: 12 },
  resultIcon: { color: colors.text, fontSize: 40, marginBottom: 12 }, resultTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 17, marginBottom: 6 }, resultBody: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 13, lineHeight: 20, textAlign: "center" },
  button: { marginTop: 16, backgroundColor: colors.brand, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24 }, buttonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 14 },
  fullOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(11,13,15,.91)", alignItems: "center", justifyContent: "center", padding: 32, zIndex: 50 },
  stateIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center", marginBottom: 20 }, stateEmoji: { fontSize: 32 }, stateTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 22, letterSpacing: -0.4, textAlign: "center" }, stateBody: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, textAlign: "center", marginTop: 8, marginBottom: 28 }, primary: { width: "100%", height: 52, borderRadius: 16, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", marginBottom: 12 }, primaryText: { color: colors.background, fontFamily: fonts.bold, fontSize: 16 }, secondary: { width: "100%", height: 52, borderRadius: 16, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center" }, secondaryText: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 15 },
});
