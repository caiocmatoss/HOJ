import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme/tokens";
export function FigmaNearbyPanel({ children }: { children: React.ReactNode }) { return <View style={styles.panel}><Text style={styles.title}>PERTO DE VOCÊ AGORA</Text>{children}</View>; }
const styles = StyleSheet.create({ panel: { backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, minHeight: 250, paddingHorizontal: 16, paddingTop: 20, position: "relative", zIndex: 3 }, title: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" } });
