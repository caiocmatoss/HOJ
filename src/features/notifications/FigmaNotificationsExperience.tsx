import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  getNotificationPreferences,
  type NotificationPreferences,
  updateNotificationPreferences,
} from "@/services/api";
import { MAIN_TAB_BAR_HEIGHT } from "@/features/navigation/tabBarMetrics";
import { colors, fonts } from "@/theme/tokens";

type PreferenceKey = keyof NotificationPreferences;
type Row = [PreferenceKey, string, string];

const sections: Array<[string, Row[]]> = [
  ["PESSOAS", [
    ["friendsNearby", "Amigos por perto", "Quando um amigo chegar perto de você"],
    ["friendCheckins", "Check-in de amigos", "Quando alguém fizer check-in em um lugar"],
    ["messages", "Mensagens", "Novas mensagens no chat"],
  ]],
  ["EVENTOS E LUGARES", [
    ["newEvents", "Eventos próximos", "Eventos novos na sua área"],
    ["eventReminders", "Lembretes de eventos", "Aviso 1h antes dos seus eventos salvos"],
  ]],
  ["HOJE É ONDE", [
    ["promotions", "Promoções e ofertas", "Descontos e experiências exclusivas"],
    ["weeklyDigest", "Resumo semanal", "O que rolou e o que está por vir"],
    ["appUpdates", "Atualizações do app", "Novidades e melhorias na plataforma"],
  ]],
];

function ToggleSwitch({ value, onPress }: { value: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={[styles.toggle, { backgroundColor: value ? colors.brand : "#2A3340" }]}
    >
      <View style={[styles.knob, { left: value ? 23 : 3, backgroundColor: value ? colors.background : colors.textMuted }]} />
    </Pressable>
  );
}

export default function FigmaNotificationsExperience() {
  const router = useRouter();
  const handleBack = () => router.replace("/(main)/profile");
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getNotificationPreferences()
      .then((value) => { if (active) setPreferences(value); })
      .catch(() => { if (active) setError("Não foi possível carregar suas preferências."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    void getNotificationPreferences()
      .then(setPreferences)
      .catch(() => setError("Não foi possível carregar suas preferências."))
      .finally(() => setLoading(false));
  };

  const toggle = (key: PreferenceKey) => {
    if (!preferences) return;
    const previous = preferences[key];
    setPreferences({ ...preferences, [key]: !previous });
    void updateNotificationPreferences({ [key]: !previous }).catch(() => {
      setPreferences((current) => current ? { ...current, [key]: previous } : current);
      setError("Não foi possível salvar essa preferência.");
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={handleBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={20} color={colors.brand} />
        </Pressable>
        <Text style={styles.title}>Notificações</Text>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.brand} /></View>
      ) : error && !preferences ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={retry}><Text style={styles.retry}>Tentar novamente</Text></Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {sections.map(([title, rows]) => (
            <View key={title}>
              <Text style={styles.sectionTitle}>{title}</Text>
              {rows.map(([key, label, subtitle]) => (
                <View key={key} style={styles.row}>
                  <View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
                  <ToggleSwitch value={Boolean(preferences?.[key])} onPress={() => toggle(key)} />
                </View>
              ))}
            </View>
          ))}
          <View style={styles.info}><Text style={styles.infoText}>Para desativar todas as notificações, acesse as configurações do seu dispositivo.</Text></View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 14, paddingHorizontal: 20, paddingBottom: 12, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.06)" },
  title: { color: colors.text, fontFamily: fonts.display, fontSize: 18, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingBottom: MAIN_TAB_BAR_HEIGHT + 24 },
  sectionTitle: { marginTop: 20, marginBottom: 8, color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 11, fontWeight: "600", letterSpacing: 1.1 },
  row: { minHeight: 68, paddingVertical: 15, flexDirection: "row", alignItems: "center", gap: 16, borderBottomWidth: 1, borderBottomColor: "rgba(248,250,252,0.04)" },
  copy: { flex: 1 },
  label: { marginBottom: 2, color: colors.text, fontFamily: fonts.medium, fontSize: 15, fontWeight: "500" },
  subtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17 },
  toggle: { width: 46, height: 26, borderRadius: 13 },
  knob: { position: "absolute", top: 3, width: 20, height: 20, borderRadius: 10 },
  info: { marginTop: 28, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: "rgba(248,250,252,0.05)" },
  infoText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  error: { color: colors.danger, fontFamily: fonts.regular, fontSize: 13, textAlign: "center" },
  retry: { marginTop: 12, color: colors.brand, fontFamily: fonts.semibold, fontSize: 14, fontWeight: "600" },
});
