import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useReceivedInvitesQuery, useInviteMutation } from "@/services/api/resources/invites";
import { useMarkNotificationReadMutation, useNotificationsQuery, useUnreadNotificationCountQuery } from "@/services/api/resources/notifications";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";
import type { Invite } from "@/services/api/resources/invites";

const relativeDate = (value: string) => { const time = Date.parse(value); if (!Number.isFinite(time)) return ""; const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000)); if (minutes < 1) return "agora"; if (minutes < 60) return "há " + minutes + " min"; const hours = Math.floor(minutes / 60); if (hours < 24) return "há " + hours + " h"; return new Date(time).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); };

export default function NotificationCenterExperience({ onClose }: { onClose: () => void }) {
 const user = useUserStore((s) => s.user); const notificationsQuery = useNotificationsQuery({ page: 1, limit: 100 }); const unreadCountQuery = useUnreadNotificationCountQuery(); const readMutation = useMarkNotificationReadMutation(); const notifications = notificationsQuery.data?.items ?? []; const unreadCount = unreadCountQuery.data ?? 0; const inviteQuery = useReceivedInvitesQuery({ page: 1, limit: 100 }); const acceptMutation = useInviteMutation("accept"); const rejectMutation = useInviteMutation("reject"); const invites = inviteQuery.data?.items ?? []; const iLoading = inviteQuery.isLoading; const iError = inviteQuery.error instanceof Error ? inviteQuery.error.message : inviteQuery.error ? "Não foi possível carregar seus convites." : null; const [refreshing, setRefreshing] = useState(false);
 const load = useCallback(async () => { await Promise.allSettled([notificationsQuery.refetch(), unreadCountQuery.refetch(), inviteQuery.refetch()]); }, [inviteQuery.refetch, notificationsQuery.refetch, unreadCountQuery.refetch]); const pending = useMemo(() => invites.filter((i) => i.status === "PENDING" && i.receiverId === user?.id), [invites, user?.id]); const nLoading = notificationsQuery.isLoading || unreadCountQuery.isLoading; const nError = notificationsQuery.error instanceof Error ? notificationsQuery.error.message : notificationsQuery.error ? "Não foi possível carregar suas notificações." : unreadCountQuery.error ? "Não foi possível carregar suas notificações." : null; const error = nError ?? iError; const loading = (nLoading || iLoading) && !notifications.length && !pending.length; const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
 return <View style={styles.page}><View style={styles.scrim} /><View style={styles.panel}><ScrollView style={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={colors.brand} />} contentContainerStyle={styles.content}><View style={styles.container}><View style={styles.header}><View style={styles.heading}><Text style={styles.title}>Notificações</Text>{unreadCount > 0 ? <View style={styles.count}><Text style={styles.countText}>{unreadCount}</Text></View> : null}</View><Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onClose} style={styles.back}><Ionicons name="close" size={20} color={colors.textSecondary} /></Pressable></View>{error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable accessibilityRole="button" onPress={() => void load()}><Text style={styles.retry}>Tentar novamente</Text></Pressable></View> : null}{loading ? <View style={styles.state}><ActivityIndicator color={colors.brand} /><Text style={styles.muted}>Carregando notificações…</Text></View> : null}{!loading && !pending.length && !notifications.length && !error ? <View style={styles.state}><Ionicons name="notifications-off-outline" size={30} color={colors.brand} /><Text style={styles.stateTitle}>Você está em dia</Text><Text style={styles.muted}>Novas notificações e convites aparecerão aqui.</Text></View> : null}{pending.map((invite) => <InviteCard key={"invite-" + invite.id} invite={invite} processing={acceptMutation.isPending || rejectMutation.isPending} onAccept={() => acceptMutation.mutate({ id: invite.id })} onReject={() => rejectMutation.mutate({ id: invite.id })} />)}{notifications.map((n) => <Pressable key={"notification-" + n.id} accessibilityRole="button" onPress={() => { if (n.readAt === null) readMutation.mutate(n.id); }} style={[styles.notification, n.readAt === null && styles.unread]}><View style={styles.icon}><Ionicons name="notifications-outline" size={18} color={colors.brand} /></View><View style={styles.copy}><Text style={styles.itemTitle}>{n.title}</Text><Text style={styles.message}>{n.message}</Text></View><Text style={styles.date}>{relativeDate(n.createdAt)}</Text></Pressable>)}</View></ScrollView></View></View>;
}

