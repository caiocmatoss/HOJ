import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHeading } from "@/components/ui/ScreenHeading";
import { getVenues, resolveBackendMediaUrl, type ApiVenue } from "@/services/api";
import { useFriendsQuery } from "@/services/api/resources/friends";
import { useCreateGroupMutation } from "@/services/api/resources/groups";
import { useInviteMutation } from "@/services/api/resources/invites";
import { useUserStore } from "@/store/user-store";
import { colors, fonts, radii } from "@/theme/tokens";

export default function CreateGroupExperience() {
  const friendsQuery = useFriendsQuery({ page: 1, limit: 100 });
  const createGroupMutation = useCreateGroupMutation();
  const inviteMutation = useInviteMutation("send");
  const user = useUserStore((state) => state.user);

  const [name, setName] = useState("");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [availableVenues, setAvailableVenues] = useState<ApiVenue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [venuesError, setVenuesError] = useState<string | null>(null);
  const [venueQuery, setVenueQuery] = useState("");
  const [venuePickerOpen, setVenuePickerOpen] = useState(false);
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const loadVenues = useCallback(async () => { setLoadingVenues(true); setVenuesError(null); try { setAvailableVenues(await getVenues()); } catch (e) { setVenuesError(e instanceof Error ? e.message : "Não foi possível carregar os locais."); } finally { setLoadingVenues(false); } }, []);
  useEffect(() => { void loadVenues(); }, [loadVenues]);
  const friends = friendsQuery.data?.items ?? [];
  const loadingFriends = friendsQuery.isLoading;
  const friendsError = friendsQuery.error instanceof Error ? friendsQuery.error.message : friendsQuery.error ? "Não foi possível carregar seus amigos." : null;
  const filteredVenues = useMemo(() => {
    const normalized = venueQuery.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return availableVenues;

    return availableVenues.filter((venue) =>
      `${venue.name} ${venue.category} ${venue.address}`
        .toLocaleLowerCase("pt-BR")
        .includes(normalized),
    );
  }, [availableVenues, venueQuery]);

  const selectedVenue = useMemo(
    () => availableVenues.find((venue) => venue.id === selectedVenueId),
    [availableVenues, selectedVenueId],
  );

  const goBack = () => {
    if (!saving) router.replace("/(main)/chat");
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriendIds((current) => current.includes(friendId) ? current.filter((id) => id !== friendId) : [...current, friendId]);
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Digite um nome para o grupo.");
      return;
    }

    if (!selectedVenueId) {
      setError("Escolha um local para o grupo.");
      return;
    }

    if (!user) {
      setError("Sua sessão não foi encontrada. Entre novamente para criar o grupo.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const created = await createGroupMutation.mutateAsync({ name: trimmedName, venueId: selectedVenueId });
      const inviteResults = await Promise.allSettled(selectedFriendIds.map((friendId) => inviteMutation.mutateAsync({ groupId: created.id, receiverId: friendId })));
      const failedInvites = inviteResults.filter((result) => result.status === "rejected").length;
      if (failedInvites > 0) {
        setError(failedInvites === selectedFriendIds.length ? "Grupo criado, mas os convites não puderam ser enviados." : "Grupo criado. Alguns convites não puderam ser enviados.");
      }
      router.replace("/(main)/chat");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível criar o grupo.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.page}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenContainer maxWidth={720} paddingHorizontal={16}>
          <Pressable
            accessibilityLabel="Voltar para grupos"
            accessibilityRole="button"
            disabled={saving}
            hitSlop={8}
            onPress={goBack}
            style={({ pressed }) => [styles.backButton, pressed && !saving && styles.pressed]}
          >
            <Ionicons color={colors.text} name="arrow-back" size={20} />
            <Text style={styles.backText}>Novo grupo</Text>
          </Pressable>

          <Pressable accessibilityLabel="Criar grupo" accessibilityRole="button" disabled={!name.trim() || !selectedVenueId || saving} onPress={() => void handleCreate()} style={[styles.headerCreate, (!name.trim() || !selectedVenueId || saving) && styles.headerCreateDisabled]}><Text style={styles.headerCreateText}>Criar</Text></Pressable>

          {false && <ScreenHeading
            eyebrow="Novo encontro"
            subtitle="Dê um nome ao grupo e escolha onde todo mundo vai se encontrar."
            title="Criar grupo"
          />}

          <View style={[styles.steps, styles.hidden]}>
            <View style={styles.stepActive}>
              <Text style={styles.stepNumberActive}>1</Text>
              <Text style={styles.stepLabelActive}>Identidade</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.step, selectedVenueId && styles.stepComplete]}>
              {selectedVenueId ? (
                <Ionicons color={colors.background} name="checkmark" size={14} />
              ) : (
                <Text style={styles.stepNumber}>2</Text>
              )}
              <Text style={[styles.stepLabel, selectedVenueId && styles.stepLabelComplete]}>
                Local
              </Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.avatarPlaceholder} accessibilityLabel="Foto do grupo indisponível"><Ionicons color={colors.textMuted} name="camera-outline" size={22} /><Text style={styles.avatarPlaceholderText}>Em breve</Text></View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons color={colors.brand} name="people-outline" size={20} />
              </View>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Nome do grupo</Text>
                <Text style={styles.sectionSubtitle}>Algo fácil de reconhecer no chat.</Text>
              </View>
              <Text style={styles.counter}>{name.length}/50</Text>
            </View>

            <View style={styles.inputShell}>
              <TextInput
                accessibilityLabel="Nome do grupo"
                autoCapitalize="sentences"
                editable={!saving}
                maxLength={50}
                onChangeText={(value) => {
                  setName(value);
                  if (error) setError("");
                }}
                placeholder="Nome do grupo"
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                style={styles.nameInput}
                value={name}
              />
              {name ? (
                <Pressable
                  accessibilityLabel="Limpar nome do grupo"
                  accessibilityRole="button"
                  disabled={saving}
                  hitSlop={8}
                  onPress={() => setName("")}
                >
                  <Ionicons color={colors.textMuted} name="close-circle" size={19} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel={selectedVenue ? `Trocar local, ${selectedVenue.name}` : "Selecionar local"} onPress={() => setVenuePickerOpen((open) => !open)} style={styles.venuePickerButton}><View style={styles.venuePickerCopy}><Text style={styles.venuePickerLabel}>{selectedVenue ? selectedVenue.name : "Selecionar local"}</Text>{selectedVenue ? <Text style={styles.venuePickerMeta}>{selectedVenue.category}{selectedVenue.address ? ` · ${selectedVenue.address}` : ""}</Text> : null}</View><Ionicons color={colors.textMuted} name={venuePickerOpen ? "chevron-up" : "chevron-down"} size={18} /></Pressable>

          <View style={[styles.sectionTopRow, styles.hidden]}>
            <View>
              <Text style={styles.sectionLabel}>ESCOLHA O LOCAL</Text>
              <Text style={styles.sectionHint}>Locais disponíveis agora no aplicativo</Text>
            </View>
            {selectedVenue ? (
              <View style={styles.selectedPill}>
                <Ionicons color={colors.success} name="checkmark-circle" size={14} />
                <Text style={styles.selectedPillText}>Selecionado</Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.searchShell, !venuePickerOpen && styles.hidden]}>
            <Ionicons color={colors.textMuted} name="search" size={18} />
            <TextInput
              accessibilityLabel="Buscar local"
              autoCapitalize="none"
              editable={!saving}
              onChangeText={setVenueQuery}
              placeholder="Buscar por nome, categoria ou endereço"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              style={styles.searchInput}
              value={venueQuery}
            />
            {venueQuery ? (
              <Pressable
                accessibilityLabel="Limpar busca de local"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setVenueQuery("")}
              >
                <Ionicons color={colors.textMuted} name="close-circle" size={18} />
              </Pressable>
            ) : null}
          </View>

          {loadingVenues ? (
            <View style={styles.inlineState}>
              <ActivityIndicator color={colors.brand} size="small" />
              <Text style={styles.inlineStateTitle}>Carregando locais</Text>
              <Text style={styles.inlineStateText}>Só mais um instante.</Text>
            </View>
          ) : venuesError ? (
            <View style={styles.errorState}>
              <View style={styles.errorStateIcon}>
                <Ionicons color={colors.danger} name="cloud-offline-outline" size={23} />
              </View>
              <View style={styles.errorStateCopy}>
                <Text style={styles.errorStateTitle}>Locais indisponíveis</Text>
                <Text style={styles.errorStateText}>{venuesError}</Text>
              </View>
              <Pressable
                accessibilityLabel="Tentar carregar locais novamente"
                accessibilityRole="button"
                onPress={() => void loadVenues()}
              >
                <Text style={styles.retryText}>Tentar</Text>
              </Pressable>
            </View>
          ) : filteredVenues.length === 0 ? (
            <View style={styles.inlineState}>
              <Ionicons color={colors.brand} name="search-outline" size={25} />
              <Text style={styles.inlineStateTitle}>Nenhum local encontrado</Text>
              <Pressable onPress={() => setVenueQuery("")}>
                <Text style={styles.clearText}>Limpar busca</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.venuesList, !venuePickerOpen && styles.hidden]}>
              {filteredVenues.map((venue) => {
                const selected = selectedVenueId === venue.id;
                const isOpen = venue.status.toUpperCase() === "OPEN";

                return (
                  <Pressable
                    accessibilityLabel={`Selecionar ${venue.name}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected, disabled: saving }}
                    disabled={saving}
                    key={venue.id}
                    onPress={() => {
                      setSelectedVenueId(venue.id);
                      setVenuePickerOpen(false);
                      if (error) setError("");
                    }}
                    style={({ pressed }) => [
                      styles.venueCard,
                      selected && styles.venueCardSelected,
                      pressed && !saving && styles.cardPressed,
                    ]}
                  >
                    {venue.image ? (
                      <Image source={{ uri: venue.image }} style={styles.venueImage} />
                    ) : (
                      <View style={styles.venuePlaceholder}>
                        <Ionicons color={colors.brand} name="location-outline" size={22} />
                      </View>
                    )}
                    <View style={styles.venueCopy}>
                      <Text numberOfLines={1} style={styles.venueName}>
                        {venue.name}
                      </Text>
                      <Text numberOfLines={1} style={styles.venueMeta}>
                        {venue.category}
                        {venue.distance ? ` · ${venue.distance}` : ""}
                      </Text>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, !isOpen && styles.statusDotClosed]} />
                        <Text style={[styles.statusText, !isOpen && styles.statusTextClosed]}>
                          {isOpen ? "Aberto agora" : "Fechado"}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? (
                        <Ionicons color={colors.background} name="checkmark" size={15} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.friendsSection}><Text style={styles.sectionLabel}>ADICIONAR AMIGOS</Text>
          <Text style={styles.sectionHint}>Selecione amigos para convidar</Text>
          {selectedFriendIds.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedFriends}>
              {selectedFriendIds.map((friendId) => {
                const friend = friends.find((item) => item.id === friendId);
                if (!friend) return null;
                return <Pressable key={friend.id} accessibilityRole="button" accessibilityLabel={`Remover ${friend.name}`} onPress={() => toggleFriend(friend.id)} style={styles.selectedFriend}><UserAvatar name={friend.name} uri={resolveBackendMediaUrl(friend.avatar)} size={22} /><Text numberOfLines={1} style={styles.selectedFriendText}>{friend.name.split(" ")[0]}</Text><Ionicons color={colors.brand} name="close" size={13} /></Pressable>;
              })}
            </ScrollView>
          ) : null}
          {loadingFriends ? (
            <View style={styles.inlineState}><ActivityIndicator color={colors.brand} size="small" /><Text style={styles.inlineStateTitle}>Carregando amigos</Text></View>
          ) : friendsError ? (
            <View style={styles.errorState}><Ionicons color={colors.danger} name="cloud-offline-outline" size={20} /><Text style={styles.errorStateText}>{friendsError}</Text><Pressable accessibilityRole="button" onPress={() => void friendsQuery.refetch()}><Text style={styles.retryText}>Tentar</Text></Pressable></View>
          ) : friends.length === 0 ? (
            <View style={styles.inlineState}><Text style={styles.inlineStateText}>Você ainda não adicionou amigos.</Text></View>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => {
                const selected = selectedFriendIds.includes(friend.id);
                return <Pressable key={friend.id} accessibilityLabel={`Selecionar ${friend.name}`} accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: saving }} disabled={saving} onPress={() => toggleFriend(friend.id)} style={({ pressed }) => [styles.friendRow, selected && styles.friendRowSelected, pressed && styles.cardPressed]}><UserAvatar name={friend.name} uri={resolveBackendMediaUrl(friend.avatar)} size={44} /><View style={styles.friendCopy}><Text style={styles.friendName}>{friend.name}</Text></View><View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <Ionicons color={colors.background} name="checkmark" size={15} /> : null}</View></Pressable>;
              })}
            </View>
          )}</View>

          {error ? (
            <View accessibilityLiveRegion="polite" style={styles.formError}>
              <Ionicons color={colors.danger} name="alert-circle-outline" size={19} />
              <Text style={styles.formErrorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            accessibilityLabel={saving ? "Criando grupo" : "Criar grupo"}
            accessibilityRole="button"
            accessibilityState={{ busy: saving, disabled: saving }}
            disabled={saving}
            onPress={() => void handleCreate()}
            style={({ pressed }) => [
              styles.createButton,
              styles.hidden,
              saving && styles.buttonDisabled,
              pressed && !saving && styles.primaryPressed,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Ionicons color={colors.background} name="people" size={19} />
            )}
            <Text style={styles.createButtonText}>
              {saving ? "Criando grupo..." : "Criar grupo"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Cancelar criação do grupo"
            accessibilityRole="button"
            disabled={saving}
            onPress={goBack}
            style={({ pressed }) => [styles.cancelButton, styles.hidden, pressed && !saving && styles.pressed]}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </ScreenContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: colors.background, flex: 1 },
  hidden: { display: "none" },
  headerCreate: { position: "absolute", right: 16, top: 16, zIndex: 2 },
  headerCreateDisabled: { opacity: 0.35 },
  headerCreateText: { color: colors.brand, fontFamily: fonts.bold, fontSize: 14 },
  scrollContent: { paddingBottom: 62, paddingTop: 16 },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 7,
    marginBottom: 18,
    minHeight: 36,
  },
  backText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  steps: { alignItems: "center", flexDirection: "row", marginTop: 22 },
  stepActive: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: 7,
    minHeight: 32,
    paddingHorizontal: 11,
  },
  step: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 32,
    paddingHorizontal: 11,
  },
  stepComplete: { backgroundColor: colors.success, borderColor: colors.success },
  stepLine: { backgroundColor: colors.borderStrong, flex: 1, height: 1, marginHorizontal: 8 },
  stepNumberActive: { color: colors.background, fontFamily: fonts.bold, fontSize: 10 },
  stepLabelActive: { color: colors.background, fontFamily: fonts.bold, fontSize: 10 },
  stepNumber: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10 },
  stepLabel: { color: colors.textMuted, fontFamily: fonts.semibold, fontSize: 10 },
  stepLabelComplete: { color: colors.background },
  sectionCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  avatarPlaceholder: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.elevated, borderColor: colors.borderStrong, borderRadius: 32, borderStyle: "dashed", borderWidth: 2, height: 64, justifyContent: "center", marginBottom: 14, width: 64 },
  avatarPlaceholderText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 8, marginTop: 3 },
  sectionHeader: { alignItems: "center", flexDirection: "row" },
  sectionIcon: {
    alignItems: "center",
    backgroundColor: colors.brandSoft,
    borderRadius: radii.small,
    height: 42,
    justifyContent: "center",
    marginRight: 11,
    width: 42,
  },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  sectionSubtitle: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 3 },
  counter: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 10, marginLeft: 8 },
  inputShell: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderColor: colors.borderStrong,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 15,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  nameInput: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    minHeight: 50,
    paddingRight: 10,
    paddingVertical: 0,
  },
  sectionTopRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  sectionLabel: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.2 },
  sectionHint: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 4 },
  venuePickerButton: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.medium, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 12, minHeight: 56, paddingHorizontal: 14 },
  venuePickerCopy: { flex: 1, minWidth: 0 },
  venuePickerLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  venuePickerMeta: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 4 },
  friendsSection: { marginTop: 16 },
  selectedPill: {
    alignItems: "center",
    backgroundColor: colors.successSoft,
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  selectedPillText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 9 },
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
    fontSize: 12,
    minHeight: 48,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  venuesList: { marginTop: 10 },
  selectedFriends: { gap: 8, paddingVertical: 10 },
  selectedFriend: { alignItems: "center", backgroundColor: colors.brandSoft, borderColor: colors.brandBorder, borderRadius: radii.pill, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  selectedFriendText: { color: colors.brand, fontFamily: fonts.medium, fontSize: 11, maxWidth: 80 },
  friendsList: { marginTop: 10 },
  friendRow: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, flexDirection: "row", gap: 12, marginBottom: 8, minHeight: 64, padding: 10 },
  friendRowSelected: { backgroundColor: colors.brandSoft, borderColor: colors.brandBorder },
  friendCopy: { flex: 1, minWidth: 0 },
  friendName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  venueCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 9,
    minHeight: 84,
    padding: 10,
  },
  venueCardSelected: { backgroundColor: colors.brandSoft, borderColor: colors.brandBorder },
  venueImage: { backgroundColor: colors.elevated, borderRadius: radii.medium, height: 62, width: 62 },
  venuePlaceholder: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.medium,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  venueCopy: { flex: 1, marginHorizontal: 12, minWidth: 0 },
  venueName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  venueMeta: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 4 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 5, marginTop: 6 },
  statusDot: { backgroundColor: colors.success, borderRadius: 3, height: 6, width: 6 },
  statusDotClosed: { backgroundColor: colors.textMuted },
  statusText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 9 },
  statusTextClosed: { color: colors.textMuted },
  radio: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  radioSelected: { backgroundColor: colors.brand, borderColor: colors.brand },
  inlineState: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 150,
    padding: 20,
  },
  inlineStateTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12, marginTop: 9 },
  inlineStateText: { color: colors.textMuted, fontFamily: fonts.regular, fontSize: 10, marginTop: 4 },
  clearText: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 10, marginTop: 8 },
  errorState: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(239, 125, 125, 0.2)",
    borderRadius: radii.large,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 10,
    padding: 13,
  },
  errorStateIcon: {
    alignItems: "center",
    backgroundColor: colors.elevated,
    borderRadius: radii.small,
    height: 42,
    justifyContent: "center",
    marginRight: 11,
    width: 42,
  },
  errorStateCopy: { flex: 1, minWidth: 0 },
  errorStateTitle: { color: colors.danger, fontFamily: fonts.semibold, fontSize: 11 },
  errorStateText: { color: colors.textSecondary, fontFamily: fonts.regular, fontSize: 9, lineHeight: 13, marginTop: 3 },
  retryText: { color: colors.danger, fontFamily: fonts.bold, fontSize: 10, marginLeft: 10 },
  formError: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "rgba(239, 125, 125, 0.2)",
    borderRadius: radii.small,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 14,
    padding: 12,
  },
  formErrorText: { color: colors.textSecondary, flex: 1, fontFamily: fonts.regular, fontSize: 11, lineHeight: 16 },
  createButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radii.medium,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 54,
  },
  createButtonText: { color: colors.background, fontFamily: fonts.bold, fontSize: 13 },
  cancelButton: { alignItems: "center", justifyContent: "center", marginTop: 8, minHeight: 46 },
  cancelButtonText: { color: colors.textSecondary, fontFamily: fonts.semibold, fontSize: 12 },
  buttonDisabled: { opacity: 0.58 },
  primaryPressed: { backgroundColor: colors.brandPressed, transform: [{ scale: 0.99 }] },
  cardPressed: { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.995 }] },
  pressed: { opacity: 0.76 },
});
