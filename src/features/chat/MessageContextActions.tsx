import { useEffect, useRef, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type Position = { x: number; y: number };
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

type MenuProps = { position: Position; onEdit: () => void; onDelete: () => void; onCancel: () => void };
export function MessageActionMenu({ position, onEdit, onDelete, onCancel }: MenuProps) {
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

  return <View ref={menuRef} accessibilityRole="menu" style={[styles.menu, { left: Math.max(8, Math.min(position.x, 260)), top: Math.max(8, position.y - 8) }]}>
    <Pressable accessibilityLabel="Editar mensagem" accessibilityRole="menuitem" onPress={onEdit} style={styles.item}><Text style={styles.label}>Editar</Text></Pressable>
    <Pressable accessibilityLabel="Excluir mensagem" accessibilityRole="menuitem" onPress={onDelete} style={styles.item}><Text style={styles.label}>Excluir</Text></Pressable>
    <Pressable accessibilityLabel="Cancelar ações" accessibilityRole="menuitem" onPress={onCancel} style={styles.item}><Text style={styles.label}>Cancelar</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  target: { flexGrow: 0, flexShrink: 0, position: "relative" },
  ownTarget: { alignSelf: "flex-end", maxWidth: "75%" },
  otherTarget: { alignSelf: "flex-start", maxWidth: "75%" },
  menu: { backgroundColor: "#29261f", borderRadius: 8, elevation: 12, minWidth: 130, paddingVertical: 4, position: "absolute", zIndex: 1000 },
  item: { paddingHorizontal: 12, paddingVertical: 8 },
  label: { color: "#fff", fontSize: 12 },
});
