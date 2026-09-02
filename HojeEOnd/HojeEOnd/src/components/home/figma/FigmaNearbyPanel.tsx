import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/theme/tokens";
export function FigmaNearbyPanel({ children }: { children: ReactNode }) { return <View style={styles.panel}><Text style={styles.title}>PERTO DE VOCÊ AGORA</Text>{children}</View>; }
const styles = StyleSheet.create({ panel: { backgroundColor: colors.background, bottom: 68, left: 0, paddingHorizontal: 16, paddingTop: 0, position: "absolute", right: 0, top: 450, zIndex: 8 }, title: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" } });
