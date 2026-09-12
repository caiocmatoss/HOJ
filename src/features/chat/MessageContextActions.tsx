import { useEffect, useRef, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { ReactionSummary, ReactionType } from "@/services/api/resources/messages";

type Position = { x: number; y: number };
const SAFE_MARGIN = 16;
const MENU_WIDTH = 220;
const MENU_HEIGHT = 132;

function clampMenuPosition(position: Position): Position {
  const viewportWidth = typeof window !== "undefined" && window.innerWidth > 0 ? window.innerWidth : 390;
  const viewportHeight = typeof window !== "undefined" && window.innerHeight > 0 ? window.innerHeight : 844;
  const maxX = Math.max(SAFE_MARGIN, viewportWidth - MENU_WIDTH - SAFE_MARGIN);
  const maxY = Math.max(SAFE_MARGIN, viewportHeight - MENU_HEIGHT - SAFE_MARGIN);
  return {
    x: Math.min(Math.max(position.x, SAFE_MARGIN), maxX),
    y: Math.min(Math.max(position.y - 8, SAFE_MARGIN), maxY),
  };
}
type TargetProps = { enabled: boolean; own?: boolean; children: ReactNode; onOpen: (position: Position) => void };

export function MessageContextActions({ enabled, own = false, children, onOpen }: TargetProps) {
  const targetRef = useRef<View>(null);
  useEffect(() => {
    if (!enabled || Platform.OS !== "web") return;
    const target = targetRef.current as unknown as HTMLElement | null;
    if (!target) return;
    const onContextMenu = (event: MouseEvent) => { event.preventDefault(); onOpen({ x: event.clientX, y: event.clientY }); };
    target.addEventListener("contextmenu", onContextMenu);
    return () => target.removeEventListener("contextmenu", onContextMenu);
  }, [enabled, onOpen]);
  if (!enabled) return <>{children}</>;
  return <Pressable accessibilityRole="button" accessibilityLabel="Ações da mensagem" onLongPress={() => onOpen({ x: 24, y: 180 })} ref={targetRef} style={[styles.target, own ? styles.ownTarget : styles.otherTarget]}>{children}</Pressable>;
}

type MenuProps = { position: Position; own?: boolean; myReaction?: ReactionType | null; reactions?: ReactionSummary[]; onReaction?: (type: ReactionType) => void; onEdit: () => void; onDelete: () => void; onCancel: () => void };
export function MessageActionMenu({ position, own = false, myReaction, onReaction, onEdit, onDelete, onCancel }: MenuProps) {
  const menuRef = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onOutsidePointer = (event: PointerEvent) => {
      if (event.button === 2) return;
      const menu = menuRef.current as unknown as HTMLElement | null;
      if (!menu || !(event.target instanceof Node) || !menu.contains(event.target)) onCancel();
    };
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); };
    document.addEventListener("pointerdown", onOutsidePointer);
    document.addEventListener("keydown", onEscape);
    return () => { document.removeEventListener("pointerdown", onOutsidePointer); document.removeEventListener("keydown", onEscape); };
  }, [onCancel]);

  const types: Array<[ReactionType, string]> = [["LIKE", "👍"], ["LOVE", "❤️"], ["LAUGH", "😂"], ["WOW", "😮"], ["SAD", "😢"], ["FIRE", "🔥"]];
  const safePosition = clampMenuPosition(position);
  return <View ref={menuRef} accessibilityRole="menu" style={[styles.menu, { left: safePosition.x, top: safePosition.y }]}>
    <View style={styles.reactions}>{types.map(([type, emoji]) => <Pressable key={type} accessibilityLabel={`Reagir ${type}`} onPress={() => onReaction?.(type)} style={[styles.reaction, myReaction === type && styles.reactionSelected]}><Text style={styles.emoji}>{emoji}</Text></Pressable>)}</View>
    {own ? <Pressable accessibilityLabel="Editar mensagem" accessibilityRole="menuitem" onPress={onEdit} style={styles.item}><Text style={styles.label}>Editar</Text></Pressable> : null}
    {own ? <Pressable accessibilityLabel="Excluir mensagem" accessibilityRole="menuitem" onPress={onDelete} style={styles.item}><Text style={styles.label}>Excluir</Text></Pressable> : null}
    <Pressable accessibilityLabel="Cancelar ações" accessibilityRole="menuitem" onPress={onCancel} style={styles.item}><Text style={styles.label}>Cancelar</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  target: { flexGrow: 0, flexShrink: 0, position: "relative" },
  ownTarget: { alignSelf: "flex-end", maxWidth: "75%" },
  otherTarget: { alignSelf: "flex-start", maxWidth: "75%" },
  menu: { backgroundColor: "#29261f", borderRadius: 8, elevation: 12, minWidth: MENU_WIDTH, paddingVertical: 4, position: "absolute", zIndex: 1000 },
  item: { paddingHorizontal: 12, paddingVertical: 8 },
  label: { color: "#fff", fontSize: 12 },
  reactions: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingVertical: 5 },
  reaction: { padding: 3 },
  reactionSelected: { backgroundColor: "#514a3d", borderRadius: 5 },
  emoji: { fontSize: 18 },
});
