import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/tokens";
export function OccupancyBar({ level = 1 }: { level?: 0 | 1 | 2 }) { return <View style={styles.row}>{[0,1,2].map((segment) => <View key={segment} style={[styles.segment, { backgroundColor: segment <= level ? colors.brand : "#2A3340" }]} />)}</View>; }
const styles = StyleSheet.create({ row: { flexDirection: "row", gap: 2 }, segment: { width: 14, height: 4, borderRadius: 2 } });