function InviteCard({ invite, processing, onAccept, onReject }: { invite: Invite; processing: boolean; onAccept: () => void; onReject: () => void }) { const group = invite.group?.name; const suffix = group ? " para " + group : ""; return <View style={styles.invite}><View style={styles.row}><UserAvatar name={invite.sender?.name ?? "Usuário"} uri={invite.sender?.avatar} size={44} /><View style={styles.copy}><Text style={styles.itemTitle}>{invite.sender?.name ?? "Alguém"}</Text><Text style={styles.message}>{group ? "convidou você para " + group : "enviou um convite de grupo"}</Text></View><Text style={styles.date}>{invite.createdAt ? relativeDate(invite.createdAt) : ""}</Text></View><View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel={"Recusar convite" + suffix} disabled={processing} onPress={onReject} style={styles.reject}><Text style={styles.rejectText}>Recusar</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={"Aceitar convite" + suffix} disabled={processing} onPress={onAccept} style={styles.accept}>{processing ? <ActivityIndicator color={colors.background} /> : <Text style={styles.acceptText}>Aceitar</Text>}</Pressable></View></View>; }

const styles = StyleSheet.create({
 page: { ...StyleSheet.absoluteFill, zIndex: 60, backgroundColor: "transparent" },
 scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(11, 13, 15, 0.5)" },
 panel: { position: "relative", height: "88%", maxHeight: "88%", minHeight: "88%", flexDirection: "column", backgroundColor: colors.background, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, borderBottomWidth: 1, borderBottomColor: colors.border, shadowColor: "#000000", shadowOffset: { width: 0, height: 24 }, shadowOpacity: 0.7, shadowRadius: 32, elevation: 8 },
 scroll: { flex: 1 },
 content: { flexGrow: 1, paddingBottom: 28 },
 container: { flex: 1, width: "100%", maxWidth: 720, alignSelf: "center", paddingHorizontal: 0 },
 header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
 heading: { flexDirection: "row", alignItems: "center", gap: 10 },
 back: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.elevated, alignItems: "center", justifyContent: "center" },
 spacer: { width: 32 },
 title: { color: colors.text, fontFamily: fonts.display, fontSize: 20, fontWeight: "700" },
 count: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
 countText: { color: colors.background, fontFamily: fonts.bold, fontSize: 11 },
 invite: { backgroundColor: colors.surface, borderRadius: radii.large, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 12 },
 row: { flexDirection: "row", alignItems: "center" },
 copy: { flex: 1, minWidth: 0, marginLeft: 11 },
 itemTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
 message: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18, marginTop: 3 },
 date: { color: colors.textMuted, fontSize: 10, marginLeft: 8 },
 actions: { flexDirection: "row", gap: 8, marginTop: 13 },
 accept: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radii.small, backgroundColor: colors.brand },
 acceptText: { color: colors.background, fontFamily: fonts.bold, fontSize: 12 },
 reject: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: radii.small, backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border },
 rejectText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 12 },
 notification: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 20, marginTop: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
 unread: { backgroundColor: "rgba(245, 197, 66, 0.04)" },
 icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brandSoft, alignItems: "center", justifyContent: "center" },
 state: { flex: 1, minHeight: 0, alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
 stateTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 },
 muted: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, textAlign: "center" },
 error: { backgroundColor: colors.dangerSoft, borderRadius: radii.medium, padding: 14, marginTop: 12 },
 errorText: { color: colors.textSecondary, fontSize: 12 },
 retry: { color: colors.danger, fontFamily: fonts.bold, fontSize: 12, marginTop: 8 },
});
