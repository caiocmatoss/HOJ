import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Friend } from "@/services/api/resources/friends";
import type { Group } from "@/services/api/resources/groups";
import { colors, fonts, radii } from "@/theme/tokens";

export type ForwardTarget = { targetType: "DIRECT" | "GROUP"; targetId: string };

export function ForwardPicker({ visible, friends, groups, onSelect, onClose }: { visible: boolean; friends: Friend[]; groups: Group[]; onSelect: (target: ForwardTarget) => void; onClose: () => void }) {
  return <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable accessibilityRole="button" accessibilityLabel="Fechar destinos" onPress={onClose} style={styles.backdrop} />
      <View style={styles.card}>
        <View style={styles.header}><Text style={styles.title}>Encaminhar para</Text><Pressable accessibilityLabel="Cancelar encaminhamento" onPress={onClose}><Text style={styles.cancel}>Cancelar</Text></Pressable></View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>Amigos</Text>
          {friends.map((friend) => <Pressable key={`friend-${friend.id}`} accessibilityRole="button" onPress={() => onSelect({ targetType: "DIRECT", targetId: friend.id })} style={styles.destination}><Text style={styles.destinationName}>{friend.name}</Text></Pressable>)}
          <Text style={styles.section}>Grupos</Text>
          {groups.map((group) => <Pressable key={`group-${group.id}`} accessibilityRole="button" onPress={() => onSelect({ targetType: "GROUP", targetId: group.id })} style={styles.destination}><Text style={styles.destinationName}>{group.name}</Text></Pressable>)}
          {!friends.length && !groups.length ? <Text style={styles.empty}>Nenhum destino disponível.</Text> : null}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { alignItems: "center", flex: 1, justifyContent: "center", padding: 20 },
  backdrop: { backgroundColor: "rgba(0,0,0,0.55)", ...StyleSheet.absoluteFill },
  card: { backgroundColor: colors.elevated, borderColor: colors.border, borderRadius: radii.large, borderWidth: 1, maxHeight: "75%", width: "100%", maxWidth: 360, zIndex: 1 },
  header: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 16 },
  title: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  cancel: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 11 },
  content: { padding: 14 },
  section: { color: colors.brand, fontFamily: fonts.semibold, fontSize: 10, marginBottom: 6, marginTop: 8, textTransform: "uppercase" },
  destination: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 12 },
  destinationName: { color: colors.text, fontFamily: fonts.regular, fontSize: 13 },
  empty: { color: colors.textMuted, fontSize: 12, paddingVertical: 20, textAlign: "center" },
});
