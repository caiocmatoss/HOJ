import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { resolveBackendMediaUrl } from "@/services/api";
import { useMeQuery } from "@/services/api/resources/profile";
import { colors, fonts } from "@/theme/tokens";

export function FigmaHomeSearch({ value, onChangeText, onSubmitEditing }: { value: string; onChangeText: (value: string) => void; onSubmitEditing?: () => void }) {
  const meQuery = useMeQuery();
  const avatar = meQuery.data?.avatar;
  const avatarName = meQuery.data?.name ?? "Você";
  const avatarUrl = resolveBackendMediaUrl(avatar);
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => setAvatarFailed(false), [avatarUrl]);
  return <View testID="home-search" style={styles.search}><Ionicons name="search" size={18} color={colors.textMuted} /><TextInput value={value} onChangeText={onChangeText} onSubmitEditing={onSubmitEditing} placeholder="Onde você quer ir?" placeholderTextColor={colors.textMuted} style={styles.input} returnKeyType="search" /><Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push("/(main)/profile")}><View style={styles.avatar}>{avatarUrl && !avatarFailed ? <Image onError={() => setAvatarFailed(true)} source={{ uri: avatarUrl }} style={styles.avatarImage} /> : <LinearGradient colors={[colors.brand, colors.brandSecondary]} style={styles.avatar}><Text style={styles.avatarText}>{avatarName.charAt(0).toUpperCase()}</Text></LinearGradient>}</View></Pressable></View>;
}

const styles = StyleSheet.create({ search: { height: 50, borderRadius: 18, paddingHorizontal: 16, gap: 10, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(21,25,29,.93)", borderWidth: 1, borderColor: "rgba(248,250,252,.06)" }, input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 15, paddingVertical: 0 }, avatar: { width: 32, height: 32, borderRadius: 16, overflow: "hidden", alignItems: "center", justifyContent: "center" }, avatarImage: { width: "100%", height: "100%" }, avatarText: { color: colors.background, fontFamily: fonts.bold, fontSize: 13 } });
