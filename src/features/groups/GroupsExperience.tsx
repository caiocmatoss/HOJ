import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { getVenues, type ApiVenue } from "@/services/api";
import { useGroupStore } from "@/store/group-store";
import { colors, fonts, radii } from "@/theme/tokens";

type GroupWithVenue = ReturnType<typeof useGroupStore.getState>["groups"][number] & {
  venue?: ApiVenue;
};

export default function GroupsExperience() {
  const groups = useGroupStore((state) => state.groups);
  const loading = useGroupStore((state) => state.loading);
  const error = useGroupStore((state) => state.error);
  const loadGroups = useGroupStore((state) => state.loadGroups);

  const [venues, setVenues] = useState<ApiVenue[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [venuesError, setVenuesError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const loadVenues = useCallback(async () => {
    setVenuesLoading(true);
    setVenuesError(null);

    try {
      setVenues(await getVenues());
    } catch (requestError) {
      setVenuesError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar os locais.",
      );
    } finally {
      setVenuesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadVenues();
  }, [loadVenues]);

  useFocusEffect(
    useCallback(() => {
      void loadGroups().catch(() => undefined);
    }, [loadGroups]),
  );

  const groupsWithVenue = useMemo<GroupWithVenue[]>(() => {
    const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
    return groups.map((group) => ({ ...group, venue: venuesById.get(group.venueId) }));
  }, [groups, venues]);

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return groupsWithVenue;

    return groupsWithVenue.filter((group) =>
      `${group.name} ${group.venue?.name ?? ""} ${group.venue?.category ?? ""}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalized),
    );
  }, [groupsWithVenue, query]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([loadGroups(), loadVenues()]);
    setRefreshing(false);
  }, [loadGroups, loadVenues]);

  const createGroup = () => router.push("/(main)/group/create");
  const openInvites = () => router.push("/(main)/invites");
  const initialLoading = (loading || venuesLoading) && groups.length === 0;
  const visibleError = error ?? venuesError;

  return (
    <View style={styles.page}>
      <FlatList
        contentContainerStyle={
          filteredGroups.length > 0 ? styles.listContent : styles.emptyListContent
        }
        data={filteredGroups}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <View style={styles.headerSection}>
              <ScreenHeading
                action={
                  <Pressable
                    accessibilityLabel="Criar um novo grupo"
                    accessibilityRole="button"
                    onPress={createGroup}
                    style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
                  >
                    <Ionicons color={colors.background} name="add" size={24} />
                  </Pressable>
                }
                eyebrow="Seu círculo"
                subtitle={
                  loading && groups.length > 0
                    ? "Sincronizando seus grupos..."
                    : `${groups.length} ${groups.length === 1 ? "grupo ativo" : "grupos ativos"}`
                }
                title="Grupos"
              />

              <Pressable
                accessibilityLabel="Abrir convites recebidos"
                accessibilityRole="button"
                onPress={openInvites}
                style={({ pressed }) => [styles.inviteCard, pressed && styles.cardPressed]}
              >
                <View style={styles.inviteIcon}>
                  <Ionicons color={colors.brand} name="mail-unread-outline" size={22} />
                </View>
                <View style={styles.inviteCopy}>
                  <Text style={styles.inviteTitle}>Convites para novos rolês</Text>
                  <Text style={styles.inviteSubtitle}>
                    Veja quem quer encontrar você hoje.
                  </Text>
                </View>
                <Ionicons color={colors.brand} name="chevron-forward" size={18} />
              </Pressable>

              <View style={styles.searchShell}>
                <Ionicons color={colors.textMuted} name="search" size={18} />
                <TextInput
                  accessibilityLabel="Buscar grupos"
                  autoCapitalize="none"
                  onChangeText={setQuery}
                  placeholder="Buscar grupo ou local"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={query}
                />
                {query ? (
                  <Pressable
                    accessibilityLabel="Limpar busca"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setQuery("")}
                  >
                    <Ionicons color={colors.textMuted} name="close-circle" size={18} />
                  </Pressable>
                ) : null}
              </View>

              {visibleError ? (
                <View style={styles.errorBanner}>
                  <Ionicons color={colors.danger} name="alert-circle-outline" size={19} />
                  <View style={styles.errorCopy}>
                    <Text style={styles.errorTitle}>A atualização ficou incompleta</Text>
                    <Text numberOfLines={2} style={styles.errorText}>
                      {visibleError}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityLabel="Tentar carregar grupos e locais novamente"
                    accessibilityRole="button"
                    onPress={() => void handleRefresh()}
                  >
                    <Text style={styles.retryText}>Tentar</Text>
                  </Pressable>
                </View>
              ) : null}

              {filteredGroups.length > 0 ? (
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionLabel}>SEUS GRUPOS</Text>
                  <Text style={styles.sectionMeta}>{filteredGroups.length} encontrados</Text>
                </View>
              ) : null}
            </View>
          </ScreenContainer>
        }
        ListEmptyComponent={
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            {initialLoading ? (
              <StateCard
                icon="sync-outline"
                loading
                message="Buscando seus grupos e os locais vinculados."
                title="Atualizando grupos"
              />
            ) : query ? (
              <StateCard
                action="Limpar busca"
                icon="search-outline"
                message="Tente outro nome de grupo, local ou categoria."
                onPress={() => setQuery("")}
                title="Nenhum resultado"
              />
            ) : (
              <StateCard
                action="Criar primeiro grupo"
                icon="people-outline"
                message="Escolha um lugar e reúna seus amigos para a próxima saída."
                onPress={createGroup}
                title="Seu próximo rolê começa aqui"
              />
            )}
          </ScreenContainer>
        }
        refreshControl={
          <RefreshControl
            colors={[colors.brand]}
            onRefresh={() => void handleRefresh()}
            refreshing={refreshing}
            tintColor={colors.brand}
          />
        }
        renderItem={({ item }) => (
          <ScreenContainer maxWidth={720} paddingHorizontal={16}>
            <Pressable
              accessibilityLabel={`Abrir grupo ${item.name}`}
              accessibilityRole="button"
              onPress={() =>
                router.push({ pathname: "/(main)/group/[id]", params: { id: item.id } })
              }
              style={({ pressed }) => [styles.groupCard, pressed && styles.cardPressed]}
            >
              {item.venue?.image ? (
                <Image source={{ uri: item.venue.image }} style={styles.venueImage} />
              ) : (
                <View style={styles.venuePlaceholder}>
                  <Ionicons color={colors.brand} name="people-outline" size={25} />
                </View>
              )}

              <View style={styles.groupCopy}>
                <Text numberOfLines={1} style={styles.groupName}>
                  {item.name}
                </Text>
                <View style={styles.venueRow}>
                  <Ionicons color={colors.brand} name="location-outline" size={14} />
                  <Text numberOfLines={1} style={styles.venueName}>
                    {item.venue?.name ??
                      (venuesLoading ? "Carregando local..." : "Local não informado")}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.memberBadge}>
                    <Ionicons color={colors.textMuted} name="people-outline" size={13} />
                    <Text style={styles.memberText}>
                      {item.members.length} {item.members.length === 1 ? "membro" : "membros"}
                    </Text>
                  </View>
                  {item.venue?.distance ? (
                    <Text style={styles.distance}>{item.venue.distance}</Text>
                  ) : null}
                </View>
              </View>

              <Ionicons color={colors.textMuted} name="chevron-forward" size={19} />
            </Pressable>
          </ScreenContainer>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function StateCard({
  action,
  icon,
  loading = false,
  message,
  onPress,
  title,
}: {
  action?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  loading?: boolean;
  message: string;
  onPress?: () => void;
  title: string;
}) {
  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>
        {loading ? (
          <ActivityIndicator color={colors.brand} size="small" />
        ) : (
          <Ionicons color={colors.brand} name={icon} size={29} />
        )}
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateText}>{message}</Text>
      {action && onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={({ pressed }) => [styles.stateAction, pressed && styles.pressed]}
        >
          <Text style={styles.stateActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  listContent: { paddingBottom: 120 },
  emptyListContent: { flexGrow: 1, paddingBottom: 120 },
  headerSection: { paddingBottom: 12, paddingTop: 24 },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  inviteCard: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 20,
    padding: 14,
  },
  inviteIcon: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.small,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44,
  },
  inviteCopy: { flex: 1, minWidth: 0 },
  inviteTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  inviteSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },
  searchShell: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 12,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(239, 125, 125, 0.2)",
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
    padding: 11,
  },
  errorCopy: { flex: 1, minWidth: 0 },
  errorTitle: { color: colors.danger, fontFamily: fonts.semibold, fontSize: 10 },
  errorText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  retryText: { color: colors.danger, fontFamily: fonts.bold, fontSize: 10 },
  sectionRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  sectionLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  sectionMeta: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10 },
  groupCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 10,
    minHeight: 92,
    padding: 12,
  },
  venueImage: { backgroundColor: colors.elevated, borderRadius: radii.medium, height: 68, width: 68 },
  venuePlaceholder: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandBorder,
    borderRadius: radii.medium,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  groupCopy: { flex: 1, marginHorizontal: 13, minWidth: 0 },
  groupName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 16 },
  venueRow: { alignItems: "center", flexDirection: "row", gap: 4, marginTop: 7 },
  venueName: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 11 },
  metaRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  memberBadge: { alignItems: "center", flexDirection: "row", gap: 5 },
  memberText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10 },
  distance: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 10 },
  stateCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sheet,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 28,
    minHeight: 300,
    padding: 28,
  },
  stateIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  stateTitle: { color: colors.text, fontFamily: fonts.display, fontSize: 25, marginTop: 18, textAlign: "center" },
  stateText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 340,
    textAlign: "center",
  },
  stateAction: {
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  stateActionText: { color: colors.background, fontFamily: fonts.bold, fontSize: 12 },
  cardPressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.99 }] },
  pressed: { opacity: 0.78 },
});
