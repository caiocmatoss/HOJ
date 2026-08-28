import { useEffect } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useNotificationStore } from "@/store/notification-store";

export default function NotificationsScreen() {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const loading = useNotificationStore((state) => state.loading);
  const error = useNotificationStore((state) => state.error);
  const loadNotifications = useNotificationStore((state) => state.loadNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <ScreenContainer maxWidth={760}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notificações</Text>
            <Text style={styles.subtitle}>{unreadCount} não lida(s)</Text>
          </View>
          {unreadCount > 0 && (
            <Pressable onPress={() => { void markAllAsRead(); }} style={styles.markAll}>
              <Text style={styles.markAllText}>Marcar todas como lidas</Text>
            </Pressable>
          )}
        </View>

        {loading && notifications.length === 0 ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#FFC400" /><Text style={styles.muted}>Carregando notificações...</Text></View>
        ) : error && notifications.length === 0 ? (
          <EmptyState title="Não foi possível carregar" message={error} actionLabel="Tentar novamente" onAction={() => { void loadNotifications(); }} />
        ) : notifications.length === 0 ? (
          <EmptyState title="Nenhuma notificação" message="Você não possui notificações no momento." />
        ) : (
          notifications.map((notification) => {
            const unread = notification.readAt === null;
            return (
              <Pressable key={notification.id} disabled={!unread} onPress={() => { void markAsRead(notification.id); }} style={[styles.card, unread && styles.unreadCard]}>
                <View style={styles.cardHeader}><Text style={styles.cardTitle}>{notification.title}</Text>{unread && <View style={styles.dot} />}</View>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.date}>{new Date(notification.createdAt).toLocaleString()}</Text>
              </Pressable>
            );
          })
        )}
      </ScreenContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: "#090909" }, content: { paddingVertical: 24 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 12 }, title: { color: "#FFFFFF", fontSize: 28, fontWeight: "800" }, subtitle: { color: "#888888", fontSize: 13, marginTop: 4 }, markAll: { backgroundColor: "#FFC400", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 }, markAllText: { color: "#000000", fontSize: 12, fontWeight: "800" }, card: { backgroundColor: "#151515", borderRadius: 16, borderWidth: 1, borderColor: "#292929", padding: 16, marginBottom: 10 }, unreadCard: { backgroundColor: "#211D0A", borderColor: "#665500" }, cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, cardTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", flex: 1 }, dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#FFC400", marginLeft: 10 }, message: { color: "#CCCCCC", fontSize: 14, lineHeight: 20, marginTop: 8 }, date: { color: "#777777", fontSize: 12, marginTop: 10 }, center: { alignItems: "center", paddingVertical: 48 }, muted: { color: "#888888", marginTop: 12 } });